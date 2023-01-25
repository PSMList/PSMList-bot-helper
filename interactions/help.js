import { SlashCommandBuilder } from 'discord.js';
import help from '../commons/help.js';
import { replyWithEmbeds } from '../commons/utils.js';

const choices = [
    { name: 'Cost', value: 'cost' },
    { name: 'List', value: 'list' },
    { name: 'Ping', value: 'ping' },
    { name: 'Search by ID', value: 'search id' },
    { name: 'Search by name', value: 'search name' },
]

export const data =
    new SlashCommandBuilder()
		.setName('help')
		.setDescription('Help with commands')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Show command details')
                .addChoices(...choices)
        )

export async function execute(interaction) {
    const command = interaction.options.getString('command');

    const embed = help(command ?? 'help', '/');

    const reply = replyWithEmbeds(embed);
    interaction.followUp(
        reply
    );
}