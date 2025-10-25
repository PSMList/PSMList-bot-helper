import fetch from "node-fetch";
import { API_URI } from "../config.js";

export const tablesTitleMap = {
  extension: "Expansions",
  faction: "Factions",
  rarity: "Rarities",
  "keyword/category": "Keyword categories",
  "keyword/target": "Keyword targets",
  "island/terrain": "Island terrains",
  technicalshape: "Technical shapes",
  shiptype: "Ship types",
};

export const tables = Object.keys(tablesTitleMap);

async function loadData(type) {
  const exports = {};

  // expected to throw error and quit process if api is unreachable
  const data = await fetch(`${API_URI}/${type}?custom=include`, {
    signal: AbortSignal.timeout(10000),
  }).then((res) => res.json());

  if (!data) {
    return;
  }

  switch (type) {
    case "faction":
      for (let { id, nameimg, defaultname } of data) {
        if (id && nameimg && defaultname) {
          exports[id] = { nameimg, name: defaultname };
        }
      }
      break;
    case "extension":
      for (let { id, name, short, shortcommunity, shortwizkids, custom } of data) {
        if (id && name && short) {
          exports[id] = { name, short, shortcommunity, shortwizkids, custom };
        }
      }
      break;
    case "rarity":
      for (let { id, colorhex, defaultname } of data) {
        if (id && defaultname && colorhex) {
          exports[id] = {
            colorhex,
            name: defaultname,
          };
        }
      }
      break;
    case "keyword/category":
    case "keyword/target":
      for (let { id, name } of data) {
        if (id && name) {
          exports[id] = { name };
        }
      }
      break;
    case "island/terrain":
      for (let { id, name, nameimg, slugname, imageiconisland, island_terrain_id_1, island_terrain_id_2 } of data) {
        if (id && name) {
          exports[id] = {
            name,
            nameimg,
            slugname,
            imageiconisland,
            island_terrain_id_1,
            island_terrain_id_2,
          };
        }
      }
      break;
    case "shiptype":
      for (let { id, defaultname } of data) {
        if (id && defaultname) {
          exports[id] = { name: defaultname };
        }
      }
  }

  return exports;
}

const dbData = {};

export default dbData;

export let dbDataPromise;

function setData() {
  dbDataPromise = Promise.all(tables.map((table) => loadData(table))).then((results) => {
    results.forEach((data, index) => {
      const table = tables[index];
      dbData[table] = data;
    });
  });
}

setData();

// refresh info every day
setInterval(async () => {
  await dbDataPromise;
  setData();
}, 24 * 60 * 60 * 1000);
