import './api.js';
import { REST, Routes } from 'discord.js';
import { CLIENT_ID, GUILD_IDS, BOT_TOKEN } from './secret.js';
// Grab all the command files from the commands directory you created earlier
import * as commands from './interactions/index.js';

const commandsList = [];

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const key in commands) {
    const command = commands[key];
	commandsList.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

// and deploy your commands!
(async () => {
    for (const GUILD_ID of Object.values(GUILD_IDS)) {
		try {
			console.log(`Started refreshing ${commandsList.length} application (/) commands.`);

			// The put method is used to fully refresh all commands in the guild with the current set
			const data = await rest.put(
				Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
				{ body: commandsList },
			);

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
	}
})();