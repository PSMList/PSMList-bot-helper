import list from '../commons/list.js';
import { replyWithEmbeds } from '../commons/utils.js';

const typesMap = {
    extensions: 'extension',
    expansions: 'extension',
    factions: 'faction',
    rarities: 'rarity',
    categories: 'keyword/category',
    targets: 'keyword/target',
}

export default function(message, which) {

    const embed = list(typesMap[which]);
    const reply = replyWithEmbeds(embed);
    message.channel.send(
        reply
    );
}