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
          default: '',
        }
      ]
    })
  } 

  async run(msg, { text }) { 
    if (text.length == 0) return msg.reply('Text not found 404.')
    if (text.length > 50) return msg.reply('Text too big (ㆆ_ㆆ)');
    const toCharEmoji = (char) => `:regional_indicator_${char.toLowerCase()}:`
    const isChar = (char) => /^[a-zA-Z]+$/.test(char)

    if (text.startsWith('lusm_rofl')) {
      msg.delete()
      const _anim = animation(Array.from(msg.mentions.users.keys())[0])
      let send_msg = await msg.channel.send(_anim.next().value)
      for (let frame of _anim) {
        await new Promise((res, rej) => setTimeout(res, 300, 2))
        send_msg = await send_msg.edit(frame)
      }
      return
    }

    return msg.channel.send(
      text.split('').map(char => isChar(char) ? ` ${toCharEmoji(char)}` : char).join('')
    )
  }
}

function *animation(user='', emotion=':weary:') {
  yield* hand_anim(emotion)       
  yield `:ok_hand:           ${emotion} 
  :eggplant: :zzz:  :necktie:  :eggplant: 
                 :oil:       :nose:
              :zap:8==:punch:D :sweat_drops: 
         :trumpet:       :eggplant:                :sweat_drops:
                                               ${user ? `<@${user}>` : ''}`
}

function *hand_anim(emotion, num=4) {
  const first_frame = `:ok_hand:           ${emotion}
  :eggplant: :zzz:  :necktie:  :eggplant: 
                 :oil:       :nose:
              :zap:8==:punch:D
         :trumpet:       :eggplant:`
  const second_frame = `:ok_hand:           ${emotion} 
  :eggplant: :zzz:  :necktie:  :eggplant: 
                 :oil:       :nose:
              :zap:8=:punch:=D
         :trumpet:       :eggplant:`
  
  for (let i = 0; i < num; i++) {
    i % 2 == 0 ? yield first_frame : yield second_frame
  }         
}

module.exports = TextToEmoji