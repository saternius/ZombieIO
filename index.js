var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

//Game Variables
var players = Array();
var players_x = Array();
var players_y = Array();
var players_colour = Array();
var players_deathTimer = Array();
var players_flashMod = Array();
var players_bitten = Array();
var players_alive = Array();
var players_right = Array();
var players_up = Array();


var zombies_x = Array();
var zombies_y = Array();
var zombies_walk = Array();
var zombie_timer = 20;
var zombie_spawn = 5;
var num_zombies = 0;
var zomb_lagg = 6;

var stage_width = 750;
var stage_height = 550;
var width = 10;
var height = 10;
var gridX=Math.floor(stage_width/width)+1;
var gridY=Math.floor(stage_height/height)+1;
console.log("GridX: "+gridX);
console.log("GridY: "+gridY);

var plane = new Array(gridX); //<- sets width
var plane_vacancy = new Array(gridX);
//var zombie_plane = new Array(gridX);
for (var x = 0; x < plane.length; x++) {
    plane_vacancy[x] = new Array(gridY);
    plane[x] = new Array(gridY); //<- sets height
    //zombie_plane[x] = new Array(gridY);
    for(var y = 0; y<plane[x].length; y++){
      plane_vacancy[x][y] = Array();
      plane[x][y] = [255,255,255];
     // zombie_plane[x][y] = false;
    }
}

var speed = 1;

function setLinks(){
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  app.get('/js/JareUtils.js', function(req, res){
    res.sendFile(__dirname + '/js/JareUtils.js');
  });

  app.get('/js/FPSMeter.js', function(req, res){
    res.sendFile(__dirname + '/js/FPSMeter.js');
  });

  app.get('/js/GameLoopManager.js', function(req, res){
    res.sendFile(__dirname + '/js/GameLoopManager.js');
  });

  app.get('/js/Game.js', function(req, res){
    res.sendFile(__dirname + '/js/Game.js');
  });
}
setLinks();

function randomColour(){
  return Math.round(((Math.random()*255)+255)/2);
}

function getNearestPlayer(i,j){
    var closest = players[0];
    var best_dist = Math.sqrt(Math.pow((i-players_x[players[0]]),2)+Math.pow((j-players_y[players[0]]),2));
    for(var p=1; p<players.length; p++){
        if(players_alive[players[p]]){
          var dist = Math.sqrt(Math.pow((i-players_x[players[p]]),2)+Math.pow((j-players_y[players[p]]),2));
          if(dist<best_dist){
            best_dist = dist;
            closest = players[p];
          }
        }
    }
  
    if(closest == players[0] && !players_alive[closest]){
      return -1;
    }
    return closest;
}

function paintWhite(zomb_x,zomb_y){
   // plane_vacancy[zomb_x][zomb_y]--;
    if(plane_vacancy[zomb_x][zomb_y].length==0){
            plane[zomb_x][zomb_y] = [255,255,255];
    }
}

function moveZombies(){
  for(var i=0; i<zombies_x.length; i++){
    var zomb_x = zombies_x[i];
    var zomb_y = zombies_y[i];
    var zomb_walk = zombies_walk[i];
    var dest = getNearestPlayer(zomb_x,zomb_y);
    if(dest== -1){
      return;
    }
    zombies_walk[i]--;
    if(zombies_walk[i]%2 == 0){
      if(players_x[dest]==zomb_x && players_y[dest]==zomb_y){
        //PLAYER IS BITTEN!
        //console.log("Player "+dest+" was bitten.");
        players_colour[dest] = [210,178,49];
        players_bitten[dest] = true;
      }
    }
    if(zomb_walk<1){
      zombies_walk[i] = zomb_lagg;
      
      if(players_x[dest]==zomb_x && players_y[dest]>zomb_y){
        //go up
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x][zomb_y+1] = [38,166,68];
        zombies_y[i]++;

      }else

      if(players_x[dest]==zomb_x && players_y[dest]<zomb_y){
        //go down
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x][zomb_y-1] = [38,166,68];
        zombies_y[i]--;


      }else

      if(players_x[dest]<zomb_x && players_y[dest]==zomb_y){
        //go left
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x-1][zomb_y] = [38,166,68];
        zombies_x[i]--;
      }else

      if(players_x[dest]>zomb_x && players_y[dest]==zomb_y){
        //go right
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x+1][zomb_y] = [38,166,68];
        zombies_x[i]++;
      }else

      if(players_x[dest]>zomb_x && players_y[dest]<zomb_y){
        //go upper right
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x+1][zomb_y-1] = [38,166,68];
        zombies_x[i]++;
        zombies_y[i]--;
      }else

      if(players_x[dest]<zomb_x && players_y[dest]>zomb_y){
        //go lower left
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x-1][zomb_y+1] = [38,166,68];
        zombies_x[i]--;
        zombies_y[i]++;
      }else

      if(players_x[dest]<zomb_x && players_y[dest]<zomb_y){
        //go upper left
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x-1][zomb_y-1] = [38,166,68];
        zombies_x[i]--;
        zombies_y[i]--;
      }else

      if(players_x[dest]>zomb_x && players_y[dest]>zomb_y){
        //go lower right
        paintWhite(zomb_x,zomb_y);
        plane[zomb_x+1][zomb_y+1] = [38,166,68];
        zombies_x[i]++;
        zombies_y[i]++;
      }
    }else{
       plane[zomb_x][zomb_y] = [38,166,68];
    }
  }
}

function spawnZombies(){
  zombie_timer--;
    if(zombie_timer<0){
        num_zombies++;
        zombie_timer = zombie_spawn;
        zombies_walk.push(4);
        if(Math.random() >= 0.5){
            var randInt;
            if(Math.random() >= 0.5){
                //spawn top
                randInt = Math.floor(gridX*Math.random());
                zombies_x.push(randInt);
                zombies_y.push(0);
                plane[randInt][0] = [38,166,68];
            }else{
                //spawn bottom
                randInt = Math.floor(gridX*Math.random());
                plane[randInt][gridY-2] = [38,166,68];
                zombies_x.push(randInt);
                zombies_y.push(gridY-2);
            }
        }else{
            if(Math.random() >= 0.5){
                //spawn left
                randInt = Math.floor(gridY*Math.random());
                plane[0][randInt] = [38,166,68];
                zombies_x.push(0);
                zombies_y.push(randInt);
            
            }else{
                //spawn right
                randInt = Math.floor(gridY*Math.random());
                plane[gridX-2][randInt] = [38,166,68];
                zombies_x.push(gridX-2);
                zombies_y.push(randInt);
            }
         }
  }
}

function giveFeed(id){
  //nothing for now
}


var logs = 0;
var do_once = true;
//to emit use : io.emit('chat message', msg);
io.on('connection', function(socket){ 
    glob_socket = socket; 
  	socket.on('player_joined', function(player_id){
    	console.log("Player "+player_id+" joined.");
      players.push(player_id);
      var p_x = Math.round(Math.random()*55)+10;
      var p_y = Math.round(Math.random()*35)+10;
      players_x[player_id] = p_x;
      players_y[player_id] = p_y;
      players_bitten[player_id] = false;
      players_flashMod[player_id] = 20;
      players_colour[player_id] = [randomColour(),Math.round(randomColour()/2), randomColour()];
      players_deathTimer[player_id] = 150;
      players_alive[player_id] = true;
      players_right[player_id] = 0;
      players_up[player_id] = 0;
      plane[p_x][p_y] = players_colour[player_id];
      plane_vacancy[p_x][p_y].push(player_id);
      console.log("plane["+p_x+"]["+p_y+"] = "+players_colour[player_id]);
      if(!players_alive[players[0]]){
        var id = players[0];
        var p_dex = players.indexOf(id);
        players.splice(p_dex,1);
        players.push(id);
      } 
	});

  socket.on('moveRight', function(player_id){
      players_right[player_id] = 1;
      giveFeed(player_id);
  });
  socket.on('moveLeft', function(player_id){
      players_right[player_id] = 2;
      giveFeed(player_id);
  });
  socket.on('moveDown', function(player_id){
      players_up[player_id] = 2;
      giveFeed(player_id);
  });
  socket.on('moveUp', function(player_id){
      players_up[player_id] = 1;
      giveFeed(player_id);
  });

  socket.on('releaseRight', function(player_id){
      players_right[player_id] = 0;
      giveFeed(player_id);
  });
  socket.on('releaseUp', function(player_id){
      players_up[player_id] = 0;
      giveFeed(player_id);
  });

  socket.on('player_left', function(id){
      var index = players.indexOf(id);
      if (index > -1) {
        console.log("Player "+id+" left.");
        var plane_x = players_x[id];
        var plane_y = players_y[id];
        console.log("plane_x: "+plane_x+ "plane_y: "+plane_y);
        var p_dex = plane_vacancy[plane_x][plane_y].indexOf(id);
        if(p_dex>-1){
          plane_vacancy[plane_x][plane_y].splice(p_dex,1);
        }
        if(plane_vacancy[players_x[id]][players_y[id]].length==0){
              plane[plane_x][plane_y] = [255,255,255];
        }
          players.splice(index, 1);

      }

  });



  if(do_once){
    do_once = false;
    console.log("haha");
    setInterval(function(){
      logs++;
    //  console.log("log "+logs);
      for(var i=0; i< players.length; i++){
        var id = players[i];
        if(players_alive[id]){
            var orig_x = players_x[id];
            var orig_y = players_y[id];
         
             if(players_bitten[id]){
                //player is bitten
                if(players_deathTimer[id]>0){
                    players_deathTimer[id]--;

                    if(players_deathTimer[id]%players_flashMod[id] == 0){
                      players_colour[id] = [38,166,68];
                    }else{
                      players_colour[id] = [210,178,49];
                    }

                    if(players_deathTimer[id]%7 == 0){
                      players_flashMod[id]--;
                    }
                }else{
                    //player is dead
                    console.log("Player "+id+" is Dead");
                    players_alive[id] = false;
                    var p_dex = plane_vacancy[orig_x][orig_y].indexOf(id);
                     if(p_dex>-1){
                        plane_vacancy[orig_x][orig_y].splice(p_dex,1);
                     }
                     if(plane_vacancy[orig_x][orig_y].length==0){
                        plane[orig_x][orig_y] = [255,255,255];
                     }else{
                        plane[orig_x][orig_y] = players_colour[plane_vacancy[orig_x][orig_y][0]];
                     }
                     players.splice(id,1);
                     var p_dex = players.indexOf(id);
                     players.splice(p_dex,1);
                     players.push(id);
                     //make them a zombie
                     num_zombies++;
                     zombies_walk.push(4);
                     zombies_x.push(players_x[id]);
                     zombies_y.push(players_y[id]);
                     plane[players_x[id]][players_y[id]] = [38,166,68];

                }
             }

             if(players_right[id] == 1 && players_x[id]<gridX-2){
                  players_x[id]+=speed;
              }else if(players_right[id] == 2 && players_x[id]>0){
                  players_x[id]-=speed;
              }
              if(players_up[id] == 1 && players_y[id]>0){
                  players_y[id]-=speed;
              }else if(players_up[id] == 2 && players_y[id]<gridY-2){
                  players_y[id]+=speed;
              }
              if( ((players_right[id]+players_up[id])>0)){
                 var p_dex = plane_vacancy[orig_x][orig_y].indexOf(id);
                 if(p_dex>-1){
                    plane_vacancy[orig_x][orig_y].splice(p_dex,1);
                 }
                 if(plane_vacancy[orig_x][orig_y].length==0){
                    plane[orig_x][orig_y] = [255,255,255];
                 }else{
                    plane[orig_x][orig_y] = players_colour[plane_vacancy[orig_x][orig_y][0]];
                 }
                 plane_vacancy[players_x[id]][players_y[id]].push(id);
                 plane[players_x[id]][players_y[id]] = players_colour[id];
              }
          }
      }
      spawnZombies();
      moveZombies();
      socket.broadcast.emit('update', plane);
    }, 75);
  }

});



http.listen(1337, function(){
  console.log('listening on *:1337');
});
