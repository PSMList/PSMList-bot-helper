import { emojis } from '../config.js';
import dbData, { tables, dbDataPromise } from '../commons/dbdata.js';

const embeds = {};

const tablesTitleMap = {
    extension: 'Expansions',
    faction: 'Factions',
    rarity: 'Rarities',
    'keyword/category': 'Keyword categories',
    'keyword/target': 'Keyword targets'
}

function sortByName(a, b) {
    return a.name < b.name ? -1 : 1;   
}


(async () => {
    await dbDataPromise;

    for (const table of tables) {
        const embed = embeds[table] = {
            title: tablesTitleMap[table]
        }

        switch (table) {
            case tables[0]:
                embed.description =
                    Object.values(dbData[tables[0]])
                        .sort(sortByName)
                        .reduce((output, faction) => output + emojis[faction.nameimg] + " \u200b " + faction.name + "\n", "");
                break;
            case tables[1]:
                embed.description =
                    Object.values(dbData[tables[1]])
                    // .sort(sortByName)
                    .reduce((output, extension) => output + emojis[extension.short] + " \u200b " + extension.name + " - " + extension.short + (extension.shortcommunity ? " - " + extension.shortcommunity : '') + (extension.shortwizkids ? " - " + extension.shortwizkids : '') + "\n", "");
                break;
            case tables[2]:
                embed.description =
                    Object.values(dbData[tables[2]])
                    .sort(sortByName)
                    .reduce((output, rarity) => `${output}${emojis[rarity.colorhex]} ${rarity.name}\n`, "");
                break;
            case tables[3]:
                embed.description =
                    Object.values(dbData[tables[3]])
                    .sort(sortByName)
                    .reduce((output, kw_category) => `${output} ${kw_category.name}\n`, "");
                break;
            case tables[4]:
                embed.description =
                    Object.values(dbData[tables[4]])
                    .sort(sortByName)
                    .reduce((output, kw_target) => `${output} ${kw_target.name}\n`, "");
                break;
        }
    }
})()

export default function list(table) {

    if (!tables.includes(table)) {
        return {
            title: 'Wrong input provided',
            description: 'Please use the list of availables choices (click in the `which` input)'
        }
    }

    const data = embeds[table];

    return {
        title: data.title,
        description: data.description,
        footer: { text: 'Provided by PSMList.com', icon_url: 'https://psmlist.com/public/img/logo_small.png' }
    };
}