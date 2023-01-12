import help from '../commons/help.js';
import { prefix } from '../config.js';
import { replyWithEmbeds } from '../src/utils.js';

export default function(message, command) {

    const embed = help(command, prefix);

    const reply = replyWithEmbeds(embed);
    message.channel.send(
        reply
    );
}