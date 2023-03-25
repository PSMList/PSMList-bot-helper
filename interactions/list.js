import { SlashCommandBuilder } from 'discord.js';
import list, { tablesTitleMap } from '../commons/list.js';
import { replyWithEmbeds } from '../commons/utils.js';

export const data =
	new SlashCommandBuilder()
		.setName('list')
        .setDescription('Show values for...')
        .addStringOption( option =>
            option
                .setName('which')
                .setDescription('Values of...')
                .setRequired(true)
                .addChoices(
                    ...Object.entries(tablesTitleMap).map( table => ({value: table[0], name: table[1]}))
                )
        );

export async function execute(interaction) {
    const which = interaction.options.getString('which');

    const embed = list(which);
    const reply = replyWithEmbeds(embed);
    interaction.reply(
        reply
    );
}