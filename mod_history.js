var breach = require('breach_module')
  , levelup = require('levelup')
  , db = levelup(
        __dirname + '/db'
      , {
            db: require('leveldown')
          , valueEncoding: 'json'
        }
    )
  , getRange = require('level-get-range')(db)

breach.init(function () {
  breach.register('core', 'tabs:.*');

  breach.module('core').on('tabs:state', function (state) {

    var loadingStates = Object.keys(state)
          .map(function (key) { return state[key] })
          .filter(function (obj) { return obj.loading }) || []
      , batch = db.batch()


    loadingStates.forEach(function (state) {
      state.entries.forEach(function (entry) {
        batch.put(
            entry.timestamp
          , entry
        )
      })
    })

    batch.write(function () {
      console.log('yo, wrote some data')
      getRange(function (err, range) {
        console.log(JSON.stringify(range, null, '\t'))
      })
    })

  })

})
