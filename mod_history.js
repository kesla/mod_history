var fs = require('fs')

  , breach = require('breach_module')
  , mkdirp = require('mkdirp')

breach.init(function () {
  breach.register('core', 'tabs:.*');

  breach.module('core').on('tabs:state', function (state) {

    var loadingStates = Object.keys(state)
          .map(function (key) { return state[key] })
          .filter(function (obj) { return obj.loading }) || []

    loadingStates.forEach(function (state) {
      state.entries.forEach(function (entry) {

        // win32 time to unix-time
        var timestamp = new Date(entry.timestamp % 8804332800000)
          , dir = __dirname + '/data/raw/' + timestamp.toJSON().slice(0, 10)
          , filename = dir + '/' + timestamp.toJSON() + '.json'

        mkdirp(dir, function () {
          fs.writeFile(
              filename
            , JSON.stringify({
                  url: entry.virtual_url
                , timestamp: timestamp
                , title: entry.title
              })
          )
        })
      })
    })

  })

})
