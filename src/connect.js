const { MongoClient } = require('mongodb')
const { start: startNewsEvents } = require('./events/news.event')
const NewsDAO = require('./dao/news.dao.js')

function connect(discordClient) {
  const url = process.env.MONGO_URL
  const mClient = new MongoClient(url, { useUnifiedTopology: true })

  mClient.connect()
    .then(async MongoDBClient => {
      await NewsDAO.injectDB(MongoDBClient)
      console.log('\x1b[35m%s\x1b[0m', '[DATABASE] Connected.')

      discordClient.login(process.env.TOKEN)
      discordClient.on('ready', startNewsEvents.bind(null, discordClient))
    })
}

module.exports = connect