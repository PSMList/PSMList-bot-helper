import { embedLength } from "discord.js";

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function replyWithEmbeds(embeds) {
    embeds = Array.isArray(embeds) ? embeds : [ embeds ];
    const filteredEmbeds = [];
    for (const embed of embeds) {
        if (embedLength(embed) < 6000) {
            filteredEmbeds.push(embed);
        }
        else {
            const title = embed.title ?
                embed.title
                :
                embed.description && embed.description.length < 30 ?
                    embed.description
                    :
                    embed.fields && embed.fields.length > 0 && embed.fields[0].name ?
                        embed.fields[0].name
                        :
                        null
            console.error(`Too many results${title ? ` for: ${title}` : ''}`);
            filteredEmbeds.push({
                title: `${title ? `${title}: ` : ''}Too many results`,
                description: 'Results contains too much lines to be displayed, please refine your search terms.'
            });
        }
    }

    return {
        embeds: filteredEmbeds 
    }
}

export function sanitize(str) {
    return str
        // replace alternative apostrophes for the most widely used one
        .replace(/‘|’|`/g, "'")
        // remove non-classical characters (injections)
        .replace(/[^-\w'"À-ſ ]/g, '');
}