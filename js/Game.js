// ----------------------------------------
// Actual game code goes here.

// 
//Global 
//vars
var UID = Math.round(Math.random()*4127000000);
var socket = io();

fps = null;
canvas = null;
ctx = null;


// Our 'game' variables
var stage_width = 750;
var stage_height = 550;


var x = 0;
var y = 0;

var width = 10;
var height = 10;


var gridX=Math.floor(stage_width/width)+1;
var gridY=Math.floor(stage_height/height)+1;

var grid = false;
var right = 0;
var up = 0;
var plane;
var debug = "debug string";
var fadeTimer = 0;
var alive = true;
var my_x = 0;
var my_y = 0;
var bitten = false;
var bittenAlpha = 0;
var survive = 300;

window.onbeforeunload = function(){
    socket.emit('player_left', UID);
}

function surviveTimeLeft(){
    var time = survive+10;
    var minutes = parseInt(time/60);
    var seconds = time%60;
    if(seconds<10){
        return ""+minutes+":0"+seconds;
    }else{
        return ""+minutes+":"+seconds;
    }
}

function getTimeLeft(){
    var minutes = parseInt(survive/60);
    var seconds = survive%60;
    if(seconds<10){
        return ""+minutes+":0"+seconds;
    }else{
        return ""+minutes+":"+seconds;
    }
}

window.onload = function () {
	canvas = document.getElementById("screen");
	ctx = canvas.getContext("2d");
	fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
	
    window.addEventListener( "keydown", doKeyDown, false );
    window.addEventListener( "keyup", doKeyUp, false );
  

    //lets tell the server that we are playing
    //In the future UID should be IP
    socket.emit('player_joined', UID);
    function drawStuff(data){
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
        
        if(survive < 1 && alive){
             ctx.globalAlpha=fadeTimer;
             if(fadeTimer<.7){
                fadeTimer+=.05;
             }else{
                ctx.font = "16pt Helvetica";
                var time_left = surviveTimeLeft();
                ctx.fillStyle = "#000000";
                ctx.fillText("Next Game Starts In "+time_left, stage_width/2-130, stage_height/2+100);
             }
             ctx.fillStyle = "#4E4E4E";
             ctx.fillRect(0,0,stage_width,stage_height);
             ctx.fillStyle = "#141414";
             ctx.globalAlpha=fadeTimer+.2;
             ctx.font = 'bold 50pt Helvetica';
             ctx.fillText("YOU SURVIVED", stage_width/2-250, stage_height/2);
             ctx.font = 'bold 20pt Helvetica';
             ctx.fillText("Give Yourself A Big Pat On The Back", stage_width/2-235, stage_height/2+50);
        }else{ 
               

                if(alive){

                     ctx.font = "16pt Helvetica";
                     var time_left = getTimeLeft();
                     ctx.fillStyle = "#000000";
                     if(survive>1){
                        ctx.fillText("Survive "+time_left, stage_width-130, 22);
                     }

                    ctx.font = "8pt Helvetica";
                    ctx.fillStyle = "#000000";
                    ctx.fillText("YOU", my_x*width-6, my_y*height);
                    if(bittenAlpha>0){
                        bittenAlpha-=.2;
                        console.log(bittenAlpha);
                        ctx.fillStyle = "#FF0000";
                        ctx.globalAlpha=bittenAlpha;
                        ctx.fillRect(0,0,stage_width,stage_height);
                        ctx.globalAlpha=1;
                    }

                }else{
                     ctx.globalAlpha=fadeTimer;
                     if(fadeTimer<.7){
                        fadeTimer+=.05;
                     }else{
                        ctx.font = "16pt Helvetica";
                        var time_left = surviveTimeLeft();
                        ctx.fillStyle = "#000000";
                        ctx.fillText("Next Game Starts In "+time_left, stage_width/2-130, stage_height/2+50);
                     }
                     ctx.fillStyle = "#4E4E4E";
                     ctx.fillRect(0,0,stage_width,stage_height);
                     ctx.fillStyle = "#141414";
                     ctx.globalAlpha=fadeTimer+.2;
                     ctx.font = 'bold 50pt Helvetica';
                     ctx.fillText("YOU ARE DEAD", stage_width/2-250, stage_height/2);
                }
            }
        
    }


    socket.on('status', function(status){
             survive = status.time;
             alive = status.alive;
             my_x = status.x;
             my_y = status.y;
             bitten = status.bitten;
             debug = "x:"+x+" y:"+y+" bitten:"+bitten;
             drawStuff(status.data);
    });

    socket.on('bitten', function(always){
            bittenAlpha= 1;
    });

    socket.on('refresh', function(always){
            location.reload();
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


