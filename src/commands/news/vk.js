const fetch = require('node-fetch')
const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const ACCESS_TOKEN= process.env.access_token

/**
 * INFO
 * How get owner id? - https://qna.habr.com/q/274430
 * How get group id? - It this is string after `https://vk.com/`
 * URL: https://vk.com/jumoreski group_id: jumoreski
 * 
 * owner_id = '-' + id
 */

class VKNews extends Command {
  constructor(client) {
    super(client, {
      name: 'vk',
      aliases: ['vk_news'],
      group: 'news',
      memberName: 'games',
      description: 'Commad for last post in group \'jumoreski\'.',
      guildOnly: true,
      args: [
        {
          key: 'group_id',
          type: 'string',
          prompt: 'Group id?',
          default: ''
        }
      ]
    })  
  } 

  async run(msg, { group_id }) {
    if (group_id === '') return msg.reply('Group doesn\'t exist. Try again.');
    const info = await getInfoAboutGroup(group_id)
    if (info.error) return msg.reply('Group doesn\'t exist. Try again.');

    return send_post(msg, await get_last_post('-'+info.id, 1), info)
  }

  onError(e) {
    console.log(e)
  }
}

function getInfoAboutGroup(group_id) {
  return fetch(`http://api.vk.com/method/groups.getById?group_id=${group_id}&fields=site,description,activity&access_token=${ACCESS_TOKEN}&v=5.130`)
    .then(res => res.json())
    .then(json => json.error ? json : json.response[0])
}

async function send_post(msg, posts, info) {
  for (let post of posts) {
    // REWRITE WITH OPPORTUNITY SEND BIG MESSAGES !!!!!!!!!!!!!!!!
    if (post.text.length > 1024) return msg.channel.send('msg too big :(');

    toMsg(post, info).forEach(async p => await msg.channel.send(p))
  }
  // let count_chunks = Math.ceil(post.text.length/1024)
  // for (let i = 1; i <= count_chunks; i++) {
  //   let to = 1024*i
  //   let from = to-1024
  //   await msg.channel.send(toMsg(post.text.slice(from, to), post.date, i==1 ? post.image : false))
  // } 
}

async function get_last_post(owner_id, count=1) {
  const raw_posts = await fetch(`http://api.vk.com/method/wall.get?owner_id=${owner_id}&count=${count+1}&access_token=${ACCESS_TOKEN}&v=5.130`)
    .then(res => res.json())
    .then(json => { 
      let unpinned = json.response.items.filter(item => item.is_pinned !== 1)
      if (json.response.items.length === unpinned.length) return unpinned.slice(0, unpinned.length-1);
      return unpinned
    })
  const posts = raw_posts
    .map(post => ({ date: post.date, text: post.text, attachments: post.attachments, post_id: post.id, owner_id }))

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

function toMsg(post, info) {
  const post_url = `https://vk.com/${info.screen_name}?w=wall${post.owner_id+'_'+post.post_id}`
  const main_msg = new MessageEmbed()
    .setTitle(info.name)
    .addField(new Date(post.date).toLocaleTimeString("en-US"), post.text)
    .setURL(post_url)
  let msgs = [main_msg]

  if (post.isPostHaveAttachments) { // To send several photos in MessageEmbed use -> https://discordjs.guide/popular-topics/webhooks.html#what-is-a-webhook
    if (post.attachments.length > 1) {
      post.attachments.forEach((photo, i) => {
        if (i==0) return msgs[0].setImage(photo.photo.sizes.pop().url);
        msgs.push(
          new MessageEmbed()
            .setTitle(info.name + ` other images ${i+1}/${post.attachments.length}`)
            .addField(new Date(post.date).toLocaleTimeString("en-US"), 'No caption')
            .setURL(post_url)
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
