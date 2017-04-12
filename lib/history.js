'use strict'

const bluebird = require('bluebird')
const fecha = require('fecha')
const redis = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

class History {
  constructor({ port, host, db, prefix }) {
    this.redis = redis.createClient(port, host, { db, prefix })
  }

  async getAfterDate(defaultAfterAt) {
    const afterAt = await this.redis.getAsync('after_at')
    return fecha.parse(afterAt ? afterAt : defaultAfterAt, 'YYYY-MM-DD')
  }

  async setAfterDate(afterDate) {
    await this.redis.setAsync('after_at', fecha.format(afterDate, 'YYYY-MM-DD'))
  }

  quit() {
    this.redis.quit()
  }
}

module.exports = History
