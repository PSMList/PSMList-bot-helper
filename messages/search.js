import search from '../commons/search.js';
import { prefix } from '../config.js';
import { replyWithEmbeds } from '../commons/utils.js';

export default async function(message, command, searchType, args) {
    let input = '';
    let custom = '';

    if (args[0] === 'custom') {
        args.shift();
        if (args[0] !== 'include') {
            custom = 'only';
            if (args[0] !== 'only') {
                args.unshift('');
            }
        }
        else {
            custom = 'include';
        }
        args.shift();
    }

    switch (searchType) {
        case 'id':
            if (args.length > 1) {
                return message.channel.send(
                    replyWithEmbeds({
                        title: 'Wrong input format',
                        description: 'Please provide only one ID per research.'
                    })
                );
            }
            input = args[0];
            if (input.length > 10) {
                return message.channel.send(
                    replyWithEmbeds({
                        title: 'Wrong input format',
                        description: 'ID is limited to 10 characters.'
                    })
                );
            }
            break;
        case 'name':
        case 'text':
            input = args.join(' ');
            if (input.replace(' ', '').length < 3) {
                return message.channel.send(
                    replyWithEmbeds({
                        title: 'Wrong input format',
                        description: 'Name needs at least 3 characters.'
                    })
                );
            }
            if (input.length > 30) {
                return message.channel.send(
                    replyWithEmbeds({
                        title: 'Wrong input format',
                        description: 'Name is limited to 30 characters.'
                    })
                );
            }
            break;
        default:
            return message.channel.send(
                replyWithEmbeds({
                    title: 'Wrong input format',
                    description: `Please indicate if you search by \`name\` or \`id\`.\nType \`${prefix}help\` if needed.`
                })
            );
    }

    const embeds = await search(
        searchType,
        command === 'search' ?
            'all'
            :
            command,
        input,
        custom
    );

    return message.channel.send(
        replyWithEmbeds(embeds)
    )
    .catch(err => {
        console.log(err);
        message.channel.send(
            replyWithEmbeds({
                title: 'Unexpected internal error',
                description: 'Please try again later or contact the bot maintainers.'
            })
        );
    });
}