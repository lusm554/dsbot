const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

class CsgoStack extends Command {
  constructor(client) {
    super(client, {
      name: 'cs_stack',
      aliases: ['cs'],
      group: 'games',
      memberName: 'games',
      description: 'Commad for create csgo stack.',
    })
  } 


  run(msg) { 
    try {
      return set(msg)
    } catch (e) {
      console.error(e)
    }
  }
}

const toArray = map => Array.from(map.keys())
const toMention = id => `<@!${id}>`

function set(msg) {
  let mentions = new Set([...toArray(msg.mentions.users), msg.author.id])
  mentions = toArray(mentions)
  
  if (mentions.length > 5) return msg.reply('Max 5 players.')

  const message = toMessageEmbed(mentions, mentions.map(toMention).join('\n'))    
  msg.author.client.on('messageReactionAdd', update_set)
  
  return msg.channel.send(message) 
    .then(msg => {
      msg.react('👍')
      msg.react('👎')
    })
}

function update_set(react, user) {
  if (user.bot) return;
  const emoji = react.emoji.name
  if (emoji !== '👍' && emoji !== '👎') return;
  const { fields } = react.message.embeds[0]
  let current_id = toMention(user.id)
  let ready = fields[1]['value'].split('\n')
  
  if (emoji === '👍') {
    if (ready.includes(current_id)) return;

    ready = toArray(
      new Set([...fields[1]['value'].split('\n').filter(a => a.length == 22), current_id])
    )
    if (ready.length > 5) return react.message.channel.send(`${current_id} Max 5 players.`)

    const message = toMessageEmbed(ready, ready.join('\n'))
    return react.message.edit(message) 
  } 
  
  if (!ready.includes(current_id)) return;
  ready = ready.filter(u => u !== current_id)
  return react.message.edit(toMessageEmbed(ready, ready.length && ready.join('\n')))  
}

function toMessageEmbed(ready, players) {
  const message = new MessageEmbed()
    .setTitle('CSGO Stack')
    .addField('READY', `${ready.length}/5`)
    .addField('Players:', players)
  return message
}

module.exports = CsgoStack

/* 
 |    |           *
 |    |            \       (__)
 |    |             \      (oo)
 |    |          -----------\/--
 |    |          ----|      |---
 |    |              --------
 |    \_________________
 |     _________________
 |    /
 |    |
 |    |
 |    |
 |    |
 |    |
 |    |
 |    |
/      \
Cow attempting to fly off a tree.
*/
