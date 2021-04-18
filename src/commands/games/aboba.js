const { Command } = require('discord.js-commando')
const ytdl = require('ytdl-core');
const urls = [
  'https://www.youtube.com/watch?v=3HrSVXP99kQ&ab_channel=DolbaLight', 
  "https://www.youtube.com/watch?v=x3kh4dmuZW4&ab_channel=%D0%9C%D0%95%D0%9C%D0%9D%D0%90%D0%AF%D0%9A%D0%9E%D0%9B%D0%91%D0%90%D0%A1%D0%90",
]

class Aboba extends Command {
  constructor(client) {
    super(client, {
      name: 'aboba',
      group: 'games',
      memberName: 'meme',
      description: 'Command for aboba...',
    })
  } 

  run(msg) { 
    try {
      if (msg.member.voice.channel) {
        return connect_to_say(msg)
      }
      return send_text_aboba(msg)
    } catch (e) {
      console.error(e)
    }
  }
}

async function connect_to_say(msg) {
  const channel = msg.member.voice.channel 
  const song_info = await ytdl.getInfo(urls[1])

  const conn = await channel.join()
  const stream = ytdl(urls[1], { filter: 'audioonly' })
  conn.play(stream, { seek: 0, volume: 1 })
    .on('finish', () => {
      conn.disconnect()
    })
}

function send_text_aboba(msg) {
  const aboba = ':a::b::o2::b::a:'
  return msg.channel.send(aboba)
}

/*
                        (__)
                ~~      (oo)
            ~~~~ /-------\/
         ~~~~~  / |     ||
       ~~~~~   *  ||----||
    ~~~~~~~~  ====~~====~~====
~~~~~~~~~/
~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     Cow Hanging Ten at Malibu(балдеет)
*/

module.exports = Aboba
