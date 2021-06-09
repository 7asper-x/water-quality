var express = require('express');
var router = express.Router();
const db = require('./../model/water_db.js');
require('./../model/dbLoadModel.js')(db);
// require('./../model/dbLoadHisModel.js')(db);
/* GET users listing. */
router.post('/getWaterStationData', function(req, res, next) {
  // res.send('respond with a resource');
  require('./../api/water_data/getWaterData.js')(req, res, next, db);
});
// router.post('/getHistoryData', function(req, res, next) {
//   // res.send('respond with a resource');
//   require('./../api/water_data/getHistoryData.js')(req, res, next, db);
// });
router.get('/static/*', function (req, res, next) {
  require('./../api/data/getStaticData')(req, res, next);
})
module.exports = router;
