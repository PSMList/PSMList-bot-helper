import express from "express";
import cors from "cors";
import mysql from "mysql2";
import { DB as dbConfig } from "./secret.js";
import { API_PORT } from "./config.js";

const pool = mysql.createPool({
  connectionLimit: 20,
  port: 3306,
  ...dbConfig,
});

pool.getConnection((err) => {
  if (!err) {
    console.log("Database is connected!");
  }
});

function poolQuery(query, args) {
  return new Promise((resolve, reject) => {
    pool.query(query, args, (err, results, fields) => {
      if (!err) {
        resolve(results, fields);
      } else {
        reject(err);
      }
    });
  });
}

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));

const api = express.Router();
app.use("/api", api);

const ship = express.Router();
api.use("/ship", ship);

const fort = express.Router();
api.use("/fort", fort);

const crew = express.Router();
api.use("/crew", crew);

const treasure = express.Router();
api.use("/treasure", treasure);

const equipment = express.Router();
api.use("/equipment", equipment);

const event = express.Router();
api.use("/event", event);

const keyword = express.Router();
api.use("/keyword", keyword);

function formatExactRegex(regex) {
  if (!(regex.startsWith('"') && regex.endsWith('"'))) {
    regex = `%${regex}%`;
  } else {
    regex = `${regex.slice(1, -1)}`;
  }
  return regex;
}

const checkIfNotCustom = "e.custom = 0";
const selectCustomColumn = `i.*, e.custom`;
const idSplitRegex = new RegExp(/^([A-Z]+)?([A-Z]+-)?(\d+-?[ABCG]?)$/);
const sortById = "ORDER BY e.searchsort, i.numid";
const sortByName = "ORDER BY i.name, e.searchsort, i.numid";

function customConditionFromRequest(req) {
  if (!req.query || !req.query.custom) {
    return checkIfNotCustom;
  }
  switch (req.query.custom) {
    case "include":
      return "e.ispublic = 1";
    case "only":
      return "(e.custom = 1 AND e.ispublic = 1)";
    default:
      return checkIfNotCustom;
  }
}

function allItemsQuery(type, req) {
  const hasFaction = type !== "equipment" && type !== "treasure";
  return `SELECT ${selectCustomColumn}, e.short as extensionname ${
    hasFaction ? ", f.nameimg as factionimg" : ""
  } FROM ${itemsTableWithExtension(type)} ${
    hasFaction ? "LEFT JOIN faction as f ON f.id = i.idfaction" : ""
  } WHERE ${customConditionFromRequest(req)};`;
}

function itemsTableWithExtension(type) {
  return `${type} as i LEFT JOIN extension as e ON e.id = i.idextension`;
}

/*
 * /ship
 */

ship.get("/", (req, res) => {
  poolQuery(allItemsQuery("ship", req))
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

ship.get("/id/:ship", (req, res) => {
  const shipID = req.params.ship.substring(0, 10).toUpperCase();

  if (shipID.length === 0 || shipID.length !== req.params.ship.length) {
    return res.json([]);
  }

  const parts = idSplitRegex.exec(shipID);

  if (!parts) {
    return res.json([]);
  }

  const extensionShort = parts[1],
    prefix = parts[2],
    numID = parts[3];

  const numIdRegex = `^([a-zA-Z]+-)?${prefix ?? ""}0*${numID}g?$`;

  const query = `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
    "ship"
  )} WHERE ${customConditionFromRequest(req)} AND i.idtype != 2 AND numid REGEXP ? ${
    extensionShort ? " AND (e.short = ? OR e.shortcommunity = ? OR e.shortwizkids = ?)" : ""
  } ${sortById};`;
  const params = extensionShort ? [numIdRegex, extensionShort, extensionShort, extensionShort] : [numIdRegex];

  poolQuery(query, params)
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      // error will be an Error if one occurred during the query
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

ship.get("/name/:ship", (req, res) => {
  const shipName = req.params.ship.substring(0, 30).toUpperCase();

  if (shipName.length === 0 || shipName.length !== req.params.ship.length) {
    return res.json([]);
  }

  poolQuery(
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension("ship")} WHERE ${customConditionFromRequest(
      req
    )} AND i.idtype != 2 AND i.name LIKE ? ${sortByName};`,
    formatExactRegex(shipName)
  )
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /fort
 */

fort.get("/", (req, res) => {
  res.json({ error: "Not available!" });
});

fort.get("/id/:fort", (req, res) => {
  const fortID = req.params.fort.substring(0, 10).toUpperCase();

  if (fortID.length === 0 || fortID.length !== req.params.fort.length) {
    return res.json([]);
  }

  const parts = idSplitRegex.exec(fortID);

  if (!parts) {
    return res.json([]);
  }

  const extensionShort = parts[1],
    prefix = parts[2],
    numID = parts[3];

  const numIdRegex = `^([a-zA-Z]+-)?${prefix ?? ""}0*${numID}$`;

  const query = `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
    "ship"
  )} WHERE ${customConditionFromRequest(req)} AND i.idtype = 2 AND numid REGEXP ? ${
    extensionShort
      ? " AND idextension = (SELECT id FROM extension WHERE short = ? OR shortcommunity = ? OR shortwizkids = ?)"
      : ""
  };`;
  const params = extensionShort ? [numIdRegex, extensionShort, extensionShort, extensionShort] : [numIdRegex];

  poolQuery(query, params)
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

fort.get("/name/:fort", (req, res) => {
  const fortName = req.params.fort.substring(0, 30).toUpperCase();

  if (fortName.length === 0 || fortName.length !== req.params.fort.length) {
    return res.json([]);
  }

  poolQuery(
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension("ship")} WHERE ${customConditionFromRequest(
      req
    )} AND i.idtype = 2 AND i.name LIKE ?;`,
    formatExactRegex(shipName)
  )
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /crew
 */

crew.get("/", (req, res) => {
  poolQuery(allItemsQuery("crew", req))
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

crew.get("/id/:crew", (req, res) => {
  const crewID = req.params.crew.substring(0, 10).toUpperCase();

  if (crewID.length === 0 || crewID.length !== req.params.crew.length) {
    return res.json([]);
  }

  const parts = idSplitRegex.exec(crewID);

  if (!parts) {
    return res.json([]);
  }

  const extensionShort = parts[1],
    prefix = parts[2],
    numID = parts[3];

  const numIdRegex = `^([a-zA-Z]+-)?${prefix ?? ""}0*${numID}-?[abc]?$`;

  const query = `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
    "crew"
  )} WHERE ${customConditionFromRequest(req)} AND numid REGEXP ? ${
    extensionShort
      ? " AND idextension = (SELECT id FROM extension WHERE short = ? OR shortcommunity = ? OR shortwizkids = ?)"
      : ""
  };`;
  const params = extensionShort ? [numIdRegex, extensionShort, extensionShort, extensionShort] : [numIdRegex];

  poolQuery(query, params)
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

crew.get("/name/:crew", (req, res) => {
  const crewName = req.params.crew.substring(0, 30).toUpperCase();

  if (crewName.length === 0 || crewName.length !== req.params.crew.length) {
    return res.json([]);
  }

  poolQuery(
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension("crew")} WHERE ${customConditionFromRequest(
      req
    )} AND i.name LIKE ?;`,
    formatExactRegex(crewName)
  )
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /treasure
 */

treasure.get("/", (req, res) => {
  poolQuery(allItemsQuery("treasure", req))
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

treasure.get("/id/:treasure", (req, res) => {
  const treasureID = req.params.treasure.substring(0, 10).toUpperCase();

  if (treasureID.length === 0 || treasureID.length !== req.params.treasure.length) {
    return res.json([]);
  }

  const parts = idSplitRegex.exec(treasureID);

  if (!parts) {
    return res.json([]);
  }

  const extensionShort = parts[1],
    prefix = parts[2],
    numID = parts[3];

  const numIdRegex = `^${prefix ?? ""}0*${numID}[bg]?$`;

  const query = `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
    "treasure"
  )} WHERE ${customConditionFromRequest(req)} AND numid REGEXP ? ${
    extensionShort
      ? " AND idextension = (SELECT id FROM extension WHERE short = ? OR shortcommunity = ? OR shortwizkids = ?)"
      : ""
  };`;
  const params = extensionShort ? [numIdRegex, extensionShort, extensionShort, extensionShort] : [numIdRegex];

  poolQuery(query, params)
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

treasure.get("/name/:treasure", (req, res) => {
  const treasureName = req.params.treasure.substring(0, 30).toUpperCase();

  if (treasureName.length === 0 || treasureName.length !== req.params.treasure.length) {
    return res.json([]);
  }

  poolQuery(
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension("treasure")} WHERE ${customConditionFromRequest(
      req
    )} AND i.name LIKE ?;`,
    formatExactRegex(treasureName)
  )
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /equipment
 */

equipment.get("/", (req, res) => {
  poolQuery(allItemsQuery("equipment", req))
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

equipment.get("/id/:equipment", (req, res) => {
  const equipmentID = req.params.equipment.substring(0, 10).toUpperCase();

  if (equipmentID.length === 0 || equipmentID.length !== req.params.equipment.length) {
    return res.json([]);
  }

  const parts = idSplitRegex.exec(equipmentID);

  if (!parts) {
    return res.json([]);
  }

  const extensionShort = parts[1],
    prefix = parts[2],
    numID = parts[3];

  const numIdRegex = `^${prefix ?? ""}0*${numID}a?$`;

  const query = `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
    "equipment"
  )} WHERE ${customConditionFromRequest(req)} AND numid REGEXP ? ${
    extensionShort
      ? " AND idextension = (SELECT id FROM extension WHERE short = ? OR shortcommunity = ? OR shortwizkids = ?)"
      : ""
  };`;
  const params = extensionShort ? [numIdRegex, extensionShort, extensionShort, extensionShort] : [numIdRegex];

  poolQuery(query, params)
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

equipment.get("/name/:equipment", (req, res) => {
  const equipmentName = req.params.equipment.substring(0, 30).toUpperCase();

  if (equipmentName.length === 0 || equipmentName.length !== req.params.equipment.length) {
    return res.json([]);
  }

  poolQuery(
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension("equipment")} WHERE ${customConditionFromRequest(
      req
    )} AND i.name LIKE ?;`,
    formatExactRegex(treasureName)
  )
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /event
 */

event.get("/", (req, res) => {
  res.json({ error: "Not implemented yet!" });
});

event.get("/id/:event", (req, res) => {
  res.json({ error: "Not implemented yet!" });
});

event.get("/name/:event", (req, res) => {
  res.json({ error: "Not implemented yet!" });
});

/*
 * /keyword
 */

keyword.get("/", (req, res) => {
  poolQuery("SELECT * FROM keyword;")
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

keyword.get("/id/:keyword", (req, res) => {
  res.json([]);
});

keyword.get("/name/:keyword", (req, res) => {
  const keywordName = req.params.keyword.substring(0, 30).toUpperCase();

  if (keywordName.length === 0 || keywordName.length !== req.params.keyword.length) {
    return res.json([]);
  }

  poolQuery("SELECT * FROM keyword WHERE shortname LIKE ?;", formatExactRegex(keywordName))
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

keyword.get("/category", (req, res) => {
  poolQuery("SELECT * FROM kw_category;")
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

keyword.get("/target", (req, res) => {
  poolQuery("SELECT * FROM kw_target;")
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /faction
 */

api.get("/faction", (req, res) => {
  poolQuery(`SELECT * FROM faction as e WHERE ${customConditionFromRequest(req).replace("e.ispublic = 1", "1 = 1")};`)
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /extension
 */

api.get("/extension", (req, res) => {
  poolQuery(
    `SELECT e.*, i1.name as imagebackground, i2.name as exticon
							 FROM extension as e
							 LEFT JOIN image as i1 ON i1.id = e.idimagebackgroundexpansion
							 LEFT JOIN image as i2 ON i2.id = e.idimageiconexpansion
							 WHERE ${customConditionFromRequest(req)};`.replace(/^ */gm, "")
  )
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /rarity
 */

api.get("/rarity", (req, res) => {
  poolQuery("SELECT * FROM rarity;")
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * /technicalshape
 */

api.get("/technicalshape", (req, res) => {
  poolQuery("SELECT * FROM technicalshape;")
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
});

/*
 * not found
 */

api.get("*", (req, res) => {
  res.status(404).json({});
});

app.listen(API_PORT, () => {
  console.log(`API is running on port ${API_PORT}`);
});

process.on("exit", () =>
  pool.end((err) => {
    // all connections in the pool have ended
    console.trace(err);
  })
);
