import help from '../commons/help.js';
import { prefix } from '../config.js';
import { replyWithEmbeds } from '../commons/utils.js';

export default function(message, command) {

    const embed = help(command || 'help', prefix);

    const reply = replyWithEmbeds(embed);
    message.channel.send(
        reply
    );
}