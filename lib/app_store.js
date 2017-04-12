'use strict'

const bluebird = require('bluebird')
const log = require('fancy-log')
const fecha = require('fecha')
const got = require('got')
const parser = require('xml2json')

class AppStore {
  constructor({ appId }) {
    this.endpoint = `http://itunes.apple.com/jp/rss/customerreviews/page=1/id=${appId}/sortBy=mostRecent/xml`
    this.ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
  }

  async fetch() {
    const headers = { 'User-Agent': this.ua }
    const res = await got(this.endpoint, { headers })
    const result = parser.toJson(res.body, { object: true })
    const reviews = result.feed.entry
      .filter(entry => !entry.id['im:bundleId'])
      .map(entry => {
        const body = entry.content
          .filter(content => content.type === 'text')
          .map(content => content['$t'])[0]

        return {
          title: entry.title,
          author: entry.author.name,
          rating: entry['im:rating'],
          date: fecha.parse(entry['updated'], 'YYYY-MM-DD[T]HH:mmZZ'),
          body,
        }
      })
    return reviews
  }
}

module.exports = AppStore
