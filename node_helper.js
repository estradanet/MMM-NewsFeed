/* Magic Mirror
 * Module: MMM-NewsFeed
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

const NodeHelper = require("node_helper")
const FeedMe = require("feedme")
const iconv = require("iconv-lite")
const { Readable } = require("stream") // Necesario para el pipe de los nuevos streams

module.exports = NodeHelper.create({
  // ... (mantén tu método start tal cual)

  // NUEVA FUNCIÓN NECESARIA
  checkFetchStatus: function(response) {
    if (response.ok) return response;
    throw new Error(`HTTP ${response.statusText}`);
  },

  // ... (mantén tu método socketNotificationReceived)

  getRssInfo: function (from, url, encoding) {
    return new Promise(resolve => {
      const rss = new FeedMe()
      const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
      var headers= {
          "User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MMM-NewsFeed v" + require('./package.json').version,
          "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate", Pragma: "no-cache"
      }

      log ("Fetch Rss infos:", from, "(" + url + ") -", encoding)

      fetch(url, { headers: headers })
        .then(this.checkFetchStatus) // Usamos la nueva función definida arriba
        .then((response) => {
          // Convertimos el Web Stream nativo a un Node stream compatible con iconv-lite
          Readable.fromWeb(response.body)
            .pipe(iconv.decodeStream(encoding))
            .pipe(rss)
        })
        .catch((error) => {
          console.log("[FEED] Error! " + error)
          resolve("Error")
        })

      // ... (mantén el resto del código: rss.on("item", ... etc)
      rss.on("item", async item => {
        this.RSS.push ({
          title: item.title,
          description: item.description ? item.description.replace(/(<([^>]+)>)/gi, "") : "",
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
  
  // ... (resto de tus métodos: getImage, sendDATA, etc.)
});
