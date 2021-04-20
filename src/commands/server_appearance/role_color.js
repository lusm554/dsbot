const { Command } = require('discord.js-commando')

class Echo extends Command {
  constructor(client) {
    super(client, {
      name: 'rainbow',
      aliases: ['colorful'],
      group: 'server appearance',
      memberName: 'server appearance',
      description: 'Change role color.',
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      guildOnly: true,
      hidden: true,
      args: [
        {
          key: 'roles',
          prompt: 'Roles for rainbow?',
          type: 'string',
          default: '',
        }
      ]
    })
  } 

  run(msg, { roles }) {
    try {
      const roleId = roles.match(/\d+/g)[0]
      const role = msg.guild.roles.cache.get(roleId)
      let i = 0
      let colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#2E2B5F', '#8B00FF']
      let id = setInterval(() => {
        if (i > colors.length) { 
          i = 0 
        }
        role.setColor(colors[i++])
          .catch(e => {
            clearInterval(id)
            msg.reply('Permission denied.')
          })
      }, 1000)
      setTimeout(() => {clearInterval(id)}, 60000)
      return msg.reply(`The color of ${roles} role will change for 1 minute`)
    } catch (e) {
      return msh.reply('Error :(')
    }
  }
  
  onError(e, msg, args) {
    console.log('[ERROR]', e)
    return msg.reply('Error while running this command :(')
  }
}

module.exports = Echo
