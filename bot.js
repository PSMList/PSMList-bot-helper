import './api.js';
import * as commands from './interactions/index.js';
import * as events from './events/index.js';

import { ActivityType, Client, Collection, GatewayIntentBits } from 'discord.js';
import { BOT_TOKEN } from './secret.js';

const bot = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	presence: {
		activities: [
			{ name: '/help', type: ActivityType.Playing }
		]
	}
});

bot.commands = new Collection();

for (const key in commands) {
    const command = commands[key];
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		bot.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const key in events) {
    const event = events[key];
	if (event.once) {
		bot.once(event.name, event.execute);
	} else {
		bot.on(event.name, event.execute);
	}
}

bot.login(BOT_TOKEN);