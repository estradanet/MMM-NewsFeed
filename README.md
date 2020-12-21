# MMM-NewsFeed

![](https://raw.githubusercontent.com/bugsounet/coding/main/undercoding.gif)

# ScreenShot

![](https://raw.githubusercontent.com/bugsounet/MMM-NewsFeed/dev/NewsFeed.png)

# Installing

```sh
cd ~/MagicMirror/modules
git clone -b dev https://github.com/bugsounet/MMM-NewsFeed
cd MMM-NewsFeed
npm install
```

# For Testing:

```js
    {
      module: "MMM-NewsFeed",
      position: "bottom_bar",
      configDeepMerge: true,
      disabled:false,
      config: {
        debug:false,
        update: "15m", // auto update time (15 mins by default)
        speed: "15s", // displayt time (15 secs by default)
        maxItems: 100, // max item to display
        flux: [
          //{
          //  from: "New York Times",
          //  url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
          //},
          {
            from: "Galantina",
            url: "https://www.galatina.it/rss.xml"
          },
          {
            from: "Ansa",
            url: "https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml"
          },
          {
            from: "Feedburner",
            url: "http://feeds.feedburner.com/hd-blog?format=xml"
          },
          {
            from: "fxexchangerate",
            url: "https://eur.fxexchangerate.com/usd.xml"
          },
          {
            from: "SKY TG24",
            url: "https://tg24.sky.it/rss/tg24_flipboard.ultimenews.xml"
          },
          {
            from: "SKY Sport",
            url: "http://feeds.feedburner.com/SkyitSport"
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
        }
      }
    },
```

# Notes

  * Actually undercoding and not testing stability and can crash
  * Just for testing
