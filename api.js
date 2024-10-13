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

function poolQuery(res, query, args) {
  return new Promise((resolve, reject) => {
    pool.query(query, args, (err, results, fields) => {
      if (!err) {
        resolve(results, fields);
      } else {
        reject(err);
      }
    });
  })
    .then((results) => {
      res.json(results);
    })
    .catch((err) => {
      console.trace(err);
      res.status(500).json({ error: err });
    });
}

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));

const api = express.Router();
app.use("/api", api);

const ship = express.Router();
api.use("/ship", ship);

const crew = express.Router();
api.use("/crew", crew);

const treasure = express.Router();
api.use("/treasure", treasure);

const equipment = express.Router();
api.use("/equipment", equipment);

const island = express.Router();
api.use("/island", island);

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
const idSplitRegex = new RegExp(/^([A-Z]+)?([A-Z]+-)?(\d+-?[ABCGI]?)$/);
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

function itemsTableWithExtension(type) {
  return `${type} as i LEFT JOIN extension as e ON e.id = i.idextension`;
}

function allItemsQuery(type, req) {
  const hasFaction = ["ship", "crew"].includes(type);
  return `SELECT ${selectCustomColumn}, e.short as extensionname ${
    hasFaction ? ", f.nameimg as factionimg" : ""
  } FROM ${itemsTableWithExtension(type)} ${
    hasFaction ? "LEFT JOIN faction as f ON f.id = i.idfaction" : ""
  } WHERE ${customConditionFromRequest(req)};`;
}

/*
 * /ship
 */

ship.get("/", (req, res) => {
  poolQuery(res, allItemsQuery("ship", req));
});

ship.get("/id/:ship", (req, res) => {
  const shipID = req.params.ship.toUpperCase();

  if (shipID.length > 10) {
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
  )} WHERE ${customConditionFromRequest(req)} AND numid REGEXP ? ${
    extensionShort
      ? " AND (e.short = ? OR e.shortcommunity = ? OR e.shortwizkids = ?)"
      : ""
  } ${sortById};`;
  const params = extensionShort
    ? [numIdRegex, extensionShort, extensionShort, extensionShort]
    : [numIdRegex];

  poolQuery(res, query, params);
});

ship.get("/name/:ship", (req, res) => {
  const shipName = req.params.ship.toUpperCase();

  if (shipName.length > 30) {
    return res.json([]);
  }

  poolQuery(
    res,
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
      "ship"
    )} WHERE ${customConditionFromRequest(
      req
    )} AND i.idtype != 2 AND i.name LIKE ? ${sortByName};`,
    formatExactRegex(shipName)
  );
});

/*
 * /crew
 */

crew.get("/", (req, res) => {
  poolQuery(res, allItemsQuery("crew", req));
});

crew.get("/id/:crew", (req, res) => {
  const crewID = req.params.crew.toUpperCase();

  if (crewID.length > 10) {
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

  const params = extensionShort
    ? [numIdRegex, extensionShort, extensionShort, extensionShort]
    : [numIdRegex];

  poolQuery(res, query, params);
});

crew.get("/name/:crew", (req, res) => {
  const crewName = req.params.crew.toUpperCase();

  if (crewName.length > 30) {
    return res.json([]);
  }

  poolQuery(
    res,
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
      "crew"
    )} WHERE ${customConditionFromRequest(req)} AND i.name LIKE ?;`,
    formatExactRegex(crewName)
  );
});

/*
 * /treasure
 */

treasure.get("/", (req, res) => {
  poolQuery(res, allItemsQuery("treasure", req));
});

treasure.get("/id/:treasure", (req, res) => {
  const treasureID = req.params.treasure.toUpperCase();

  if (treasureID.length > 10) {
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

  const params = extensionShort
    ? [numIdRegex, extensionShort, extensionShort, extensionShort]
    : [numIdRegex];

  poolQuery(res, query, params);
});

treasure.get("/name/:treasure", (req, res) => {
  const treasureName = req.params.treasure.toUpperCase();

  if (treasureName.length > 30) {
    return res.json([]);
  }

  poolQuery(
    res,
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
      "treasure"
    )} WHERE ${customConditionFromRequest(req)} AND i.name LIKE ?;`,
    formatExactRegex(treasureName)
  );
});

/*
 * /equipment
 */

equipment.get("/", (req, res) => {
  poolQuery(res, allItemsQuery("equipment", req));
});

equipment.get("/id/:equipment", (req, res) => {
  const equipmentID = req.params.equipment.toUpperCase();

  if (equipmentID.length > 10) {
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

  const params = extensionShort
    ? [numIdRegex, extensionShort, extensionShort, extensionShort]
    : [numIdRegex];

  poolQuery(res, query, params);
});

equipment.get("/name/:equipment", (req, res) => {
  const equipmentName = req.params.equipment.toUpperCase();

  if (equipmentName.length > 30) {
    return res.json([]);
  }

  poolQuery(
    res,
    `SELECT ${selectCustomColumn} FROM ${itemsTableWithExtension(
      "equipment"
    )} WHERE ${customConditionFromRequest(req)} AND i.name LIKE ?;`,
    formatExactRegex(equipmentName)
  );
});

/*
 * /island
 */

island.get("/", (req, res) => {
  poolQuery(res, allItemsQuery("island", req));
});

island.get("/id/:island", (req, res) => {
  const islandID = req.params.island.toUpperCase();

  if (islandID.length > 10) {
    return res.json([]);
  }

  const parts = idSplitRegex.exec(islandID);

  if (!parts) {
    return res.json([]);
  }

  const extensionShort = parts[1],
    prefix = parts[2],
    numID = parts[3];

  const numIdRegex = `^${prefix ?? ""}0*${numID}i?$`;

  const terrainQuery =
    "SELECT island_terrain_id FROM island_island_terrain WHERE island_id = i.id LIMIT 1";

  const query = `SELECT ${selectCustomColumn},
    (SELECT name FROM image WHERE image.id = i.idimageiconisland) as imageiconisland,
    (${terrainQuery}) as island_terrain_id_1,
    (${terrainQuery} OFFSET 1) as island_terrain_id_2,
    ci.slugname
    FROM ${itemsTableWithExtension("island")}
    INNER JOIN collectible_item as ci ON ci.id = i.id
    WHERE ${customConditionFromRequest(req)} AND numid REGEXP ? ${
    extensionShort
      ? " AND idextension = (SELECT id FROM extension WHERE short = ? OR shortcommunity = ? OR shortwizkids = ?)"
      : ""
  };`;

  const params = extensionShort
    ? [numIdRegex, extensionShort, extensionShort, extensionShort]
    : [numIdRegex];

  poolQuery(res, query, params);
});

island.get("/terrain", (req, res) => {
  poolQuery(res, "SELECT * FROM island_terrain;");
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
  poolQuery(res, "SELECT * FROM keyword;");
});

keyword.get("/id/:keyword", (req, res) => {
  res.json([]);
});

keyword.get("/name/:keyword", (req, res) => {
  const keywordName = req.params.keyword.toUpperCase();

  if (keywordName.length > 30) {
    return res.json([]);
  }

  poolQuery(
    res,
    "SELECT * FROM keyword WHERE shortname LIKE ?;",
    formatExactRegex(keywordName)
  );
});

keyword.get("/category", (req, res) => {
  poolQuery(res, "SELECT * FROM kw_category;");
});

keyword.get("/target", (req, res) => {
  poolQuery(res, "SELECT * FROM kw_target;");
});

/*
 * /faction
 */

api.get("/faction", (req, res) => {
  poolQuery(
    res,
    `SELECT * FROM faction as e WHERE ${customConditionFromRequest(req).replace(
      "e.ispublic = 1",
      "1 = 1"
    )};`
  );
});

/*
 * /extension
 */

api.get("/extension", (req, res) => {
  const iconsSelect =
    "icons" in req.query
      ? `,
      (SELECT name FROM image WHERE id = e.idimagebackgroundexpansion) as imagebackground,
      (SELECT name FROM image WHERE id = e.idimageiconexpansion) as exticon`
      : "";

  poolQuery(
    res,
    `SELECT e.*
      ${iconsSelect}
      FROM extension as e
      WHERE ${customConditionFromRequest(req)};`.replace(/^ */gm, "")
  );
});

/*
 * /rarity
 */

api.get("/rarity", (req, res) => {
  poolQuery(res, "SELECT * FROM rarity;");
});

/*
 * /technicalshape
 */

api.get("/technicalshape", (req, res) => {
  poolQuery(res, "SELECT * FROM technicalshape;");
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
