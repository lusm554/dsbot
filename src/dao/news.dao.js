let news;
let last_post;

class NewsDAO {
  static async injectDB(conn) {
    if (news) return;
    try {
      news = await conn.db(process.env.DB_NAME).collection('news')
      last_post = await conn.db(process.env.DB_NAME).collection('last_post')

      await news.createIndex({ group_id: 1, channel_id: 1 }, { unique: true })
      await last_post.createIndex({ group_id: 1 }, { unique: true })
    } catch (error) {
      console.log('[DATABASE ERROR]')
      console.error(error)
    }
  }

  static async getLastPost(group_id) {
    try {
      return await last_post.findOne({ group_id })
    } catch (error) {
      return { error } 
    }
  }

  static async updateLastPost(group_id, post) {
    try {
      post.updated_at = new Date().getTime()
      const updateDoc = {
        $set: {
          group: post
        }
      }
      await last_post.updateOne({ group_id }, updateDoc, { upsert: true })
      return { isOk: true }
    } catch (error) {
      return { error }
    }
  }

  static async addGroup(group_info) {
    try {
      group_info.created_at = group_info.updated_at = new Date().getTime()

      await news.insertOne(group_info)
      return { isOk: true }
    } catch (error) {
      return { error }
    }
  }

  static async getGroupsList(filter) {
    try {
      let cursor = await news.find(filter || {})//.limit(5)
      let groupList = []
      await cursor.forEach(a => groupList.push(a))
      return groupList
    } catch (error) {
      return { error }
    }
  }

  static async getBy(query, options=false) {
    try {
      return options ? await news.find(query)[options]() : await news.findOne(query)
    } catch (error) {
      return { error }
    }
  }

  static async deleteGroup(query) {
    try {
      await last_post.deleteOne({ group_id: query.group_id })
      return await news.deleteOne(query)
    } catch (error) {
      return { error }
    }
  }
}

module.exports = NewsDAO