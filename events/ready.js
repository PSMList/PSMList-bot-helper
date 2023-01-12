import { Events } from 'discord.js';
import { GUILD_ID } from '../secret.js';

export const name = Events.ClientReady;
export const once = true;

export function execute(bot) {
    console.log(`Ready! Logged in as ${bot.user.tag}`);

    return;
    const guild = bot.guilds.cache.get(GUILD_ID);
    if (!guild)
        return;
    const channel = guild.channels.cache.find(channel => channel.name.startsWith('bot'));
    if (!channel)
        return;
    channel.send({ content: "Ahoy, Pirates! I'm back!" });
}