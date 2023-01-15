import { SlashCommandBuilder } from 'discord.js';
import search, { types } from '../commons/search.js';
import { replyWithEmbeds, sanitize } from '../commons/utils.js';

function setSearchByType(subcommand, command) {
    return subcommand
        .setName(command.toLowerCase())
        .setDescription(`Search elements by ${command}`)
        .addStringOption( option =>
            option
                .setName('type')
                .setDescription('Type of elements you want to search (or "all")')
                .setRequired(true)
                .addChoices(...types.choices[command])
        )
        .addStringOption( option =>
            option
                .setName(command)
                .setDescription(
                    command === 'name' ?
                        'Type a name or part of a name (ex: "aco", "acorazado", "El Acorazado")'
                        :
                        'Type an ID, an extension, both or a part of it (ex: "FS", "10", "FS010")'
                )
                .setRequired(true)
                .setMinLength(3)
        )
}

export const data =
	new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search elements by name or ID')
        .addSubcommand(subcommand =>
            setSearchByType(subcommand, 'id')
        )
        .addSubcommand(subcommand =>
            setSearchByType(subcommand, 'name')
        );

export async function execute(interaction) {
    const command = interaction.options.getSubcommand();
    const type = interaction.options.getString('type');
    const query = sanitize(interaction.options.getString(command));

    const embeds = await search(command, type, query);

    const reply = replyWithEmbeds(embeds);
    interaction.reply(
        reply
    );
}