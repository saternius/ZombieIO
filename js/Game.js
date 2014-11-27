// ----------------------------------------
// Actual game code goes here.

// 
//Global 
//vars
var UID = Math.round(Math.random()*9000);
var socket = io();

fps = null;
canvas = null;
ctx = null;

// ----------------------------------------
//var Walk = Object.freeze({"LEFT":1, "RIGHT":2, "DOWN":3,"UP":4, "STAND":5, "UP-LEFT":6,"UP-RIGHT":7, "DOWN-LEFT":8, "DOWN-RIGHT":9});
//Object.freeze(Walk);

// Our 'game' variables
var stage_width = 750;
var stage_height = 550;
//var mouseX=0;
//var mouseY=0;

var x = 0;
var y = 0;

var width = 10;
var height = 10;

//var speed = 1;

var gridX=Math.floor(stage_width/width)+1;
var gridY=Math.floor(stage_height/height)+1;

var grid = false;
var right = 0;
var up = 0;
var plane;

//var fps_timer = 4;
//var fps_slam = 4;
//var status = "Alive";
//var aliveTimer = 150;
//var alive = true;

//ServerSide Script
//var Server_Players = new Firebase('https://tihid.firebaseio.com/GameData/Active'); //lists active players
//var Server_Zombies = new Firebase('https://tihid.firebaseio.com/GameData/Zombies'); //lists Zombies
//var myData = new Firebase('https://tihid.firebaseio.com/PlayerData/HostData'); //lists my x,y coords and colour
//var playerData = new Array(3);
//var activePlayers = new Array(3);
//var colour = "YELLOW";
//for(var t=0; t<activePlayers.length;t++){
//    activePlayers[t]=false;
//}

/*
Server_Players.on("value", function(data) {
    //TODO make elegant with arrays and such with like 64 players
    var p2 = data.val() ? data.val().p2 : "";
    var p3 = data.val() ? data.val().p3 : "";

    console.log("p2: "+p2+", p3: "+p3);

    if(p2 == "ACTIVE"){
        activePlayers[1] = true;
        console.log("Activated p2");
        playerData[1] = new Firebase('https://tihid.firebaseio.com/PlayerData/Player2');
    }
    if(p3 == "ACTIVE"){
        activePlayers[2] = true;
        playerData[2] = new Firebase('https://tihid.firebaseio.com/PlayerData/Player3');
    }

    initPlayerData();
});
*/

//var players_x = new Array(3);
//var players_y = new Array(3);
//var players_color = new Array(3);

//var zombie_timer = 20;
//var zombie_spawn = 5;

//var server_plane = new Array(gridX); //<- sets width
//for (p = 0; p < server_plane.length; p++) {
 //   server_plane[p] = new Array(gridY); //<- sets height
//}
//var zombies = 0;
//var zombie_speed = 5;
//var zombie_walkTimer =0;
//var zomb_cords ="";



 

/*
function initPlayerData(){

    for(var b=1; b<playerData.length;b++){
        if(activePlayers[b]){
            //TODO make elegant with arrays and such with like 64 players
            console.log("listing on :"+b);
            var passed_var = new Number(b);

            playerData[b].on("value", function(data) {
                console.log("recording on :"+passed_var);
                players_x[passed_var] = data.val() ? data.val().x : "";
                players_y[passed_var] = data.val() ? data.val().y : "";
                players_color[passed_var] = data.val() ? data.val().color : "";
                console.log("player_"+passed_var+" x:"+players_x[passed_var]+" y:"+players_y[passed_var]);
            });
        }
    }
}
*/

window.onbeforeunload = function(){
    socket.emit('player_left', UID);
}

window.onload = function () {
	canvas = document.getElementById("screen");
	ctx = canvas.getContext("2d");
	fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
	
/*
    canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    mouseX = mousePos.x;
    mouseY= mousePos.y;
    }, false);
*/
    window.addEventListener( "keydown", doKeyDown, false );
    window.addEventListener( "keyup", doKeyUp, false );
    ctx.font = 'bold 15pt Calibri';
  

    //lets tell the server that we are playing
    //In the future UID should be IP
    socket.emit('player_joined', UID);
    socket.on('update', function(data){
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,stage_width,stage_height);
        plane = data;
        //Lets draw the grid
        for(var x=0; x<data.length; x++){
            for(var y=0; y<data[x].length; y++){
                if((data[x][y][0]+data[x][y][1]+data[x][y][2])!=765){
                    ctx.fillStyle = 'rgb('+data[x][y][0]+','+data[x][y][1]+','+data[x][y][2]+')';
                    ctx.fillRect(x*width,y*height,width,height);
                }
            }
        }

        if(grid){
            drawGrid();
        }
    });

};

function drawGrid(){
        //draw grid system
        var i;
        for(i=0; i<plane.length;i++){
            ctx.beginPath();
            ctx.moveTo(i*width, 0);
            ctx.lineTo(i*width, stage_height);
            ctx.stroke();
        }
        for(i=0; i<plane[0].length; i++){
            ctx.beginPath();
            ctx.moveTo(0, i*height);
            ctx.lineTo(stage_width, i*height);
            ctx.stroke();
        }
}

function doKeyDown(e){
	if(e.keyCode==39){
        //Right
        right = 1;
        socket.emit('moveRight', UID);
	}
	if(e.keyCode==37){
        //Left
        right = 2;
        socket.emit('moveLeft', UID);
	}
	if(e.keyCode==38){
        //Up
        socket.emit('moveUp', UID);
        up = 1;
	}
	if(e.keyCode==40){
        //Down
        socket.emit('moveDown', UID);
        up = 2;
	}
}

function doKeyUp(e){
    if(e.keyCode==39 || e.keyCode==37){
        //Right or Left
        socket.emit('releaseRight', UID);
        right = 0;
    }
    if(e.keyCode==38 || e.keyCode==40){
        //Up or Down
        socket.emit('releaseUp', UID);
        up = 0;
    }
}


/*
function isCollide(obj1x,obj1y,obj2x,obj2y,obj1w,obj1h,obj2w,obj2h) {
      return !(
        ((obj1y + obj1h) < (obj2y)) ||
        (obj1y > (obj2y + obj2h)) ||
        ((obj1x + obj1w) < obj2x) ||
        (obj1x > (obj2x + obj2w))
    );
}


function GameTick(elapsed){
    fps_timer--;
    if(fps_timer<0 && alive){
        fps_timer = fps_slam;
        fps.update(elapsed);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,stage_width,stage_height);
        if(grid){
            drawGrid();
        }

        if(status == "Alive"){
            ctx.fillStyle = "#FF0000";
            colour = "YELLOW";
        }else if(status == "Bitten" && aliveTimer>50){
            ctx.fillStyle = "#ff9933";
            colour = "ORANGE";
        }else if(status == "Bitten" && aliveTimer<=50 && aliveTimer>0){
            if(aliveTimer%2==0){
                ctx.fillStyle = "#ff9933";
                colour = "ORANGE";
            }else{
                ctx.fillStyle = "#008a24";
                colour = "GREEN";
            }
        }else if(status == "Bitten" && aliveTimer<0){
            ctx.fillStyle = "#008a24";
            colour = "GREEN";
            alive = false;
            status = "Zombie";
        }
        if(status == "Bitten"){
            aliveTimer--;
        }

        ctx.fillRect(players_x[0]*width,players_y[0]*height,width,height);
        ctx.fillStyle = "#000000";
        ctx.fillText("Status = "+status,50,50);
        //walk
        if(right == 1 && x<gridX-2){
            x+=speed;
        }else if(right == 2 && x>0){
            x-=speed;
        }
        if(up == 1 && y>0){
            y-=speed;
        }else if(up == 2 && y<gridY-2){
            y+=speed;
        }


        //serverOperations
        spawnZombies();
        drawZombies();
        drawPlayers();
        sendCurData();
    }
    if(!alive){
        ctx.fillStyle = "#000000";
        ctx.fillText("GAME OVER",250,250);
    }


}



function drawPlayers(){
    
    for(var b=1; b<playerData.length;b++){
        if(activePlayers[b]){

            if(players_color[b] == "YELLOW"){
                ctx.fillStyle = "#FFFF00";
            }else if(players_color[b] == "ORANGE"){
                ctx.fillStyle = "#FFF021";
            }else if(players_color[b] == "GREEN"){
                ctx.fillStyle = "#008a24";
            }
            //console.log("Player "+b+":{x:"+players_x[b]+", y:"+players_y[b]);
            ctx.fillRect(players_x[b]*width,players_y[b]*height,width,height);
        }
    }

}

function spawnZombies(){
    zombie_timer--;
    if(zombie_timer<0){
       // zombies++;
        zombie_timer = zombie_spawn;
        if(Math.random() >= 0.5){
            var randInt;
            if(Math.random() >= 0.5){
                //spawn top
                randInt = Math.floor(gridX*Math.random());
                //console.log("TOP: {"+"x:"+randInt+", y:"+0);
                server_plane[randInt][0] = true;
            }else{
                //spawn bottom
                randInt = Math.floor(gridX*Math.random());
               // console.log("BOTTOM: {"+"x:"+randInt+", y:"+gridY-5);
                server_plane[randInt][gridY-2] = true;
            }
        }else{
            if(Math.random() >= 0.5){
                //spawn left
                randInt = Math.floor(gridY*Math.random());
                //console.log("LEFT: {"+"x:"+0+", y:"+randInt);
                server_plane[0][randInt] = true;
            }else{
                //spawn right
                randInt = Math.floor(gridY*Math.random());
                //console.log("RIGHT: {"+"x:"+gridX-5+", y:"+randInt);
                server_plane[gridX-2][randInt] = true;
            }
        }
    }
}

function getNearestPlayer(i,j){
    //Just the two of us (FOR NOW)
    var host_distance = Math.sqrt(Math.pow((i-players_x[0]),2)+Math.pow((j-players_y[0]),2));
    var guest_distance = Math.sqrt(Math.pow((i-players_x[1]),2)+Math.pow((j-players_y[1]),2));
    if(host_distance<guest_distance){
        console.log("host");
        return 0;
    }
      //  console.log("guest");
        return 1;
}
function checkBitten(i,j){
    if(x==i && j==y){
        status = "Bitten";
    }
}

function drawZombies(){
    zombies = 0;
   // var temp_plane = server_plane;

    var temp_plane = new Array(gridX); //<- sets width
    for (p = 0; p < server_plane.length; p++) {
        temp_plane[p] = new Array(gridY); //<- sets height
        for(var q = 0; q<gridY;q++){
            temp_plane[p][q] = server_plane[p][q];
        }
    }

    zomb_cords="";
    for(var i=0; i<gridX; i++){
        for(var j=0;j<gridY;j++){

            //record zombie coordinates
            if(server_plane[i][j]){
                zomb_cords+="1";
            }else{
                zomb_cords+="0";
            }



            if(server_plane[i][j]){

                zombies++;
                ctx.fillStyle = "#008a24";
                ctx.fillRect(i*width,j*height,width,height);
                checkBitten(i,j);
                var dest = getNearestPlayer(i,j);

                //insert hit detection here

                //movement
                zombie_walkTimer--;
                if(zombie_walkTimer<0){
                    zombie_walkTimer=zombie_speed;
                    if(i<players_x[dest] && j==players_y[dest]){ //RIGHT
                        if(!temp_plane[i+1][j]){
                            temp_plane[i][j]=false;
                            temp_plane[i+1][j]=true;
                        }
                    }else if(i<players_x[dest] && j<players_y[dest]){ //RIGHT-UP
                        if(!temp_plane[i+1][j+1]){
                            temp_plane[i][j]=false;
                            temp_plane[i+1][j+1]=true;
                        }
                    }else if(i<players_x[dest] && j>players_y[dest]){ //RIGHT-DOWN
                        if(!temp_plane[i+1][j-1]){
                            temp_plane[i][j]=false;
                            temp_plane[i+1][j-1]=true;
                        }
                    }

                    else if(i>players_x[dest] && j==players_y[dest]){ //LEFT
                        if(!temp_plane[i-1][j]){
                            temp_plane[i][j]=false;
                            temp_plane[i-1][j]=true;
                        }
                    }else if(i>players_x[dest] && j<players_y[dest]){ //LEFT-UP
                        if(!temp_plane[i-1][j+1]){
                            temp_plane[i][j]=false;
                            temp_plane[i-1][j+1]=true;
                        }
                    }else if(i>players_x[dest] && j>players_y[dest]){ //LEFT-DOWN
                        if(!temp_plane[i-1][j-1]){
                            temp_plane[i][j]=false;
                            temp_plane[i-1][j-1]=true;
                        }
                    }
                    else if(j<players_y[dest]){
                        if(!temp_plane[i][j+1]){
                            temp_plane[i][j]=false;
                            temp_plane[i][j+1]=true;
                        }
                    }else if(j>players_y[dest]){
                        if(!temp_plane[i][j-1]){
                            temp_plane[i][j]=false;
                            temp_plane[i][j-1]=true;
                        }
                    }
                }

            }
        }
    }

    server_plane = temp_plane;

}

function sendCurData(){
    players_x[0] = x;
    players_y[0] = y;

   // console.log("Zombie Cords: "+zomb_cords);
   // myData.set({x:x,y:y,color:colour});
   // Server_Zombies.set({zombies:zomb_cords});
}
function getMousePos(canvas, evt) {
     var rect = canvas.getBoundingClientRect();
     return {
         x: evt.clientX - rect.left,
         y: evt.clientY - rect.top

     };
 }
 */