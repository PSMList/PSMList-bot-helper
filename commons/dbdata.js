import fetch from 'node-fetch';
import { API_URI } from '../config.js';

export const tablesTitleMap = {
    extension: 'Expansions',
    faction: 'Factions',
    rarity: 'Rarities',
    'keyword/category': 'Keyword categories',
    'keyword/target': 'Keyword targets'
}

export const tables = Object.keys(tablesTitleMap);

async function loadData(type) {
    const exports = {};

    const data = await fetch(`${API_URI}/${type}`).then(res => res.json()); // expected to throw error and quit process if api is unreachable

    if (!data) {
        return;
    }

    switch (type) {
        case 'faction':
            for (let { id, nameimg, defaultname } of data) {
                if (id && nameimg && defaultname) {
                    exports[id] = { nameimg, name: defaultname };
                }
            }
            break;
        case 'extension':
            for (let { id, name, short, shortcommunity, shortwizkids } of data) {
                if (id && name && short && shortwizkids) {
                    exports[id] = { name, short, shortcommunity, shortwizkids };
                }
            }
            break;
        case 'rarity':
            for (let { id, colorhex, defaultname } of data) {
                if (id && defaultname && colorhex) {
                    exports[id] = {
                        colorhex,
                        name: defaultname
                    };
                }
            }
            break;
        case 'keyword/category':
        case 'keyword/target':
            for (let { id, name } of data) {
                if (id && name) {
                    exports[id] = { name };
                }
            }
            break;
    }

    return exports;
}

export const dbDataPromise = Promise.all(tables.map(table => loadData(table)));

const dbData = {};

export default dbData;

await dbDataPromise
    .then( results => {
        results.forEach((data, index) => {
            const table = tables[index];
            dbData[table] = data;
        });
    });