import cost from '../commons/cost.js';
import { replyWithEmbeds } from '../commons/utils.js';

export default function(message, args) {
	const matches = args.map( arg => arg.toUpperCase() );

	const masts = matches[0];
	const cargo = matches[1];
	const speed = matches[2];
	const cannons = matches[3];

	const embed = cost(masts, cargo, speed, cannons);

    const reply = replyWithEmbeds(embed);
    message.channel.send(
        reply
    );
}