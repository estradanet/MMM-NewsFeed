/* Magic Mirror
 * Module: MMM-NewsFeed
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

const NodeHelper = require("node_helper")
const FeedMe = require("feedme")
const request = require("request")
var log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    console.log("[FEED] MMM-NewsFeed Version:", require('./package.json').version)
    this.RSS= []
    this.RSSConfig= []
    this.RSSLoaded = []
    this.updateTimer = null
    this.Flux= null
    this.dateNow= new Date()
    this.dateRelease= new Date("01-01-2021")
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "CONFIG":
        this.config = payload
        if (this.config.debug) log = (...args) => { console.log("[FEED]", ...args) }
        this.config.update = this.getUpdateTime(this.config.update)
        log("Config:" , this.config)
        this.RSSConfig= this.config.flux
        log("RSSConfig:", this.RSSConfig)
        if (this.dateNow >= this.dateRelease) this.initialize()
        else return console.log("[FEED] This module will be available and scheduled to be released at 01 January 2021")
        break
      case "SUSPEND":
        clearInterval(this.updateTimer)
        log("Update Timer Off")
        break
      case "RESUME":
        if (this.dateNow >= this.dateRelease) {
          this.update()
          this.scheduleNextFetch()
        }
        else return console.log("[FEED] This module will be available and scheduled to be released at 01 January 2021")

    }
  },

  initialize: async function () {
    await this.getInfos()
    log("Flux RSS chargé: " + this.RSSLoaded.length + "/" + this.RSSConfig.length)
    console.log("[FEED] MMM-NewsFeed est now initialized!")
    this.sendSocketNotification("INITIALIZED")
    this.scheduleNextFetch()
  },

  getInfos: async function () {
    this.RSSLoaded = await this.checkRSS()

    log("Titles found:", this.RSS.length)
    var removeDupli = this.removeDuplicates(this.RSS, "title")
    log("Duplicate removed:", this.RSS.length - removeDupli.length)
    this.RSS= removeDupli

    this.RSS.sort(function (a, b) {
      var dateA = new Date(a.pubdate);
      var dateB = new Date(b.pubdate);
      return dateB - dateA;
    })
    log("Titles sort by date: Done ✓")

    if (this.config.maxItems > 0) {
     this.RSS = this.RSS.slice(0, this.config.maxItems)
     log("Titles displayed: ", this.RSS.length)
    }

    this.sendDATA(this.RSS)
  },

  checkRSS: function() {
    let data = []
    this.RSSConfig.forEach(flux => {
      data.push(this.getRssInfo(flux.from, flux.url))
    })
    return Promise.all(data)
  },

  getRssInfo: function (from, url) {
    return new Promise(resolve => {
      const rss = new FeedMe()
      const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
      const opts = {
        headers: {
          "User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MMM-NewsFeed v" + require('./package.json').version + " (https://github.com/bugsounet/MMM-NewsFeed)",
          "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate", Pragma: "no-cache"
        },
        encoding: null
      }
      log ("Fetch Rss infos:", from, "(" + url + ")")

      request(url, opts)
        .on("error", error => {
          console.log("[FEED] Error! " + error)
          resolve("Error")
        })
        .pipe(rss)

      rss.on("item", async item => {
        this.RSS.push ({
          title: item.title,
          description: item.description.replace(/(<([^>]+)>)/gi, ""),
          pubdate: item.pubdate || item.published || item.updated || item["dc:date"],
          image: await this.getImage(item),
          url: item.link,
          from: from
        })
      })
      rss.on("end", () => {
        log("Fetch done:", from)
        resolve(from)
      })
      rss.on("error", error => {
        console.error("[FEED] Fetch", error + " (" + url + ")")
        resolve()
      })
    })
  },

  getImage(item) {
    if (item.enclosure && item.enclosure.url) return item.enclosure.url
    if (item["media:content"] && item["media:content"].url) return item["media:content"].url
    if (item.thumb) return item.thumb
    if (item.description.match(/<img[^>"']*((("[^"]*")|('[^']*'))[^"'>]*)*>/g)) {
      let imgTag= item.description.match(/<img[^>"']*((("[^"]*")|('[^']*'))[^"'>]*)*>/g)
      if (imgTag.toString().match(/http([^">]+)/g)) return imgTag.toString().match(/http([^">]+)/g)
    }
    return null
  },

  sendDATA: function (data) {
    if (data.length) this.sendSocketNotification("DATA", data)
    else console.log("[FEED] Erreur: no data!")
  },

  update: async function () {
    this.RSS= []
    this.RSSLoaded = []
    await this.getInfos()
    log("Update Done")
  },

  scheduleNextFetch: function () {
    if (this.config.update < 60 * 1000) this.config.update = 60 * 1000

    clearInterval(this.updateTimer)
    log("Update Timer On:", this.config.update, "ms")
    this.updateTimer = setInterval(()=> {
      this.update()
    },this.config.update)
  },

  /** ***** **/
  /** Tools **/
  /** ***** **/

  /** convert h m s to ms **/
  getUpdateTime: function(str) {
    let ms = 0, time, type, value
    let time_list = ('' + str).split(' ').filter(v => v != '' && /^(\d{1,}\.)?\d{1,}([wdhms])?$/i.test(v))

    for(let i = 0, len = time_list.length; i < len; i++){
      time = time_list[i]
      type = time.match(/[wdhms]$/i)

      if(type){
        value = Number(time.replace(type[0], ''))

        switch(type[0].toLowerCase()){
          case 'w':
            ms += value * 604800000
            break
          case 'd':
            ms += value * 86400000
            break
          case 'h':
            ms += value * 3600000
            break
          case 'm':
            ms += value * 60000
            break
          case 's':
            ms += value * 1000
          break
        }
      } else if(!isNaN(parseFloat(time)) && isFinite(time)){
        ms += parseFloat(time)
      }
    }
    return ms
  },

  /** remove duplicate **/
  removeDuplicates: function(originalArray, prop) {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
  },

});
