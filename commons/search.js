import { API_URI, emojis } from "../config.js";
import dbData from "../commons/dbdata.js";
import fetch from "node-fetch";
import { capitalize } from "./utils.js";

const choiceTypes = [
  { name: "All", value: "all" },
  { name: "Ship, fort, submarine, flotilla, creature", value: "ship" },
  { name: "Crew", value: "crew" },
  { name: "Treasure", value: "treasure" },
  { name: "Equipment", value: "equipment" },
  { name: "Event", value: "event" },
];

const choiceIdTypes = [...choiceTypes, { name: "Island", value: "island" }];

const choiceNameTypes = [...choiceTypes, { name: "Keyword", value: "keyword" }];

const choiceTypesTitles = Object.fromEntries(
  [...choiceIdTypes, ...choiceNameTypes].map((choice) => [choice.value, choice.name])
);

export const types = {
  values: {
    id: choiceIdTypes.map((choice) => choice.value),
    name: choiceNameTypes.map((choice) => choice.value),
  },
  choices: {
    id: choiceIdTypes,
    name: choiceNameTypes,
  },
};

export const CUSTOM_DISCLAIMER = "\\* is made by the community";

function truncateField(text, moreUrl) {
  text = text || "";

  if (text.length < 300) {
    return text;
  }
  return `${text.slice(0, 300)}... [See complete description](${moreUrl})`;
}

function plural(string, number) {
  let prefix = number + " ";
  if (Math.abs(number) <= 1) {
    return prefix + string;
  }
  if (string.endsWith("y")) {
    return prefix + string.substring(0, -1) + "ies";
  }
  return prefix + string + "s";
}

function getType(item, type) {
  if (type !== "ship") {
    return type;
  }

  return dbData["shiptype"][item.idtype]?.name.toLowerCase() || "ship";
}

function buildItemEmbed(type, data) {
  const embeds = [];

  if (type === "keyword") {
    const item = data[0];
    const url = `https://psmlist.com/public/keyword/detail?kw=${encodeURI(item.shortname)}`;
    embeds.push({
      title: item.shortname,
      url,
      fields: [
        { name: "Cost", value: plural("point", item.cost), inline: true },
        {
          name: "Category",
          value: dbData["keyword/category"][item.idkeywordtype].name,
          inline: true,
        },
        {
          name: "Target",
          value: dbData["keyword/target"][item.idkeywordtarget].name,
          inline: true,
        },
        { name: "Effect", value: truncateField(item.effect, url) },
      ],
    });
    return embeds;
  }

  for (const index in data) {
    const item = data[index];
    const faction = dbData["faction"][item.idfaction];
    const extensionObject = dbData["extension"][item.idextension];

    const itemID = extensionObject.short + item.numid;

    const url = `https://psmlist.com/public/${type}/${itemID}`;

    const customPrefix = item.custom ? "\\* \u200b" : "";
    const customType = item.custom ? "Custom " : "";
    const extensionEmoji = emojis[extensionObject.short] || emojis["psmlist"];
    const prefix = customPrefix + extensionEmoji;

    const itemEmbed = {
      author: {
        name: customType + capitalize(getType(item, type)),
      },
      title: `${item.name} (${itemID})`,
      color: parseInt(dbData["rarity"][item.idrarity]?.colorhex, 16),
      url,
      image: {
        url: `https://psmlist.com/public/img/gameicons/full/${extensionObject.short}/${item.numid}.jpg`,
      },
    };

    const fields = [];

    switch (type) {
      case "ship":
        if (item.isFort) {
          fields.push({
            name:
              prefix +
              " \u200b " +
              extensionObject.name +
              " \u200b - \u200b " +
              extensionObject.short +
              " \u200b \u200b \u200b " +
              emojis[faction.nameimg] +
              " \u200b " +
              faction.name,
            value:
              "**" +
              plural("point", item.points) +
              " ** \u200b \u200b " +
              emojis.cannon +
              " " +
              item.cannons.match(/\w{2}/g).reduce((cannons, cannon) => cannons + " \u200b " + emojis[cannon], ""),
          });
        } else {
          fields.push({
            name:
              prefix +
              " \u200b " +
              extensionObject.name +
              " \u200b - \u200b " +
              extensionObject.short +
              " \u200b \u200b \u200b " +
              emojis[faction.nameimg] +
              " \u200b " +
              faction.name,
            value:
              "**" +
              plural("point", item.points) +
              " **" +
              " \u200b \u200b " +
              emojis.masts +
              " " +
              item.masts +
              " \u200b \u200b " +
              emojis.cargo +
              " " +
              item.cargo +
              " \u200b \u200b " +
              emojis.speed +
              " " +
              item.basemove +
              " \u200b \u200b " +
              emojis.cannon +
              " " +
              item.cannons.match(/\w{2}/g).reduce((cannons, cannon) => cannons + " \u200b " + emojis[cannon], ""),
          });
        }
        break;
      case "crew":
        fields.push({
          name:
            prefix +
            " \u200b " +
            extensionObject.name +
            " \u200b - \u200b " +
            extensionObject.short +
            " \u200b \u200b \u200b " +
            emojis[faction.nameimg] +
            " \u200b " +
            faction.name,
          value: "**" + plural("point", item.points) + " **",
        });
        break;
      case "treasure":
      case "equipment":
      case "event":
        fields.push({
          name: prefix + " \u200b " + extensionObject.name + " \u200b - \u200b " + extensionObject.short,
          value: type !== "treasure" ? "**" + plural("point", item.points) + " **" : "",
        });
        break;
      case "island":
        const islandTitle = choiceTypesTitles[type] ?? "";

        itemEmbed.title = `${itemID} (${islandTitle})`;
        itemEmbed.url = `https://psmlist.com/public/island/${item.slugname}`;
        itemEmbed.image.url = `https://psmlist.com/public/img/islands/${
          extensionObject.custom ? "custom" : "official"
        }/icon/${item.imageiconisland}`;

        fields.push({
          name: prefix + " \u200b " + extensionObject.name + " \u200b - \u200b " + extensionObject.short,
          value: truncateField(item.oncardtext, itemEmbed.url),
        });

        const islandTerrains = [item.island_terrain_id_1, item.island_terrain_id_2].filter(Boolean);

        if (islandTerrains.length) {
          const terrains = islandTerrains
            .map((terrainId) => {
              const terrain = dbData["island/terrain"][terrainId];
              return `${emojis[terrain.nameimg]} [${terrain.name}](${itemEmbed.url})`;
            })
            .join("\n");
          fields.push({ name: "Terrain", value: terrains });
        }
        break;
    }

    const ability = item.defaultaptitude || item.aptitude;

    if (ability) {
      fields.push({
        name: "Ability",
        value: truncateField(ability, url),
      });
    }

    if (item.defaultlore) {
      fields.push({
        name: "Flavor text",
        value: truncateField(item.defaultlore, url),
      });
    }

    if (item.lookingforbetterpic === 1) {
      fields.push({
        name: 'The current image available for this item is flagged "unsatisfactory".',
        value:
          "If you are willing to help providing a better image, please contact us at support@psmlist.com or via Discord.",
      });
    }

    if (item.custom) {
      fields.push({ name: "\u200b", value: CUSTOM_DISCLAIMER });
    }

    itemEmbed.fields = fields;
    embeds.push(itemEmbed);
  }

  return embeds;
}

function buildItemsEmbed(type, items) {
  const fields = [];
  let title = choiceTypesTitles[type] ?? "";

  let hasCustomItem = false;

  // pack results in columns of 8
  for (let i = 0; i < items.length; i += 8) {
    let output = "";

    if (type !== "keyword") {
      output = items.slice(i, i + 8).reduce((accu, item) => {
        if (item.custom) {
          hasCustomItem = true;
        }

        const faction = dbData["faction"][item.faction];
        const factionName = faction?.nameimg ? ` \u200b ${emojis[faction.nameimg]}` : "";

        const itemName = item.name ? ` \u200b ${item.name}` : "";

        const terrains = type === "island" && [item.island_terrain_id_1, item.island_terrain_id_2].filter(Boolean);
        let terrainName = "";
        if (terrains?.length) {
          terrainName = terrains
            .map((terrainId) => {
              const terrain = dbData["island/terrain"][terrainId];
              return ` \u200b ${emojis[terrain.nameimg]}`;
            })
            .join("");
        }

        const customPrefix = item.custom ? "\\* " : "";

        const extensionObject = dbData["extension"][item.idextension];
        const url = `https://psmlist.com/public/${type}/${extensionObject.short}${item.numid}`;

        return `${accu}${customPrefix}[${extensionObject.short}${item.numid}](${url})${factionName}${itemName}${terrainName}\n`;
      }, "");
    } else {
      output = items.slice(i, i + 8).reduce((accu, item) => {
        const url = `https://psmlist.com/public/keyword/detail?kw=${encodeURI(item.shortname)}`;
        return `${accu}[${item.shortname}](${url})\n`;
      }, "");
    }
    fields.push({ name: title, value: output, inline: true });
    title = " \u200b";
  }

  if (hasCustomItem) {
    fields.push({ name: "\u200b", value: CUSTOM_DISCLAIMER });
  }

  return [
    {
      fields,
    },
  ];
}

/**
 *
 * @param {string} input
 * @param {object[] | object[][]} data
 * @returns
 */
function setResults(input, data) {
  const allData = data.flat();

  // get the amount of items to display
  const itemsCount = allData.length;

  if (!itemsCount) {
    const type = choiceTypesTitles[input] ?? "";

    return [
      {
        title: "No data match",
        description: `Provided input did not match any ${input === "all" ? "type" : type.toLowerCase()}.`,
      },
    ];
  }

  // create an associative array of data by item type
  const dataByType = {};
  let typesCount = 0;

  if (input === "all") {
    for (let typeID = 0; typeID < data.length; typeID++) {
      const array = data[typeID];
      const type = types.values.name[typeID + 1];

      // avoid creating an empty embed if there is no value for this item type
      if (array.length > 0) {
        dataByType[type] = array;
        typesCount++;
      }
    }
  } else {
    typesCount = 1;
    dataByType[input] = data;
  }

  const extensions = dbData["extension"];

  let isSingleEmbed = itemsCount < 2;

  if (itemsCount === 2) {
    const firstItem = allData[0];
    const secondItem = allData[1];
    const firstItemExtension = extensions[firstItem.idextension].short;
    const secondItemExtension = extensions[secondItem.idextension].short;

    // If both items are from the same extension, we can show them together
    if (
      firstItemExtension === secondItemExtension &&
      firstItem.numid.replace(/[ab]$/i, "") === secondItem.numid.replace(/[ab]$/i, "")
    ) {
      isSingleEmbed = true;
    }
    // If both items are the same except for Unlimited extension, we can show them together
    else if (firstItemExtension.replace(/U$/i, "") === secondItemExtension.replace(/U$/i, "")) {
      isSingleEmbed = true;

      if (firstItemExtension.endsWith("U")) {
        for (let type in dataByType) {
          if (dataByType[type].find((item) => item === firstItem)) {
            dataByType[type].pop();

            break;
          }
        }
      } else {
        for (let type in dataByType) {
          if (dataByType[type].find((item) => item === secondItem)) {
            dataByType[type].shift();

            break;
          }
        }
      }
    }
  }

  // create one embed for each type of item
  const embeds = [];
  for (let type in dataByType) {
    const array = dataByType[type];

    embeds.push(
      ...(isSingleEmbed
        ? // create detailed embed
          buildItemEmbed(type, array)
        : buildItemsEmbed(type, array))
    );
  }

  return embeds;
}

async function getApiData(command, type, query, custom) {
  return type === "all"
    ? Promise.all(types.values[command].slice(1).map((type) => getApiData(command, type, query, custom)))
    : await fetch(`${API_URI}/${type}/${command}/${query}${custom ? "?custom=" + custom : ""}`).then((res) => {
        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }

        return res.json();
      });
}

export default async function search(command, type, query, custom) {
  if (command.includes("id") && query.includes(" ")) {
    return {
      title: "Wrong input format",
      description: "Please provide only one ID per research.",
    };
  }

  const fallback = !types.values[command].includes(type);
  if (fallback) {
    type = "all";
  }

  const data = await getApiData(command, type, query, custom);
  const embeds = setResults(type, data);
  if (fallback) {
    embeds.unshift({
      title: "Unrecognized type",
      description: 'Falling back to "all" types',
    });
  }

  return embeds;
}
