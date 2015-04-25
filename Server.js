var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');

//Game Variables
var players = Array();
var player_ids = Array();
var do_once = true;
var gameOn = false;
var players_ready = 0;
var gameStatus = "Lobby";
function setLinks(){
  app.get('/', function(req, res){
  	var _url = url.parse(req.url, true);
  	var _id = _url.query["id"];
    if(player_ids.indexOf(_id)==-1){
    	console.log("Player "+_id+" joined the game");
    	player_ids.push(_id);
    	var player = new Object();
    	player.alive = true;
    	player.ready = false;
    	players.push(player);
    	res.end("Joined. Players:"+player_ids);
    }else{
    	res.end("RePinged");
    }
  });

  app.get('/ready', function(req, res){
    var _url = url.parse(req.url, true);
  	var _id = _url.query["id"];
  	if(!gameOn && players.length>1){
  		//make ready
  		var dex = player_ids.indexOf(_id);
  		var player = players[dex];
  		if(!player.ready){
  			player.ready = true;
  			players_ready++;
  			if(players_ready == players.length){
  				gameOn = true;
  				console.log("game started. Players:"+player_ids);
  				gameStatus = "Playing";
  			}
  		}
  	}
  	res.end("ready");
  });

  app.get('/gameInfo', function(req, res){
   		var info = new Object();
   		info.players = players.length;
   		info.ready = players_ready;
   		info.gameStatus = gameStatus;
   		res.end(JSON.stringify(info));
  });

}
setLinks();



  function server_check(){
  	//console.log("Checking..");
  }

  if(do_once){
    do_once = false;
    console.log("Server Initialized");
    setInterval(function(){
     	server_check();
    }, 75);
  }



http.listen(process.env.PORT || 5000);
