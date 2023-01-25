import { SlashCommandBuilder } from 'discord.js';
import list from '../commons/list.js';
import { tables } from '../commons/dbdata.js';
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
                    { name: 'Expansions', value: tables[0] },
                    { name: 'Factions', value: tables[1] },
                    { name: 'Rarities', value: tables[2] },
                    { name: 'Keyword categories', value: tables[3] },
                    { name: 'Keyword targets', value: tables[4] }
                )
        );

export async function execute(interaction) {
    const which = interaction.options.getString('which');

    const embed = list(which);
    const reply = replyWithEmbeds(embed);
    interaction.followUp(
        reply
    );
}