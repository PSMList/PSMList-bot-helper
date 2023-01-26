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
		await command.execute(interaction);
	} catch (error) {
		console.log(error);
        await interaction.channel.send(
            replyWithEmbeds({
                title: 'Unexpected internal error',
                description: 'Please try again later or contact the bot maintainers.'
            })
        );
	}
}