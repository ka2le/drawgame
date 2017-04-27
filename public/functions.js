var roomID = -1;


var role = "host";
var playerNumber = 0;
var players = [];
var playerTurn = 0;
var numberOfPlayers = 0;
var maxNumberOfPlayers = 4;
var teamColors = ["blue", "red", "yellow", "green", "black"];
var cheatsOn = false;
var canvas;
var ctx;
var canvasWidth =1200;
var canvasHeight = 800;
var drawColor;
var lastX;
var lastY;
var currX =300;
var currY =500;
var currentPlayerNumber;
var flag = false;
var userWidth;
var userHeight;
var turnString;
var lineWidth;
var words = ["apple", "frog", "tree","nose", "cloud", "gun", "motorcycle","strawberry", "ship" , "headband", "window", "eagle", "brick", "coal", "suitcase", "cowboy", "desk", "owl", "lake", "ski", "radish", "flamingo" ,
 "tank", "lemon", "recycle", "deep", "point", "safe", "download", "speakers", "avocado", "birthday", "dream", "sushi", "dolphin", "owl", "baby", "face", "round", "key", "watch", "mailbox", "saw", "stove", "grill", "rainbow", "pear",
 "mushroom", "sheep", "cake", "shark", "pirate", "trumpet", "coin", "tennis", "fork", "bomb", "map", "glasses", "bear", "airplane", "heart", "moon", "lamp", "balloon", "crab", "cat", "lion", "hamburger", "chair", "candle", "lips", "whale"];
var currentWord;

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
	testValues();
	createPlayers();
	console.log(players);
	//console.log(getNewWord());
	if(window.location.host=="localhost:4330"){
		continueOnload();
		continueOnload2();
	}
	 
}

function continueOnload(){
	//console.log("continueOnload does nothing now on host.");
	console.log("hej");
	 $(function() {
    $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
      function(json) {
        console.log("My public IP address is: ", json.ip);
		send("serverTalk", "IP", json.ip);
		//joinByID(30);
      }
    );
  });
  
}
function continueOnload2(){
	send("hostLoaded");
	$("#joiningDiv").hide();
	document.getElementById("roomID").innerHTML = "Room ID: "+ roomID;
}
function resetVariables(){
	lastX = 0;
	lastY = 0;
	lineWidth =5;
	currentWord="";
	turnString ="waiting";
	drawColor = "black";
	//players = [];
	userWidth = canvasWidth;
	userHeight = canvasHeight;
	currentPlayerNumber = 0;
}

//-------------------------------------------------Handle Input-----------------------------------------------------------------------------------------------------------------------------------------------
function handleServerTalk(intent, data, data2){
	console.log("server wants "+ intent);
	console.log("data "+data);
	console.log("data2 "+data2);
	if(intent=="addedToRoom"){
		roomID = data;
		var isNewRoom = data2;
		continueOnload2();
	}
	if(intent=="noSuchID"){
		console.log("Room Not Found");
	}
}
function joinByID(id){
	console.log("trying to join room with ID "+id);
	send("serverTalk", "ID", id);
}	
function handleInput(data){
	var intent = data.intent;
	console.log(data);
	if(intent=="serverTalk"){
		console.log("serverTalk");
		handleServerTalk(data.value, data.value2, data.value3);
	}
	if(intent=="reconnect" || intent=="iAmReady"){
		//send("canvasSize", canvasWidth, canvasHeight);
		var thisplayerNumber = data.playerNumber;
		activatePlayer(thisplayerNumber);
		send(turnString, currentPlayerNumber, currentWord);
	}
	if(intent=="DrawMessage"){
		var value = data.value;
		handleDrawMessage(value);
		//console.log("drawing");
	}else{
		//console.log("intent" + intent);
		//console.log();
		if(intent=="start"){
			flag = true;
			lastX = translateUserXY(data.value)[0];
			lastY = translateUserXY(data.value)[1];
		}
		if(data.playerNumber == currentPlayerNumber){
			if(intent=="stop"){
				flag = false;
				drawDots = [];
			}
			if(intent=="clear"){
				clearCanvas();
			}
			if(intent=="fill"){
				fillCanvas();
			}
			if(intent=="userCanvas"){
				userWidth = data.value;
				userHeight = data.value2;
				canvasWidth = userWidth;
				canvasHeight = userHeight;
				updateCanvasVariables();
				//console.log(userWidth+"<userWidth userHeight>"+userHeight);
			}
			if(intent=="changeDrawSize"){
				changeDrawSize(data.value);
			}
			if(intent=="changeDrawColor"){
				changeDrawColor(data.value);
			}
			if(intent=="getNewCard"){
				redrawWord();
			}
			if(intent=="drawImgData"){
				var oldImgData= data.value;
				drawImgData(oldImgData);
				//send("drawImgData", oldImgData);
			}
		}
		if(intent=="guess"){
			handleGuess(data.value, data.playerNumber); 
		}
		if(intent=="startGame"){
			startGame();
		}
		
	
	}
}	


function handleReconnect(){

}
function testValues(){
	console.log("testValues()");
	console.log("canvasWidth "+canvasWidth);
	var xFromPhone = 500;
	var phoneWidht = 1000;
	var relation = xFromPhone/phoneWidht;
	console.log("relation "+relation);
	var newX = canvasWidth*relation;
	console.log("newX "+newX);
}
function handleDrawMessage(message){
	currX = translateUserXY(message)[0];
	currY = translateUserXY(message)[1];
	draw();
}
function translateUserXY(text){
	var inputX = parseInt(text.substring(0, 4));
	var inputY = parseInt(text.substring(4, 8));
	
	var newX = (inputX/userWidth)*canvasWidth;
	var newY = (inputY/userHeight)*canvasHeight;
	//console.log(userHeight+"<userH canvasH>"+canvasHeight+" givse " +newY+" from "+inputY);
	return [newX,newY];
}


//------------------------------------------------Player stuff----------------------------------------------------------------------------------------------------------------------------------------------
function createPlayers(){
	for(var i = 0; i<4; i++){
		var player = new createPlayer(i, teamColors[i]);
	}
}
function createPlayer(id, color){
	this.id= id;
	this.color = color;
	this.score = 0;
	this.acctive=false;
	players.push(this);
}
function activatePlayer(id){
	players[id].active = true;
	$("#player"+(id+1)).show();
}
function resetPlayerScore(){
	for(var i = 0; i<players.length; i++){
		players[i].score = 0;
	}
}
function updatePlayerInfo(){
	$(".playerInfo").hide();
	$(".playerInfo").removeClass();
	$("#player"+(currentPlayerNumber+1)).addClass("activePlayer"+(currentPlayerNumber+1));
	for(var i =0; i<players.length; i++){
		$("#player"+(i+1)).addClass("playerInfo");
		if(players[i].active){
			document.getElementById("player"+(i+1)).style.display = "block";
			document.getElementById("scoreTextPlayer"+(i+1)).value = players[i].score;
		}
	}
}
//-------------------------------------------------RoundStuff----------------------------------------------------------------------------------------------------------------------------------------------
function startGame(){
	resetVariables();
	resetPlayerScore();
	currentPlayerNumber=-1;
	//turnString = s
	newRound();
}
	
function newRound(){
	console.log("newRound");
	currentPlayerNumber++;
	var foundNextPlayer = false;
	var oneWayRound = false;
	while(!foundNextPlayer){
		console.log(currentPlayerNumber);
		if(players[currentPlayerNumber].active){
			foundNextPlayer = true;
		}else{
			currentPlayerNumber++
		}
		if(currentPlayerNumber==maxNumberOfPlayers){
			if(oneWayRound){
				foundNextPlayer = true;
				console.log("no players")
			}else{
				oneWayRound= true;
				currentPlayerNumber=0;
			}	
		}
	}
	updatePlayerInfo();
	clearCanvas();
	currentWord = getNewWord();
	turnString = "startTurn";
	send(turnString, currentPlayerNumber, currentWord);
}
function getNewWord(){
	//ska använda random sen
	var randomWordNumber =  Math.floor(Math.random() * (words.length-1)) + 1;
	var theWord = words[randomWordNumber];
	words.splice(randomWordNumber,1);
	console.log(words);
	return theWord;
}
function redrawWord(){
	currentWord = getNewWord();
	send(turnString, currentPlayerNumber, currentWord);
}
function handleGuess(guess, playerId){
	console.log("player " + playerId + "guessed "+guess);
	if(guess.toLowerCase() == currentWord){
		console.log("correct Guess");
		players[playerId].score++;
		updatePlayerInfo();
		updateGameInfo("Player "+ (playerId+1) +" got it right. The word was "+ currentWord +".");
		send("correct", playerId);
		setTimeout(function(){ 
			newRound();
			updateGameInfo("");
		}, 5000);
		
	}else{
		send("incorrect", playerId);
	}	
}
function updateGameInfo(text){
	document.getElementById("info").innerHTML = text;
}
//------------------------------------------------Canvas stuff----------------------------------------------------------------------------------------------------------------------------------------------
function clearCanvas(){
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = drawColor;
}
function fillCanvas(){
	ctx.fillRect(0, 0, canvasWidth, canvasHeight); // clear canvas
}
function updateCanvasSize(){
	canvasWidth = document.documentElement.clientWidth;
	canvasHeight = document.documentElement.clientHeight;
	//canvasWidth = screen.width;
	//canvasHeight = screen.height;
	canvas.height = canvasHeight;
	canvas.width = canvasWidth;
}
function updateCanvas100(){
	canvas.style.height = document.documentElement.clientHeight;
	canvas.style.width = document.documentElement.clientWidth;
}
function changeDrawSize(width){

	lineWidth= width;
	ctx.lineWidth=lineWidth;
}
var img = new Image();
function drawImgData(imgData){
	//clearCanvas();
	console.log("drawImgData");
	img.src = imgData;
	img.onload = function() {
		ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	};
}
function updateToCurrentState(){
	//clearCanvas();
	ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
}
function changeDrawColor(rgb){
			drawColor = rgb;
			ctx.strokeStyle = drawColor;
			ctx.fillStyle = drawColor;
		}
		
//------------------------------------------------Draw----------------------------------------------------------------------------------------------------------------------------------------------
var drawDots = [];
var drawDotsMemory = 30;
function updateDrawDots(newX,newY){
	var newDot = []
	newDot.x = newX;
	newDot.y = newY;
	drawDots.push(newDot);
	if(drawDots.length>drawDotsMemory){
		drawDots.splice(0,1);
	}
}
function draw(){
	ctx.beginPath();
	updateDrawDots(currX, currY);
	ctx.moveTo(drawDots[0].x,drawDots[0].y);
	for(var i =0; i<drawDots.length;i++){
		ctx.lineTo(drawDots[i].x,drawDots[i].y);
	}
	//console.log(drawDots);
	ctx.stroke();
	lastX = currX;
	lastY = currY;

}
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
			drawDots = [];			
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
	/* canvas.addEventListener("mousemove", function (e) {
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
        }, false); */
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
	$(window).resize(function () {
		//updateCanvasSize();
		updateCanvas100();
		updateToCurrentState();
		updateCanvasVariables();
		//send("canvasSize", canvasWidth, canvasHeight);
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




//-------------------------------------------------Test functions----------------------------------------------------------------------------------------------------------------------------------------------
function testDraw(){
	//toggleMenu();
	var message = "00340150";
	//console.log(message.length);
	doSocketMessage(message);
}
function testplayerJoin(playerId){
	//toggleMenu();
	var message = {
      intent: "iAmReady",
	  value: "",
	  value2: playerNumber,
	  sender: "host",
	  playerNumber: playerId
    };
	handleInput(message);
}
function removeAllRooms(){

 send("serverTalk", "resetRooms");
}