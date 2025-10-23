import { Events } from "discord.js";
import { replyWithEmbeds } from "../commons/utils.js";

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    const error = `No command matching ${interaction.commandName} was found.`;
    console.error(error);

    return interaction.reply(replyWithEmbeds({ title: error }));
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
    await interaction.reply(
      replyWithEmbeds({
        title: "Unexpected internal error",
        description: "Please try again later or contact the bot maintainers.",
      })
    );
  }
}
