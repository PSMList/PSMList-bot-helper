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
];

const choiceIdTypes = [...choiceTypes, { name: "Island", value: "island" }];

const choiceNameTypes = [...choiceTypes, { name: "Keyword", value: "keyword" }];

const choiceTypesTitles = Object.fromEntries(
  [...choiceIdTypes, ...choiceNameTypes].map((choice) => [
    choice.value,
    choice.name,
  ])
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

function buildItemEmbed(type, data) {
  const embeds = [];

  if (type === "keyword") {
    const item = data[0];
    const url = `https://psmlist.com/public/keyword/detail?kw=${encodeURI(
      item.shortname
    )}`;
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
    const extensionEmoji = emojis[extensionObject.short] || emojis["psmlist"];
    const prefix = customPrefix + extensionEmoji;

    const itemEmbed = {
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
              item.cannons
                .match(/\w{2}/g)
                .reduce(
                  (cannons, cannon) => cannons + " \u200b " + emojis[cannon],
                  ""
                ),
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
              item.cannons
                .match(/\w{2}/g)
                .reduce(
                  (cannons, cannon) => cannons + " \u200b " + emojis[cannon],
                  ""
                ),
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
        itemEmbed.author = {
          name: capitalize(type),
        };
        fields.push({
          name:
            prefix +
            " \u200b " +
            extensionObject.name +
            " \u200b - \u200b " +
            extensionObject.short,
          value:
            type === "equipment"
              ? "**" + plural("point", item.points) + " **"
              : "",
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
          name:
            prefix +
            " \u200b " +
            extensionObject.name +
            " \u200b - \u200b " +
            extensionObject.short,
          value: truncateField(item.oncardtext, itemEmbed.url),
        });

        const islandTerrains = [
          item.island_terrain_id_1,
          item.island_terrain_id_2,
        ].filter(Boolean);

        if (islandTerrains.length) {
          const terrains = islandTerrains
            .map((terrainId) => {
              const terrain = dbData["island/terrain"][terrainId];
              return `${emojis[terrain.nameimg]} [${terrain.name}](${
                itemEmbed.url
              })`;
            })
            .join("\n");
          fields.push({ name: "Terrain", value: terrains });
        }
        break;
    }

    if (item.defaultaptitude) {
      fields.push({
        name: "Ability",
        value: truncateField(item.defaultaptitude, url),
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
        const factionName = faction?.nameimg
          ? ` \u200b ${emojis[faction.nameimg]}`
          : "";

        const itemName = item.name ? ` \u200b ${item.name}` : "";

        const terrains =
          type === "island" &&
          [item.island_terrain_id_1, item.island_terrain_id_2].filter(Boolean);
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
        const url = `https://psmlist.com/public/keyword/detail?kw=${encodeURI(
          item.shortname
        )}`;
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

function setResults(input, data) {
  // get the amount of items to display
  const itemsCount =
    input === "all"
      ? data.reduce((total, items) => total + items.length, 0)
      : data.length;

  if (!itemsCount) {
    const type = choiceTypesTitles[input] ?? "";

    return [
      {
        title: "No data match",
        description: `Provided input did not match any ${
          input === "all" ? "type" : type.toLowerCase()
        }.`,
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

  const crew = dataByType["crew"];
  const firstCrew = crew?.[0];
  const secondCrew = crew?.[1];

  const ships = dataByType["ship"];
  const firstShip = ships?.[0];
  const secondShip = ships?.[1];
  const firstShipExtension = extensions[firstShip?.idextension];
  const secondShipExtension = extensions[secondShip?.idextension];

  // check if there would be one item to show or two corresponding to crew from the same card (with same extension and numid)
  const isSingleEmbed =
    // more than one type or more than two items means multi embed
    typesCount > 1 || itemsCount > 2
      ? false
      : // one item or two which match type specific conditions
        itemsCount === 1 ||
        // crew from the same card
        (crew &&
          firstCrew.idextension === secondCrew.idextension &&
          firstCrew.numid.match(/^[^a]+/)[0] ===
            secondCrew.numid.match(/^[^b]+/)[0]) ||
        // ships from both non Unlimited and Unlimited extensions
        (ships &&
          firstShipExtension.short.match(/[^U]+/)[0] ===
            secondShipExtension.short.match(/[^U]+/)[0]);

  // keep only the ship not from Unlimited extension
  if (isSingleEmbed && (ships?.length ?? 0) === 2) {
    dataByType["ship"] = [
      !firstShipExtension.short.endsWith("U") ? firstShip : secondShip,
    ];
  }

  // create one embed for each type of item
  const embeds = [];
  for (let type in dataByType) {
    const array = dataByType[type];
    // if data contains only one item or two successive crew
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
