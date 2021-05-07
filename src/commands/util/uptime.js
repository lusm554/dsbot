const { Command } = require('discord.js-commando')

class UpTime extends Command {
  constructor(client) {
    super(client, {
      name: 'uptime',
      group: 'util',
      memberName: 'uptime',
      description: 'Get uptime of the bot.'
    })
  } 

  run(msg) { 
    let totalSeconds = (msg.client.uptime / 1000)
    let days = Math.floor(totalSeconds / 86400)
    totalSeconds %= 86400
    let hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    let minutes = Math.floor(totalSeconds / 60)
    let seconds = Math.floor(totalSeconds % 60)

    return msg.reply(`${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`)
  }
}

module.exports = UpTime