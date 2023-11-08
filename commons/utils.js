import { embedLength } from "discord.js";
import { CUSTOM_DISCLAIMER } from "./search.js";

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

function cutStringBeforeNewLine(string, length) {
    string = string.substring(length);
    const newLineIndex = string.lastIndexOf('\n');
    return string.substring(newLineIndex);
}

export function replyWithEmbeds(embeds) {    
    if (!Array.isArray(embeds)) {
        embeds = [embeds];
    }

    if (stringEmbedLength(embeds) > 6500) {
        let biggestEmbed = embeds[0];
        for (let index in embeds) {
            if (stringEmbedLength(embeds[index]) > stringEmbedLength(biggestEmbed)) {
                biggestEmbed = embeds[index];
            }
        }
        if (typeof biggestEmbed === 'string') {
            embeds[index] = cutStringBeforeNewLine(biggestEmbed, 3000);
        }
        if (typeof biggestEmbed === 'object') {
            if (biggestEmbed.hasOwnProperty('description') && biggestEmbed.description.length > 3000) {
                biggestEmbed.description = StringBeforeNewLine(biggestEmbed.description, 3000) + '...';
            }
            if (biggestEmbed.hasOwnProperty('fields')) {
                let removedResultsTotalCount = 0;
                while(stringEmbedLength(embeds) > 5500) {
                    let removedField = biggestEmbed.fields.pop();
                    if (removedField.value.match(CUSTOM_DISCLAIMER)) {
                        const customDisclaimerField = removedField;
                        removedField = biggestEmbed.fields.pop();
                        biggestEmbed.fields.push(customDisclaimerField);
                    }
                    const removedResultsCount = (removedField.value.match(/\n/gm) || []).length;
                    removedResultsTotalCount += removedResultsCount;
                }
                biggestEmbed.fields.push({ name: ' \u200b', value: `... and ${removedResultsTotalCount} more truncated results`, inline: true });
            }
        }
        embeds.splice(embeds.indexOf(biggestEmbed) + 1, 0, {
            title: 'Truncated result',
            description: `This result contains too many lines for Discord to allow displaying everything.
            Please consider selecting more accurate search terms.
            
            In the case you want everything, You can use the [ship](https://psmlist.com/public/ship/search), [crew](https://psmlist.com/public/crew/search) or [treasure](https://psmlist.com/public/treasure/search) search pages directly on [psmlist](https://psmlist.com/public/).`.replace(/^ */gm, ''),
            color: 0x428BCA
        });
    }

    const lastEmbed = embeds[0];
    if (typeof lastEmbed === 'string') {
        embeds[0] = {
            description: embeds[0]
        };
    }
    lastEmbed.footer = { text: 'Provided by PSMList.com', icon_url: 'https://psmlist.com/public/img/logo_x32.png' };

    return {
        embeds
    }
}

export function sanitize(str) {
    return str
        .trim()
        // replace alternative apostrophes for the most widely used one
        .replace(/‘|’|`/g, "'")
        // remove non-classical characters (injections)
        .replace(/[^-\w'"À-ſ ]/g, '');
}