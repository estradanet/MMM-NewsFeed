/* Magic Mirror
 * Module: NewsFeed
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

Module.register("MMM-NewsFeed", {
  // requiresVersion: "2.14.0",
  defaults: {
    debug: false,
    update: "15m",
    speed: "15s",
    maxItems: 100,
    flux: [
      {
        from: "New York Times",
        url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
      }
    ],
    personalize: {
      Name: "NewsFeed",
      NameField: true,
      NameColor: "#FFF",
      NameBackground: "#414141",
      ArticleColor: "#000",
      ArticleBackground: "#AAA",
      DescriptionColor: "#000",
      DescriptionBackground: "#FFF"
    },
    vertical: {
      useVertical: false,
      width: "450px",
      imageMaxWidth: "20vw",
      imageMaxHeight: "20vh"
    }
  },

  start: function () {
    this.item = 0
    this.RSS = []
    this.update = null
    this.fade = null
    this.config.speed = this.getUpdateTime(this.config.speed)
    console.log("[FEED] Starting MMM-NewsFeed")
  },

  notificationReceived: function (notification, payload, sender) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("CONFIG", this.config)
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "INITIALIZED":
        console.log("[FEED] Ready!")
        this.item = 0
        this.displayChoice()
        break
      case "DATA":
        if (this.config.debug) console.log("[FEED] Data", payload)
        this.RSS= payload
        this.item = -1
        break
    }
  },

  DisplayNext: function () {
    if (this.config.speed < 10*1000) this.config.speed = 10*1000
    clearInterval(this.update)
    this.update = setInterval(() => {
      this.item++
      this.displayChoice()
    }, this.config.speed)
  },

  displayChoice: function () {
    if (this.RSS.length == 0) {
      this.item = -1
      return this.DisplayNext()
    }
    if (!this.RSS[this.item] || !this.RSS[this.item].description || this.RSS[this.item].description == "") return this.DisplayNext()
    if (this.item > this.RSS.length-1) this.item = 0

    var title = document.getElementById("NEWSFEED_TITLE")
    var image = document.getElementById("NEWSFEED_IMAGE")
    var description = document.getElementById("NEWSFEED_DESCRIPTION")
    var source = document.getElementById("NEWSFEED_SOURCE")
    var published = document.getElementById("NEWSFEED_TIME")
    var contener = document.getElementById("NEWSFEED_CONTENER")

    contener.classList.add("hideArticle")
    contener.classList.remove("showArticle")

    source.classList.remove("start")
    source.classList.add("stop")

    description.classList.add("hideArticle")
    description.classList.remove("showArticle")

    this.fade = setTimeout(()=>{
      if (this.RSS[this.item]) {
        title.innerHTML = this.RSS[this.item].title
        if (!this.RSS[this.item].image) image.removeAttribute('src')
        else {
          image.src = this.RSS[this.item].image
          image.addEventListener('error', () => {
            image.removeAttribute('src')
          }, false)
        }
        description.innerHTML = this.RSS[this.item].description
        source.textContent = this.RSS[this.item].from + (this.config.debug ? " [" + this.item + "/" + this.RSS.length + "]" : "")
        published.textContent = moment(new Date(this.RSS[this.item].pubdate)).isValid() ?
          moment(new Date(this.RSS[this.item].pubdate)).fromNow() : this.RSS[this.item].pubdate

        contener.classList.remove("hideArticle")
        contener.classList.add("showArticle")
        source.classList.remove("stop")
        source.classList.add("start")
        description.classList.remove("hideArticle")
        description.classList.add("showArticle")
        this.DisplayNext()
      } else {
        console.log("[FEED] RSS error")
        this.item = 0
        this.displayChoice()
      }
    }, 1200)
  },

  getDom: function () {
    var wrapper= document.createElement("div")

    var contener= document.createElement("div")
    contener.id= "NEWSFEED_CONTENER"
    contener.classList.add("hideArticle")
    contener.style.color= this.config.personalize.DescriptionColor
    contener.style.backgroundColor= this.config.personalize.DescriptionBackground
    if (this.config.vertical.useVertical) {
      contener.classList.add("vertical")
      contener.style.width = this.config.vertical.width
    }

    var article= document.createElement("div")
    article.id= "NEWSFEED_ARTICLE"
    article.style.color= this.config.personalize.ArticleColor
    article.style.backgroundColor= this.config.personalize.ArticleBackground

    if (this.config.personalize.NameField) {
      var logo = document.createElement("div")
      logo.id= "NEWSFEED_LOGO"
      logo.style.color= this.config.personalize.NameColor
      logo.style.backgroundColor= this.config.personalize.NameBackground
      article.appendChild(logo)
      partA= document.createElement("div")
      partA.id="NEWSFEED_LOGO_PARTA"
      partA.textContent= this.config.personalize.Name
      logo.appendChild(partA)
      partB = document.createElement("div")
      partB.id="NEWSFEED_LOGO_PARTB"
      logo.appendChild(partB)
    }

    var title= document.createElement("div")
    title.id= "NEWSFEED_TITLE"
    if (this.config.vertical.useVertical) title.classList.add("vertical")
    contener.appendChild(article)
    article.appendChild(title)

    var content= document.createElement("div")
    content.id= "NEWSFEED_CONTENT"
    if (this.config.vertical.useVertical) content.classList.add("vertical")
    var image = document.createElement("img")
    image.id = "NEWSFEED_IMAGE"
    if (this.config.vertical.useVertical) {
      image.classList.add("vertical")
      image.style.maxWidth= this.config.vertical.imageMaxWidth
      image.style.maxHeight= this.config.vertical.imageMaxHeight
    }
    var source = document.createElement("div")
    source.id = "NEWSFEED_SOURCE"
    if (this.config.vertical.useVertical) source.classList.add("vertical")
    var description= document.createElement("div")
    description.id = "NEWSFEED_DESCRIPTION"
    contener.appendChild(content)
    content.appendChild(image)
    content.appendChild(source)
    content.appendChild(description)

    var footer= document.createElement("div")
    footer.id = "NEWSFEED_FOOTER"
    var published = document.createElement("div")
    published.id = "NEWSFEED_TIME"
    contener.appendChild(footer)
    footer.appendChild(published)

    wrapper.appendChild(contener)

    return wrapper
  },

  getStyles: function() {
    return ["MMM-NewsFeed.css"]
  },

  suspend: function () {
    clearInterval(this.update)
    clearTimeout(this.fade)
    var contener = document.getElementById("NEWSFEED_CONTENER")
    contener.classList.add("hideArticle")
    contener.classList.remove("showArticle")
    this.sendSocketNotification("SUSPEND")
    console.log("MMM-NewsFeed is suspended.")
  },

  resume: function () {
    console.log("MMM-NewsFeed is resumed.")
    this.item = 0
    this.displayChoice()
    setTimeout (() => {this.sendSocketNotification("RESUME")}, 2000)
  },

  /** ***** **/
  /** Tools **/
  /** ***** **/

  /** convert h m s to ms
   ** str sample => "1d 15h 30s"
   **/
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
  }

});
