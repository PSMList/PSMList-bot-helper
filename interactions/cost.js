import { SlashCommandBuilder } from 'discord.js';
import cost from '../commons/cost.js';
import { sanitize } from '../commons/utils.js';
import { replyWithEmbeds } from '../commons/utils.js';

export const data =
	new SlashCommandBuilder()
		.setName('cost')
		.setDescription('Estimate the point value of a ship, fort... based on their stats, using UDC and SimCost algorithms.')
		.addIntegerOption( option =>
			option
				.setName('masts')
				.setDescription('Number of masts')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100)
		)
		.addIntegerOption( option =>
			option
				.setName('cargo')
				.setDescription('Cargo space')
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(100)
		)
		.addStringOption( option =>
			option
				.setName('speed')
				.setDescription('Letters (S, L, D, T) with or without a + sign in between (ex: "S+L" or "sSs")')
				.setRequired(true)
				.setMaxLength(5)
		)
		.addStringOption( option =>
			option
				.setName('cannons')
				.setDescription('Dice (1 to 6) and range (S or L) with or without a space in between (ex: "4s 3L2l4S")')
				.setRequired(true)
				.setMaxLength(30)
		);

export async function execute(interaction) {
	const masts = interaction.options.getInteger("masts");
	const cargo = interaction.options.getInteger("cargo");
	const speed = sanitize(interaction.options.getString("speed")).toUpperCase();
	const cannons = sanitize(interaction.options.getString("cannons")).toUpperCase();

	const embed = cost(masts, cargo, speed, cannons);

    const reply = replyWithEmbeds(embed);
    interaction.reply(
        reply
    );
}