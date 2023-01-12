import { SlashCommandBuilder } from 'discord.js';
import ping from '../commons/ping.js';

export const data =
    new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Test your ping latency for fun!')

export async function execute(interaction) {
    const embed = ping(interaction.createdTimestamp);

    const reply  = replyWithEmbeds(embed);
    reply.ephemeral = true;
    interaction.reply(
        reply
    );
}