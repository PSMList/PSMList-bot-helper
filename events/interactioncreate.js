import { Events } from 'discord.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
        return interaction.reply(
            replyWithEmbeds({title: `No command matching ${interaction.commandName} was found.` })
        );
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
        interaction.reply(
            replyWithEmbeds({title: 'There was an error while executing this command!' })
        );
	}
}