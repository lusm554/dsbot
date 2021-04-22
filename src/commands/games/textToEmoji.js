const { Command } = require('discord.js-commando')

class TextToEmoji extends Command {
  constructor(client) {
    super(client, {
      name: 'toemoji',
      aliases: ['toe'],
      group: 'games',
      memberName: 'mem',
      description: 'From tex to emoji',
      args: [
        {
          key: 'text',
          type: 'string',
          prompt: 'Text?',
          default: ':a: :regional_indicator_m: :o2: :regional_indicator_g: :regional_indicator_u: :regional_indicator_s:', // AMOGUS
        }
      ]
    })
  } 

  run(msg, { text }) { 
    if (text.length > 50) return msg.reply('Text too big (ㆆ_ㆆ)');
    const toCharEmoji = (char) => `:regional_indicator_${char.toLowerCase()}:`
    const isChar = (char) => /^[a-zA-Z]+$/.test(char)

    msg.channel.send(
      text.split('').map(char => isChar(char) ? toCharEmoji(char) : char).join(' ')
    )
  }
}

module.exports = TextToEmoji