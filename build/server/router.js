/**
 * Created by wenruo on 2016/12/16.
 */
var express = require('express');
var router = express.Router();

var data = require("./data");

router.use(function (req, res, next){
  var s = "[" + Date.now() + "] :" + req.url + ";" + req.header('UserToken');
  console.info(s);
  next();
});
router.use('/game', function (req, res, next) {
   console.info(req.method());
   console.info(res);
   console.info(next);
});

router.post('/login', function (req, res) {
  var name = req.param('UserName');
  var password = req.param('PassWord');
  console.info("[Login] name:" + name + " password: " + password);
  res.json(data.login)
});

router.get('/gameList',function (req, res) {
  console.info(req.params);
  res.json(data.gameList);
});

router.get('/versionsList', function (req, res) {
  console.info(req.params);
  res.json(data.versions);
});

router.get('/templateList', function (req,res) {
  console.info(req.params);
  res.json(data.templates);
});
router.post('/game/add',function (req, res) {
  console.info("data:"+req.params);
  res.json({
    "errcode":0,
    "resultData": req.params
  })
});

router.post('/game/edit',function (req, res) {
  console.info("data:"+req.params);
  res.json({
    "errcode":0,
    "resultData": req.params
  })
});

router.post('/game/delete',function (req, res) {
  console.info("data:"+req.params);
  res.json({
    "errcode":0,
    "resultData": req.params
  })
});

module.exports = router;
