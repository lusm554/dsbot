const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class WhoIs extends Command {
  constructor(client) {
    super(client, {
      name: 'whois',
      group: 'util',
      memberName: 'whois',
      description: 'Get info about user.'
    })
  } 

  run(msg) { 
    if (msg.mentions.users.size == 0) return msg.reply('U need mentions user ٩(˘◡˘)۶');
    const user = Array.from(msg.mentions.users.values())[0]
    const user_guild = msg.guild.members.cache.get(user.id)
    const toAvatarUrl = (user_id, user_avatar) => `https://cdn.discordapp.com/avatars/${user_id}/${user_avatar}.png`
    const toMoscowTime = (time) => {
      let d = new Date(time)
      let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      let nd = new Date(utc + (3600000*3)) // Moscow Standard Time -> UTC/GMT +3 hours
      return nd
    }

    const embed = new MessageEmbed()
      .setAuthor(user.username+'#'+user.discriminator, toAvatarUrl(user.id, user.avatar))
      .setDescription(`${user}`)
      .setColor('#cf9999')
      .setThumbnail(toAvatarUrl(user.id, user.avatar))
      .addField('Joined at:', `${toMoscowTime(user_guild.joinedTimestamp)}`, true)
      .addField('Status:', user.presence.status, true)
      .addField('Roles:', user_guild.roles.cache.map(r => `${r}`).join(' | '), true)
      .addField('Is bot', user.bot)
      .addField('Permissions:', `${user_guild.permissions.has('ADMINISTRATOR') ? 'ADMINISTRATOR' : user_guild.permissions.toArray().join('\n')}`)
      .setFooter(`ID: ${user.id}`)
      .setTimestamp();
    return msg.channel.send(embed)
  }
}

module.exports = WhoIs 
