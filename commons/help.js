const indentation = "\u200b \u200b \\> ";

function trim(value) {
  return value.replaceAll(/^\s*/g, "");
}

const helpMessages = {
  help: trim(`Type \`/help <command>\` to get detailed information.

    Available commands:
    ${["ping", "search id", "search name", "list", "cost"].reduce(
      (help, command) => `${help}${indentation}\`/${command}\`\n`,
      ""
    )}
    For further help, please check the [documentation](https://psmlist.com/public/blog/documentation_psmlisthelper) on psmlist.com.`),
  "search name":
    trim(`Shows information about an item in PSMList databased based on its \`name\`
    \`/search name <type> <name>\` or \`/search name <type> <name> <custom>\`
    Ex: \`/search name ship HMS\`
    Ex: \`/search name crew Cheval include\`
    
    Type \`/search name <type> "<name>"\` with double quotes to do an exact research.`),
  "search id":
    trim(`Shows information about an item in PSMList databased based on its \`id\`
    \`/search id <type> <id>\` or \`/search id <type> <id> <custom>\`
    Ex: \`/search id ship oe059\`
    Ex: \`/search id crew 63 include\`

    ID research has a permissive syntax:
    ${indentation}\`/list expansions\` shows original, community and WizKids short names to use as a prefix
    ${indentation}it is not case sensitive -> PotCC = potcc = POTCC
    ${indentation}leading zeros are optional -> oe001 = oe01 = oe1`),
  list: trim(`Type \`/list <type>\`:
    ${indentation}\`expansions\`: Official expansions
    ${indentation}\`factions\`: Official factions for ships and crew
    ${indentation}\`rarities\`: Rarities on cards
    ${indentation}\`keyword categories\`: Keyword categories
    ${indentation}\`keyword target\`: Possible targets for keywords`),
  cost: trim(`Calculates the point value of a ship based on the [UDC](https://psmlist.com/public/udc_calculator) and [SimCost](https://psmlist.com/public/simcost_calculator) algorithms.

    Type \`/cost <masts> <cargo> <speed> <cannons>\`
    
    \`speed\` is a list of speed letters (S, L, D, T) with or without a + sign in between.
    \`cannons\` is a list of cannons dice (1 to 6) and range (S or L) with or without a space in between.
    Lowercase letters are supported.
    
    Ex: \`/cost 3 5 SL 2S3L2S\`
    or \`/cost 3 5 s+l 2s 3l 2s\``),
  ping: "Test your ping for fun!",
};

export default function (command, param) {
  const helpTitle =
    command === "help" ? "Help" : `Help for \`${command}\` command`;

  let helpMessage = helpMessages[command];

  if (!helpMessage) {
    helpMessage = helpMessage.help;
  }

  return {
    title: helpTitle,
    description: helpMessage.replace(/^ +/gm, ""),
  };
}
