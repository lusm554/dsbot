const fetch = require('node-fetch')
const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const ACCESS_TOKEN= process.env.access_token

// How get owner id? - https://qna.habr.com/q/274430

class VKNews extends Command {
  constructor(client) {
    super(client, {
      name: 'vk',
      aliases: ['u'],
      group: 'news',
      memberName: 'games',
      description: 'Commad for last post in group \'jumoreski\'.',
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      // args: [
      //   {
      //     key: 'owner_id',
      //     type: 'string',
      //     error: 'Owner id '
      //   }
      // ]
    })
  } 

  async run(msg) {
    return send_post(msg, await get_last_post())
  }

  onError(e) {
    console.log(e)
  }
}

async function send_post(msg, posts) {
  // return msg.channel.send(1)
  for (let post of posts) {
    // REWRITE WITH OPPORTUNITY SEND BIG MESSAGES !!!!!!!!!!!!!!!!
    if (post.text.length > 1024) return msg.channel.send('msg too big :(');

    toMsg(post).forEach(async p => await msg.channel.send(p))
  }
  // let count_chunks = Math.ceil(post.text.length/1024)
  // for (let i = 1; i <= count_chunks; i++) {
  //   let to = 1024*i
  //   let from = to-1024
  //   await msg.channel.send(toMsg(post.text.slice(from, to), post.date, i==1 ? post.image : false))
  // } 
}

async function get_last_post(owner_id=-92876084) {
  const raw_posts = await fetch(`http://api.vk.com/method/wall.get?owner_id=${owner_id}&count=13&access_token=${ACCESS_TOKEN}&v=5.130`)
    .then(res => res.json())
    .then(json => json.response.items)
  const posts = raw_posts
    .map(post => ({ date: post.date, text: post.text, attachments: post.attachments }))

  return posts.map(post => {
    if (post.attachments === undefined) {
      post.isPostHaveAttachments = false
      return post
    }
    post.text = post.text || 'No caption'
    post.attachments = post.attachments.filter(file => {
      if (file.type !== 'photo') {
        post.isPostAttachmentsHaveNotSupportedType = true
        return false
      } else {
        post.isPostHaveAttachments = true
        return true
      }
    })
    return post
  })
}

function toMsg(post) {
  const main_msg = new MessageEmbed()
    .setTitle('Мои любимые юморески') // CHANGE ON GROUP NAME FROM DATABASE !!!!!
    .addField(new Date(post.date).toLocaleTimeString("en-US"), post.text)
    .setURL('https://google.com') // CHANGE ON POST URL !!!!
  let msgs = [main_msg]

  if (post.isPostHaveAttachments) { // To send several photos in MessageEmbed use -> https://discordjs.guide/popular-topics/webhooks.html#what-is-a-webhook
    if (post.attachments.length > 1) {
      post.attachments.forEach((photo, i) => {
        if (i==0) return msgs[0].setImage(photo.photo.sizes.pop().url);
        msgs.push(
          new MessageEmbed()
            .setTitle('Мои любимые юморески' + ` other images ${i+1}/${post.attachments.length}`) // CHANGE ON GROUP NAME FROM DATABASE !!!!!
            .addField(new Date(post.date).toLocaleTimeString("en-US"), 'No caption')
            .setURL('https://google.com') // CHANGE ON POST URL !!!!
            .setImage(photo.photo.sizes.pop().url)
        )
      })
    } else {
      msgs[0].setImage(post.attachments[0].photo.sizes.pop().url)
    }
  }
  if (post.isPostAttachmentsHaveNotSupportedType) {
    msgs = msgs.map(msg => msg.setFooter('*The post is not complete, see the original'))
  }
  return msgs
}

module.exports = VKNews
