import { apiURI, emojis } from '../config.js';
import dbData, { tables } from '../src/dbdata.js';
import fetch from 'node-fetch';

export const types = {
    values: {
        id: [ 'all', 'ship', 'crew', 'treasure' ],
        name: [ 'all', 'ship', 'crew', 'treasure', 'keyword' ],
    },
    choices: {
        id: [
            { name: 'All', value: 'all' },
            { name: 'Ship, fort, submarine, flotilla, creature', value: 'ship' },
            { name: 'Crew', value: 'crew' },
            { name: 'Treasure', value: 'treasure' }
        ],
        name: [
            { name: 'All', value: 'all' },
            { name: 'Ship, fort, submarine, flotilla, creature', value: 'ship' },
            { name: 'Crew', value: 'crew' },
            { name: 'Treasure', value: 'treasure' },
            { name: 'Keyword', value: 'keyword' }
        ]
    }
}

function buildItemEmbed(type, data) {

    const embeds = [];

    if (type === 'keyword') {
        const item = data[0];
        embeds.push(
            {
                title: item.shortname,
                url: `https://www.psmlist.com/public/keyword/detail?kw=${encodeURI(item.shortname)}`,
                fields: [
                    { name: 'Cost', value: item.cost, inline: true },
                    { name: 'Category', value: dbData[tables[3]][item.idkeywordtype].name, inline: true },
                    { name: 'Target', value: dbData[tables[4]][item.idkeywordtarget].name, inline: true },
                    { name: 'Effect', value: item.effect }
                ]
            }
        );
        return embeds;
    }

    for (const index in data) {
        const item = data[index];
        const faction = dbData[tables[0]][item.idfaction];
        const extensionObject = dbData[tables[1]][item.idextension];

        const itemID = extensionObject.short + item.numid;

        if (type === 'fort') {
            type = 'ship';
        }

        const itemEmbed = {
            title: `${item.name} (${itemID})`,
            color: parseInt(dbData[tables[2]][item.idrarity].colorhex, 16),
            url: `https://psmlist.com/public/${type}/${itemID}`,
            image: { url: `https://psmlist.com/public/img/gameicons/full/${extensionObject.short}/${item.numid}.jpg` }
        }

        const fields = [];

        switch (type) {
            case 'ship':
                if (item.isFort) {
                    fields.push(
                        {
                            name: emojis[extensionObject.short] + ' \u200b ' + extensionObject.name + ' \u200b - \u200b ' + extensionObject.short + ' \u200b \u200b \u200b ' + emojis[faction.nameimg] + ' \u200b ' + faction.name,
                            value: '**' + item.points + ' points** \u200b \u200b ' +
                                emojis.cannon + '\ ' + item.cannons.match(/\w{2}/g).reduce((cannons, cannon) => cannons + ' \u200b ' + emojis[cannon], ''),
                        },
                        { name: 'Ability', value: item.defaultaptitude || '-', inline: true },
                        { name: 'Flavor Text', value: item.defaultlore || '-', inline: true }
                    );
                }
                else {
                    fields.push(
                        {
                            name: emojis[extensionObject.short] + ' \u200b ' + extensionObject.name + ' \u200b - \u200b ' + extensionObject.short + ' \u200b \u200b \u200b ' + emojis[faction.nameimg] + ' \u200b ' + faction.name,
                            value: '**' + item.points + ' points**' + ' \u200b \u200b ' +
                                emojis.masts + ' ' + item.masts + ' \u200b \u200b ' +
                                emojis.cargo + ' ' + item.cargo + ' \u200b \u200b ' +
                                emojis.speed + ' ' + item.basemove + ' \u200b \u200b ' +
                                emojis.cannon + ' ' + item.cannons.match(/\w{2}/g).reduce((cannons, cannon) => cannons + ' \u200b ' + emojis[cannon], ''),
                        },
                        { name: 'Ability', value: item.defaultaptitude || '-', inline: true },
                        { name: 'Flavor Text', value: item.defaultlore || '-', inline: true }
                    );
                }
                break;
            case 'crew':
                fields.push(
                    {
                        name: emojis[extensionObject.short] + ' \u200b ' + extensionObject.name + ' \u200b - \u200b ' + extensionObject.short + ' \u200b \u200b \u200b ' + emojis[faction.nameimg] + ' \u200b ' + faction.name,
                        value: '**' + item.points + ' points**',
                    },
                    { name: 'Ability', value: item.defaultaptitude || '-', inline: true },
                    { name: 'Flavor Text', value: item.defaultlore || '-', inline: true },
                );
                break;
            case 'treasure':
                fields.push(
                    {
                        name: emojis[extensionObject.short] + ' \u200b ' + extensionObject.name + ' \u200b - \u200b ' + extensionObject.short,
                        value: item.defaultaptitude || '-'
                    }
                );
                break;
        }

        if (type !== 'treasure' && item.lookingforbetterpic === 1) {
            fields.push({ name: 'The current image available for this ship is flagged "unsatisfactory".', value: 'If you are willing to help providing a better image of a built ship, please contact us at support@psmlist.com or via Discord.' })
        }

        itemEmbed.fields = fields;
        embeds.push(itemEmbed);
    }

    return embeds;
}

function buildItemsEmbed(type, items) {
    const fields = [];
    let title = types.choices.name.find( choice => choice.value === type ).name;

    // pack results in columns of 8
    for (let i = 0; i < items.length; i += 8) {
        let output = '';

        if (type !== 'keyword') {
            output = items.slice(i, i + 8).reduce((accu, item) => {
                const faction = dbData[tables[0]][item.idfaction];
                const extensionObject = dbData[tables[1]][item.idextension];
                return accu +
                    ' \u200b \u200b ' + '[' + extensionObject.short + item.numid + '](https://psmlist.com/public/' + (type !== 'fort' ? type : 'ship') + '/' + extensionObject.short + item.numid + ')' +
                    (faction && faction.nameimg ? ' \u200b ' + emojis[faction.nameimg] : '') +
                    ' \u200b\ ' + item.name +
                    '\n';
            }, '');
        }
        else {
            output = items.slice(i, i + 8).reduce((accu, item) =>
                accu + ' \u200b \u200b ' + '[' + item.shortname + '](https://www.psmlist.com/public/keyword/detail?kw=' + encodeURI(item.shortname) + ') \n'
                , '');
        }
        fields.push({ name: title, value: output, inline: true });
        title = ' \u200b';
    }

    return [
        {
            fields
        }
    ];
}

function setResults(input, data) {

    // get the amount of items to display
    const length = input === 'all' ?
        data.reduce( (total, _data) => total + _data.length, 0)
        :
        data.length;

    if (length !== 0) {
        // create an associative array of data by item type
        const dataByType = {};
        let typesCount = 0;
        if (input === 'all') {
            for (let typeID = 0; typeID < data.length; typeID++) {
                const array = data[typeID];
                const type = types.values.name[typeID+1];
                // avoid creating an empty embed if there is no value for this item type
                if (array.length > 0) {
                    dataByType[type] = array;
                    typesCount++;
                }
            }
        }
        else {
            typesCount = 1;
            dataByType[input] = data;
        }

        const extensions = dbData[tables[1]]

        // check if there would be one item to show or two corresponding to crew from the same card (with same extension and numid)
        const isSingleEmbed =
            // more than one type or more than two items means multi embed
            typesCount > 1 || length > 2 ? false :
                // one item or two which match type specific conditions
                (
                    length === 1
                    ||
                    (
                        // crew from the same card
                        (
                            dataByType['crew'] &&
                            (
                                dataByType['crew'][0].idextension === dataByType['crew'][1].idextension
                                && dataByType['crew'][0].numid.match('[^a]+')[0] === dataByType['crew'][1].numid.match('[^b]+')[0]
                            )
                        )
                        ||
                        // ships from both non Unlimited and Unlimited extensions
                        (
                            dataByType['ship'] &&
                            (
                                extensions[dataByType['ship'][0].idextension].short + 'U' === extensions[dataByType['ship'][1].idextension].short
                                || extensions[dataByType['ship'][0].idextension].short === extensions[dataByType['ship'][1].idextension].short + 'U'
                            )
                        )
                    )
                );

        // keep only the ship not from Unlimited extension
        if (isSingleEmbed && dataByType['ship'] && dataByType['ship'].length === 2) {
            dataByType['ship'] = [
                !(extensions[dataByType['ship'][0].idextension].short.endsWith('U')) ?
                    dataByType['ship'][0] : dataByType['ship'][1]
            ]
        }
        // create one embed for each type of item
        const embeds = [];
        for (let type in dataByType) {
            const array = dataByType[type];
            // if data contains only one item or two successive crew
            embeds.push(
                ...(isSingleEmbed ?
                    // create detailed embed
                    buildItemEmbed(type, array)
                    :
                    buildItemsEmbed(type, array)
                )
            )
        }
        embeds.at(-1)
            .footer = { text: 'Provided by PSMList.com', icon_url: 'https://psmlist.com/public/img/logo_small.png' }
        return embeds;
    }
    const type = types.choices.name.find( choice => choice.value === input ).name;
    return [
        {
            title: 'No data match',
            description: `Provided input did not match any ${input === 'all' ?
                'type'
                :
                type.toLowerCase()
            }.`
        }
    ];
}

async function getApiData(command, type, query) {
    return type === 'all' ?
        Promise.all(types.values[command].slice(1).map(type =>
            getApiData(command, type, query)
        ))
        :
        await fetch(`${apiURI}/${type}/${command}/${query}`).then(res => res.json());
}

export default async function search(command, type, query) {
    const fallback = !types.values[command].includes(type);
    if (fallback) {
        type = 'all';
    }

    const data = await getApiData(command, type, query);
    const embeds = setResults(type, data);
    if (fallback) {
        embeds.unshift(
            {
                title: 'Unrecognized type',
                description: 'Falling back to "all" types'
            }
        )
    }
    
    return embeds;
}