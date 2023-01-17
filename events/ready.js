import { Events } from 'discord.js';
import { CHANNEL_NAME, GUILD_IDS } from '../secret.js';

export const name = Events.ClientReady;
export const once = true;

export function execute(bot) {
    console.log(`Ready! Logged in as ${bot.user.tag}`);

    return;
    for (const GUILD_ID of Object.values(GUILD_IDS)) {
        const guild = bot.guilds.cache.get(GUILD_ID);
        if (!guild)
            continue;
        const channel = guild.channels.cache.find(channel => channel.name.startsWith("bot"));
        if (!channel)
            continue;
        channel.send({ content: "Ahoy, Pirates! I'm back!" });
    }
}