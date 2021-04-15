const { Command } = require('discord.js-commando')

class UnknownCommandCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unknown-command',
      group: 'util',
      memberName: 'unknown-command',
      description: 'Displays help information for when an unknown command is used.',
      examples: ['unknown-command smth'],
      unknown: true,
      hidden: true
    })
  }
  
  run(msg) {
    const bot_mention = `@${msg.client.user.username}`
    const msg404 = ':four::zero::four::triangular_flag_on_post:'
    return msg.reply(`command not found ${msg404}.\n Use \`${bot_mention} help\``)
  }
}

module.exports = UnknownCommandCommand
