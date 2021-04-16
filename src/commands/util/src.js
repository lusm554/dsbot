const { Command } = require('discord.js-commando')

class SrcCode extends Command {
  constructor(client) {
    super(client, {
      name: 'src',
      aliases: ['contribute', 'code'],
      group: 'util',
      memberName: 'utils',
      description: 'Commad for get src code of the bot.',
    })
  } 

  run(msg) { 
    msg.channel.send('https://github.com/lusm554/dsbot')
  }
}

module.exports = SrcCode 

