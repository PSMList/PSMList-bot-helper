import { Events } from "discord.js";
import { replyWithEmbeds } from "../commons/utils.js";

export const name = Events.MessageCreate;
export const once = false;

const oldCommandsRegex =
  /^psm (help|search|ship|crew|treasure|equipment|island|keyword|udc|simcost)/i;

export function execute(message) {
  try {
    // stop if the message is from a bot
    if (message.author.bot) {
      return;
    }

    // stop if the message doesn't start with prefix
    if (oldCommandsRegex.test(message.content)) {
      message.channel.send(
        replyWithEmbeds({
          title: `Support for old \`psm\` commands has been dropped in favor of slash-commands`,
          color: 0xff0000,
          description: `All your favorites features are still available!
          Type \`/help\` to get the full list of commands.
          More information [here](https://psmlist.com/public/blog/discord_slash_commands_update).`,
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
}
