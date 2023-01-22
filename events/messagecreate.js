import { Events } from 'discord.js';
import { prefix } from '../config.js';
import cost from '../messages/cost.js';
import help from '../messages/help.js';
import list from '../messages/list.js';
import ping from '../messages/ping.js';
import search from '../messages/search.js';
import { replyWithEmbeds, sanitize } from '../commons/utils.js';

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message) {
	try {
		// stop if the message is from a bot
		if (message.author.bot) {
			return;
		}
		// stop if message is too small or prefix not the one this bot expects
		if (message.content.slice(0, prefix.length).toLowerCase() !== prefix) {
			return;
		}

		const commandBody = sanitize(message.content.slice(prefix.length).toLowerCase());

		const args = commandBody.replace(/ +/g, ' ').split(' ');
		// switch command and args if firts argument is 'help'
		const command = args[1] && args[1] === 'help' ? args[1] : args.shift();

		switch (command) {
			case 'help':
				return help(message, args[0]);

			case 'search':
			case 'ship':
			case 'crew':
			case 'fort':
			case 'treasure':
			case 'keyword':
				// get search type and remove it from args for future processing
				const searchType = args.shift();
				if (command === 'search' && args.length === 0) {
					return message.channel.send(
						replyWithEmbeds({
							description: `More content is available on [PSMList.com](https://psmlist.com/public/)`
						})
					);
				}
				if (command !== 'keyword' || searchType === 'name') {
					return search(message, command, searchType, args);
				}
				else if (!['categories', 'targets'].includes(searchType)) {
					return message.channel.send(
						replyWithEmbeds({
							title: 'No matching command',
							description: `Unable to understand your request. Type \`${prefix}help\` to show the list of available commands.`
						})
					);
				}

				return list(message, searchType);
			case 'factions':
			case 'expansions':
			case 'extensions':
			case 'rarities':
				return list(message, command);

			case 'ping':
				return ping(message);

			case 'udc':
			case 'simcost':
				message.channel.send(
					replyWithEmbeds({
						title: `Falling back to \`${prefix}cost\``,
						description: '`udc`and `simcost`commands are merged within `cost`.'
					})
				);
			case 'cost':
				return cost(message, args);

			default:
				return message.channel.send(
					replyWithEmbeds({
						title: 'No matching command',
						description: `Unable to understand your request. Type \`${prefix}help\` to show the list of available commands.`
					})
				);
		}
	}
	catch (err) {
		console.log(err);
		return message.channel.send(
			replyWithEmbeds({
				title: 'Unexpected internal error',
				description: 'Please try again later or contact the bot maintainers.'
			})
		);
	}
}