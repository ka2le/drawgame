var role = "host";
var playerNumber = 0;
var players = [];
var playerTurn = 0;
var numberOfPlayers = 0;
var teamColors = ["blue", "red", "yellow", "green", "black"];
var cheatsOn = false;
var canvas;
var ctx;
var canvasWidth;
var canvasHeight;
var drawColor;
var lastX;
var lastY;
var currX =300;
var currY =500;
var flag = false;

var lineWidth;
function onload(){
	//console.log("start");
	startConnection();
	//toggleMenu();
	
	resetVariables();
	initCanvasVariables();
	jQueryInits();
	initCommonJquery();
	//draw();
	//clearCanvas();
	//draw(100,540);
}
function continueOnload(){
	//console.log("continueOnload does nothing now on host.");
	send("hostLoaded");
}
function resetVariables(){
	lastX = 0;
	lastY = 0;
	lineWidth =4;
	drawColor = "black";
	players = [];
}

function clearCanvas(){
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas

}
//------------------------------------------------Draw----------------------------------------------------------------------------------------------------------------------------------------------

function findxy(res, e) {
        if (res == 'down') {
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
			lastX = currX;
			lastY = currY;
            flag = true;
			//sendCurrentXY();
        }
        if (res == 'up' || res == "out") {
            flag = false;	
        }
        if (res == 'move') {
            if (flag) {
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
				//sendCurrentXY();
				draw();
            }
        }
    }
//------------------------------------------------SendFunction for player code----------------------------------------------------------------------------------------------------------------------------------------------
function sendCurrentXY(){
	var value = addZeroes(currX)+""+addZeroes(currY);
	send("DrawMessage", value);
}
	
//------------------------------------------------Jquery----------------------------------------------------------------------------------------------------------------------------------------------

function jQueryInits(){
	canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
	$( "#menuContainer" ).click(function( event ) {
		event.stopPropagation();
		// Do something
	});
	$("#cheatsCheck").click(function() {
        if($(this).is(":checked")){
			enableCheats()
		}else{
			disableCheats();
		}
    });

	$('.scoreText').change(function() { 
		insertCheatScore();
	});	


}
//-------------------------------------------------Menu stuff-----------------------------------------------------------------------------------------------------------------------------------------------
function insertCheatScore(){
	//console.log("insertCheatScore()");
	for(var i =0; i<players.length; i++){
		$("#player"+(i+1)).addClass("playerInfo");
		if(players[i].active){
			players[i].score = parseInt(document.getElementById("scoreTextPlayer"+(i+1)).value);
		}
	}
}
function enableCheats(){
	cheatsOn = true;
	$(".scoreText").prop('readonly', false);
}
function disableCheats(){
	cheatsOn = false;
	$(".scoreText").prop('readonly', true);
}
function toggleMenu(){
//	console.log("toggleMenu");
	if($("#menubackground").is(':visible')){
		$("#menubackground").fadeOut("fast");
	}else{
		$("#menubackground").fadeIn("fast");
	}
	
}
function hideMenu(){
	$("#menubackground").fadeOut("fast");
}



//-------------------------------------------------Handle Input-----------------------------------------------------------------------------------------------------------------------------------------------
function handleReconnect(){

}
function handleDrawMessage(message){
	currX = parseInt(message.substring(0, 4));
	currY = parseInt(message.substring(4, 8));
	draw();
}
function handleInput(data){
	var intent = data.intent;
	if(intent=="reconnect" || intent=="iAmReady"){
		send("canvasSize", canvasWidth, canvasHeight);
	}
	if(intent=="DrawMessage"){
		var value = data.value;
		handleDrawMessage(value);
	}else{
		console.log("intent" + intent);
		//console.log();
		if(intent=="start"){
			flag = true;
			lastX = parseInt(data.value.substring(0, 4));
			lastY = parseInt(data.value.substring(4, 8));
		}
		if(intent=="stop"){
			flag = false;
		}
		if(intent=="clear"){
			clearCanvas();
		}	
	}
	
}



//-------------------------------------------------Test functions----------------------------------------------------------------------------------------------------------------------------------------------
function testDraw(){
	//toggleMenu();
	var message = "00340150";
	console.log(message.length);
	doSocketMessage(message);
}
