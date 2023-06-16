import { SlashCommandBuilder } from 'discord.js';
import ping from '../commons/ping.js';
import { replyWithEmbeds } from '../commons/utils.js';

export const data =
    new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Test your ping latency for fun!')

export default function(message) {
    const embed = ping(message.createdTimestamp);

    const reply = replyWithEmbeds(embed);
    message.channel.send(
        reply
    );
}