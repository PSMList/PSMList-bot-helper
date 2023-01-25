import { Events } from 'discord.js';
import { replyWithEmbeds } from '../commons/utils.js';

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
		await interaction.deferReply();
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
        await interaction.followUp(
            replyWithEmbeds({title: 'There was an error while executing this command!' })
        );
	}
}