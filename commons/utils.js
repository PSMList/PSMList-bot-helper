import { embedLength } from "discord.js";

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function stringEmbedLength(data) {
    return JSON.stringify(data).length;
}

/**
 * @param {import("discord.js").APIEmbed} data 
 */
function isValidEmbed(data) {
    if ((data.title?.length ?? 0) > 256) return false;
    if ((data.description?.length ?? 0) > 4096) return false;
    if ((data.footer?.text?.length ?? 0) > 2048) return false;
    if ((data.author?.name?.length ?? 0) > 256) return false;
    if (Array.isArray(data.fields)) {
        if (data.fields.length > 25) return false;
        if (
            data.fields.some(
                field =>
                    ((field.name?.length ?? 0) > 256)
                    ||
                    ((field.value.length ?? 0) > 1024)
            )
        ) return false;
    }
    if (embedLength(data) > 6000) return false;

    return true;
}

export function replyWithEmbeds(embeds) {
    embeds = Array.isArray(embeds) ? embeds : [ embeds ];
    if (stringEmbedLength(embeds) > 6500) {
        return {
            embeds: [{
                title: 'Search: too many results',
                description: 'Results contain too much lines to be displayed, please refine your search terms.'
            }]
        }
    }
    const filteredEmbeds = [];
    for (const embed of embeds) {
        if (isValidEmbed(embed)) {
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

            if (embed.title) {
                console.log(`Too long response${title ? ` for: ${title}` : ''}`);
                filteredEmbeds.push({
                    title: `${title ? `${title}: ` : ''}too long response`,
                    description: 'Please contact bot administrators.'
                });
            }
            else {
                console.log(`Too many results${title ? ` for: ${title}` : ''}`);
                filteredEmbeds.push({
                    title: `${title ? `${title}: ` : ''}too many results`,
                    description: 'Results contains too much lines to be displayed, please refine your search terms.'
                });
            }
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