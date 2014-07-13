var http = require('http')

  , breach = require('breach_module')
  , Medea = require('medea')
  , savedCache = require('lru-cache')({ max: 100 })

  , db = new Medea()

  , bootstrap = function (port) {
      breach.init(function () {
        breach.register('core', 'tabs:.*');

        breach.module('core').on('tabs:state', function (state) {

          Object.keys(state).forEach(function (tabId) {
            var tabState = state[tabId]

            if (!tabState.loading || tabState.entries.length === 0)
              return

            // only record the last entry
            var entry = tabState.entries[tabState.entries.length - 1]
                // win32 time to unix-time
              , timestamp = new Date(entry.timestamp % 8804332800000)
              , dir = __dirname + '/data/raw/' + timestamp.toJSON().slice(0, 10)
              , filename = dir + '/' + timestamp.toJSON() + '.json'
              , title = entry.title
              , id = tabId + entry.id

            // check that the id isn't already set, cause we sometimes get the
            //  same page twice - seem mostly to happen whenever there's a site
            //  that uses the History-API
            //  also, this means that the same file won't be saved multiple times
            if (entry.title && entry.title.length > 0 && !savedCache.has(id)) {
              savedCache.set(id, true)
              db.put(
                  timestamp.getTime()
                , JSON.stringify({
                      url: entry.url.href
                    , timestamp: timestamp
                    , title: entry.title
                  })
              )
            }

          })

        })

      })

      breach.expose('kill', function () {
        process.exit(0)
      })

      console.log('Exposed: `http://127.0.0.1:' + port + '/`')
    }
  , server = http.createServer(function (req, res) {

    })

server.listen(0, function () {
  db.open(__dirname + '/data', function () {
    db.compact(function () {
      bootstrap(server.address().port)
    })
  })
})