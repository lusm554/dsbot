const { Command } = require('discord.js-commando')

class MakeAdmin extends Command {
  constructor(client) {
    super(client, {
      name: 'makeadmin',
      aliases: ['ma'],
      group: 'util',
      memberName: 'util',
      description: 'Kick member from guild and send invite in some time.(ATTENTION! It\'s ROFL command.)',
      userPermissions: ['KICK_MEMBERS'],
      clientPermissions: ['KICK_MEMBERS']
    })
  } 

  run(msg) { 
    if (msg.mentions.users.size === 0) return msg.channel.send('You need mention user.')

    const user_id = Array.from(msg.mentions.users.keys())[0]
    if (msg.client.owners.some(owner => owner.id === user_id)) {
      return msg.channel.send('Wtf man, i can\'t kick my creator...')
    }

    let timeout_id = setTimeout(async () => {
      clearTimeout(timeout_id)
      msg.channel.createInvite({ maxUses: 1 })
        .then(invite => msg.mentions.users.get(user_id).send(`Come back :point_right::point_left:\n${invite}`))
        .catch(console.log)
    }, 10 * 1000) // 10 seconds

    return msg.channel.send(`Congrats, you are now admin of this server! ${msg.author}`)
      .then((msg) => new Promise((res, rej) => setTimeout(res, 3000, msg)))
      .then(msg => msg.edit('ROFL, KICK NAHUI'))
      .then(() => new Promise((res, rej) => setTimeout(res, 1500, 0)))
      .then(() => msg.guild.members.cache.get(user_id).kick() && null)
      .catch(() => msg.reply('I do not have permissions to kick :(') && clearTimeout(timeout_id))
  }
}

module.exports = MakeAdmin
