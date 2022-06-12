var recipe = {
  transcriptionHooks: {
    "NEWSFEED_OPEN_EN": {
      pattern: "Open News",
      command: "NEWS_OPEN"
    },
    "NEWSFEED_NEXT_EN": {
      pattern: "Next News",
      command: "NEWS_NEXT"
    },
    "NEWSFEED_PREVIOUS_EN": {
      pattern: "Previous News",
      command: "NEWS_PREVIOUS"
    },
    "NEWSFEED_REFRESH_EN": {
      pattern: "Refresh News",
      command: "NEWS_REFRESH"
    },
    "NEWSFEED_OPEN_FR": {
      pattern: "Ouvre l'article",
      command: "NEWS_OPEN"
    },
    "NEWSFEED_NEXT_FR": {
      pattern: "Article suivant",
      command: "NEWS_NEXT"
    },
    "NEWSFEED_PREVIOUS_FR": {
      pattern: "Article Précédent",
      command: "NEWS_PREVIOUS"
    },
    "NEWSFEED_REFRESH_FR": {
      pattern: "Mets à jour les articles",
      command: "NEWS_REFRESH"
    },
  },
  commands: {
    "NEWS_OPEN": {
      notificationExec: {
        notification: "NEWSFEED_DETAIL"
      },
      soundExec: {
        chime: "open"
      }
    },
    "NEWS_NEXT": {
      notificationExec: {
        notification: "NEWSFEED_NEXT"
      },
      soundExec: {
        chime: "open"
      }
    },
    "NEWS_PREVIOUS": {
      notificationExec: {
        notification: "NEWSFEED_PREVIOUS"
      },
      soundExec: {
        chime: "open"
      }
    },
    "NEWS_REFRESH": {
      notificationExec: {
        notification: "NEWSFEED_REFRESH"
      },
      soundExec: {
        chime: "open"
      }
    },
  }
}

exports.recipe = recipe
