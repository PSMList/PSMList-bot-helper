import { SlashCommandBuilder } from "discord.js";
import { tablesTitleMap } from "../commons/dbdata.js";
import list from "../commons/list.js";
import { replyWithEmbeds } from "../commons/utils.js";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Show values for...")
  .addStringOption((option) =>
    option
      .setName("which")
      .setDescription("Values of...")
      .setRequired(true)
      .addChoices(
        ...Object.entries(tablesTitleMap).map(([value, name]) => ({
          value,
          name,
        }))
      )
  );

export async function execute(interaction) {
  const which = interaction.options.getString("which");

  const embed = list(which);
  const reply = replyWithEmbeds(embed);
  interaction.reply(reply);
}
