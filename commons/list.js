import { emojis } from "../config.js";
import dbData, {
  dbDataPromise,
  tables,
  tablesTitleMap,
} from "../commons/dbdata.js";

const embeds = {};

function sortByName(a, b) {
  return a.name < b.name ? -1 : 1;
}

function sortById(a, b) {
  return a.id < b.id ? -1 : 1;
}

(async () => {
  await dbDataPromise;

  for (const table of tables) {
    const embed = (embeds[table] = {
      title: tablesTitleMap[table],
    });

    switch (table) {
      case "faction":
        embed.description = Object.values(dbData["faction"])
          .sort(sortByName)
          .reduce(
            (output, faction) =>
              output +
              emojis[faction.nameimg] +
              " \u200b " +
              faction.name +
              "\n",
            ""
          );
        break;
      case "extension":
        embed.description = Object.values(dbData["extension"])
          // .sort(sortByName)
          .reduce(
            (output, extension) =>
              output +
              emojis[extension.short] +
              " \u200b " +
              extension.name +
              " - " +
              extension.short +
              (extension.shortcommunity
                ? " - " + extension.shortcommunity
                : "") +
              (extension.shortwizkids ? " - " + extension.shortwizkids : "") +
              "\n",
            ""
          );
        break;
      case "rarity":
        embed.description = Object.values(dbData["rarity"])
          .sort(sortById)
          .reduce(
            (output, rarity) =>
              `${output}${emojis[rarity.colorhex]} ${rarity.name}\n`,
            ""
          );
        break;
      case "keyword/category":
        embed.description = Object.values(dbData["keyword/category"])
          .sort(sortByName)
          .reduce(
            (output, kw_category) => `${output} ${kw_category.name}\n`,
            ""
          );
        break;
      case "keyword/target":
        embed.description = Object.values(dbData["keyword/target"])
          .sort(sortByName)
          .reduce((output, kw_target) => `${output} ${kw_target.name}\n`, "");
        break;
      case "island/terrain":
        embed.description = Object.values(dbData["island/terrain"])
          .sort(sortByName)
          .reduce(
            (output, terrain) =>
              `${output}${emojis[terrain.nameimg]} ${terrain.name}\n`,
            ""
          );
        break;
    }
  }
})();

export default function list(table) {
  if (!tables.includes(table)) {
    return {
      title: "Wrong input provided",
      description:
        "Please use the list of availables choices (click in the `which` input)",
    };
  }

  const data = embeds[table];

  return {
    title: data.title,
    description: data.description,
  };
}
