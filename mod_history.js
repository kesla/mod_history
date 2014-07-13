var fs = require('fs')

  , breach = require('breach_module')
  , mkdirp = require('mkdirp')

breach.init(function () {
  breach.register('core', 'tabs:.*');

  breach.module('core').on('tabs:state', function (state) {

    Object.keys(state)
      .forEach(function (tabId) {
        var tabState = state[tabId]

        if (!tabState.loading)
          return

        tabState.entries.forEach(function (entry) {
          // win32 time to unix-time
          var timestamp = new Date(entry.timestamp % 8804332800000)
              // entry.id reset on restart, so this will uniquely identify
              // this entry - so taht we can filter potential duplicates
            , id = tabId + '-' + entry.id
            , dir = __dirname + '/data/raw/' + timestamp.toJSON().slice(0, 10)
            , filename = dir + '/' + timestamp.toJSON() + '-' + entry.id + '.json'

          mkdirp(dir, function () {
            fs.writeFile(
                filename
              , JSON.stringify({
                    url: entry.virtual_url
                  , timestamp: timestamp
                  , title: entry.title
                  , id: id
                })
            )
          })

        })
      })

  })

})
