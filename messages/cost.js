import cost from '../commons/cost.js';

export default function(message, args) {
	const matches = args.join(' ').toUpperCase().match(/([0-9]|10) ([0-9]|10) ((?:[SLDT]\+?)+) ((?:[1-6](?:S|L) ?)+)/);

	const masts = matches[1];
	const cargo = matches[2];
	const speed = matches[3];
	const cannons = matches[4];

	const embed = cost(masts, cargo, speed, cannons);

    const reply = replyWithEmbeds(embed);
    message.channel.send(
        reply
    );
}