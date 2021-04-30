const EventEmitter = require('events')
const NewsDAO = require('../dao/news.dao')
const newsEmitter = new EventEmitter()

const delay = 2 // minutes
let discordClient;
let interval_id;
 
function start(dc) {
  discordClient = dc
  interval_id = setInterval(lookNews, delay * 60 * 1000) //delay * 60 * 1000
}

async function lookNews() {
  let cursor = await NewsDAO.getGroupsList()
  let list = []
  await cursor.forEach(a => list.push(a))
  if (list.length === 0) return;

  for (let group of list) {
    newsEmitter.emit('post', { group_id: group.group_id }, discordClient.channels.cache.get(group.channel_id))
  }
}

newsEmitter.on('error', (err) => {
  console.log(err)
  clearInterval(interval_id)
})

module.exports = { start, newsEmitter }
