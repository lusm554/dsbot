const { Command } = require('discord.js-commando')

class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      group: 'util',
      memberName: 'utilss',
      description: 'Get all commands.',
    })
  } 

  run(msg) { 
    let cmds = msg.client.registry.commands.values()
    let info = {}
    for (let cmd of cmds) {
      if (cmd.hidden || cmd.ownerOnly) continue;
      if (!(cmd.groupID in info)) {
        info[cmd.groupID] = [cmd]
        continue
      }  
      info[cmd.groupID].push(cmd)
    }
    let str_info = ''
    for (let group in info) {
      str_info += `__${group}__\n`
      for (let cmd of info[group]) {
        console.log(cmd.name, cmd.format)
        str_info += `**${cmd.name}:** ${cmd.description} ${cmd.format?`__How use:__ ${cmd.format}\n`:'\n'}`
      }
      str_info += '\n'
    }
    msg.author.send(str_info)
  }
}

module.exports = Help 

