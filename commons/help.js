import { prefix } from "../config.js";

const indentation = '\u200b \u200b \\> ';

const slashHelp = ['ping', 'search id', 'search name', 'list', 'cost']
    .reduce((help, command) => `${help}${indentation}\`/${command}\`\n`, '');

const prefixHelp = ['ping', 'search', 'ship', 'fort', 'crew', 'treasure', 'keyword', 'list', 'cost']
    .reduce((help, command) => `${help}${indentation}\`${prefix}${command}\`\n`, '');

function allHelp(prefix) {
	return `Type \`${prefix}help <command>\` to get detailed information.

        Available commands:
		${prefix === '/' ? slashHelp : prefixHelp}
		For further help, please check the [documentation](https://psmlist.com/public/blog/documentation_psmlisthelper) on psmlist.com.`;
}

export default function(command, prefix) {
    let helpMessage = '';
    let helpTitle = `Help for \`${command}\` command`;

    if (command.startsWith('search')) {
        command = 'search';
    }

    switch (command) {
        case 'search':
            helpMessage =
                `Type \`${prefix}search id <id>\` or \`${prefix}search name <name>\` to search in database\n` +
                `Ex: \`${prefix}search id oe001\``
                ;
            if (prefix !== '/') {
                helpMessage += 
                    `\nType \`${prefix}search\` to be redirected to the website`
            }
            break;
        case 'ship':
            helpMessage =
                'Shows information about a ship based on its `name` or `id`.\n' +
                `\`${prefix}ship id <id>\` or \`${prefix}ship name <name>\`\n` +
                `Ex: \`${prefix}ship id oe059\``
                ;
            break;
        case 'fort':
            helpMessage =
                'Shows information about a fort based on its `name` or `id`.\n' +
                `\`${prefix}fort id <id>\` or \`${prefix}fort name <name>\`\n` +
                `Ex: \`${prefix}fort id rvu065\``
                ;
            break;
        case 'crew':
            helpMessage =
                'Shows information about a crew based on its `name` or `id`.\n' +
                `\`${prefix}crew id <id>\` or \`${prefix}crew name <name>\`\n` +
                `Ex: \`${prefix}crew id ca063\``
                ;
            break;
        case 'keyword':
            helpMessage =
                `
                    \`${prefix}keyword name <name>\`: Shows the effect of the keyword
                    \`${prefix}keyword categories\`: List of keyword categories
                    \`${prefix}keyword targets\`: List of keyword targets
                `;
            break;
        case 'treasure':
            helpMessage =
                'Shows information about a treasure based on its `name` or `id`.\n' +
                `\`${prefix}treasure id <id>\` or \`${prefix}treasure name <name>\`\n` +
                `Ex: \`${prefix}treasure id rof209\``
                ;
            break;
        case 'list':
            helpMessage = `Type \`/list <type>\`:
            ${indentation}\`expansions\`: Official expansions
            ${indentation}\`factions\`: Official factions for ships and crew
            ${indentation}\`rarities\`: Rarities on cards
            ${indentation}\`keyword categories\`: Keyword categories
            ${indentation}\`keyword target\`: Possible targets for keywords`
            break;
        case 'cost':
            helpMessage = `Calculates the point value of a ship based on the [UDC](https://psmlist.com/public/udc_calculator) and [SimCost](https://psmlist.com/public/simcost_calculator) algorithms.

            Type \`${prefix}${command} <masts> <cargo> <speed> <cannons>\`
            
            \`speed\` is a list of speed letters (S, L, D, T) with or without a + sign in between.
            \`cannons\` is a list of cannons dice (1 to 6) and range (S or L) with or without a space in between.
            Lowercase letters are supported.
            
            Ex: \`${prefix}${command} 3 5 SL 2S3L2S\`
            or \`${prefix}${command} 3 5 s+l 2s 3l 2s\``;
            break;
        case 'ping':
            helpMessage = 'Test your ping for fun!';
            break;
        default:
            helpTitle = 'Help';
            helpMessage = allHelp(prefix);
    }
    if (['search', 'ship', 'fort', 'crew', 'treasure'].includes(command)) {
        helpMessage += `
                        Type \`${prefix}${command} name "<text>"\` (double quote) to do an exact research.

                        ID research has a permissive syntax:
                        ${indentation}\`${prefix}expansions\` shows original, community and WizKids short names to use as a prefix
                        ${indentation}it is not case sensitive -> PotCC = potcc = POTCC
                        ${indentation}leading zeros are optional -> oe001 = oe01 = oe1`
    }

    return {
        title: helpTitle,
        description: helpMessage.replace(/^ +/gm, '')
    }
}