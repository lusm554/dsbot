const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class Emoji extends Command {
  constructor(client) {
    super(client, {
      name: 'emoji',
      aliases: ['e'],
      group: 'util',
      memberName: 'emoji',
      description: 'Get emoji by name from another server',
      args: [
        {
          key: 'e_name',
          type: 'string',
          prompt: 'Emoji name?',
          default: '',
        },
        {
          key: 'isFullInfo',
          type: 'boolean',
          prompt: 'Looking for emoji information?',
          default: false
        }
      ]
    })
  } 

  run(msg, { e_name, isFullInfo }) {
    try {
      if (e_name.length == 0) return;

      const emojis = []
      msg.client.guilds.cache.forEach((v, k) => emojis.push(...v.emojis.cache));
      const current = emojis.find(([k, v]) => v.name == e_name)
      if (!current) return;

      if (isFullInfo) {
        return msg.channel.send(getInfoAboutEmoji(current[1], msg))
      }
      return msg.delete().then(() => msg.channel.send(`${current[1]}`))
    } catch (error) {
      console.log(error)
      return msg.reply('Emoji not found.')
    }
  }
}

function getInfoAboutEmoji(emoji, msg) {
  const user = msg.author

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
      .addField('Created at:', `${toMoscowTime(emoji.createdAt)}`, true)
      .addField('Server name:', emoji.guild.name)
      .addField('Server ID:', emoji.guild.id)
      .setTitle(emoji.url)
      .setColor('#cf9999')
      .setThumbnail(emoji.url)
      .setFooter(`Emoji ID: ${emoji.id}`)
      .setTimestamp();

  console.log(emoji.author)
  return embed
}

module.exports = Emoji