var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
  	title: 'Lottery',
  	parts: [
  		{
  			"name":"小河",
  			"img":"public/images/user01.png",
  			"uid":23
  		},
  		{
  			"name":"周云蓬",
  			"img":"public/images/user02.png",
  			"uid":24
  		},
  		{
  			"name":"万晓利",
  			"img":"public/images/user03.png",
  			"uid":25
  		},
  		{
  			"name":"张玮玮",
  			"img":"public/images/user04.png",
  			"uid":26
  		}
  	],
  	winner: [],
  	category: ["一等奖","二等奖","三等奖","四等奖"]
   });
});

module.exports = router;
