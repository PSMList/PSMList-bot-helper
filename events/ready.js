import { Events } from "discord.js";
import { GUILDS } from "../secret.js";

export const name = Events.ClientReady;
export const once = true;

export const millisecondsInDay = 24 * 60 * 60 * 1000;
const expiresDate = new Date("10-20-2023");
const formatter = new Intl.RelativeTimeFormat("en-us", {
  style: "long",
  numeric: "auto",
});

function formatDaysAgo(date) {
  let duration = date - new Date();

  return formatter.format(Math.round(duration / millisecondsInDay), "days");
}

export function execute(bot) {
  console.log(`Ready! Logged in as ${bot.user.tag}`);

  return;

  function showExpires() {
    for (const GUILD of Object.values(GUILDS)) {
      const guild = bot.guilds.cache.get(GUILD.id);
      if (!guild) continue;
      const channel = guild.channels.cache.find((channel) =>
        channel.name.startsWith(GUILD.channel)
      );
      if (!channel) continue;
      channel.send({
        embeds: [
          {
            title: "Patience, CSG patent will soon be past!",
            description: `The CSG patent that prevents from bringing back Pirates CSG will expire ${formatDaysAgo(
              expiresDate
            )} (10/20/2023). More info here: https://pirateswithben.com/legal-research-and-outreach-collection-post/`,
          },
        ],
      });
    }
  }

  setInterval(showExpires, millisecondsInDay);
}
