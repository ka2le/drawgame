var role = "player";
var playerNumber;
var started = false;
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
function onload(){
	var url = window.location.href;
	playerNumber = url.split("#")[1];
	console.log(playerNumber);
	startConnection();
	console.log(window.location.host);
	playerNumber--;
	document.getElementById("playerNumber").innerHTML = ("Player: "+(playerNumber+1));
	if(playerNumber==0){
		document.getElementById("player1Stuff").style.display = "inline";
	}
	if(window.location.host=="localhost:4330"){
		continueOnload();
	}
	resetVariables();
	initCanvasVariables();
	initJquery();
}
function continueOnload(){
	//$("#sent").hide();
	console.log("continueOnload");
	iAmReady();
	//waitForOthers();
}

//------------------------------------------------Canvas and other varibales----------------------------------------------------------------------------------------------------------------------------------------------
function resetVariables(){
	lastX = 0;
	lastY = 0;
	lineWidth =2;
	drawColor = "black";
	players = [];
}
function initCanvasVariables(){
	canvas = document.getElementById("theCanvas");
	ctx = canvas.getContext('2d');
	ctx.globalCompositeOperation = 'source-over';
	canvasWidth = document.documentElement.clientWidth;
	canvasHeight = document.documentElement.clientHeight;
	canvas.height = canvasHeight;
	canvas.width = canvasWidth;
	ctx.lineWidth=lineWidth;
	ctx.fillStyle = drawColor;
}
function updateCanvasVariables(){
	canvas.height = canvasHeight;
	canvas.width = canvasWidth;
	ctx.lineWidth=lineWidth;
	ctx.fillStyle = drawColor;
}




//------------------------------------------------Draw----------------------------------------------------------------------------------------------------------------------------------------------
function draw(){
	ctx.beginPath();
	ctx.moveTo(lastX,lastY);
	ctx.lineTo(currX,currY);
	ctx.stroke();
	lastX = currX;
	lastY = currY;

}
function clearCanvas(){
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
}
function findxy(res, e) {
        if (res == 'down') {
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
			lastX = currX;
			lastY = currY;
            flag = true;
			sendCurrentXY();
        }
        if (res == 'up' || res == "out") {
            flag = false;	
        }
        if (res == 'move') {
            if (flag) {
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
				sendCurrentXY();
            }
        }
    }


function sendCurrentXY(){
	var value = addZeroes(currX)+""+addZeroes(currY);
	send("DrawMessage", value);
	console.log(value.length);
	draw();
}
function addZeroes (str) {
  str = str.toString();
  return str.length < 4 ? addZeroes("0" + str, 4) : str;
}	
function handleDrawMessage(message){
	//currX = parseInt(message.substring(0, 4));
	//currY = parseInt(message.substring(4, 8));
	//draw();
}


//------------------------------------------------handleInput----------------------------------------------------------------------------------------------------------------------------------------------
function iAmReady(){
	console.log("iAmReady: " +playerNumber);
	send("iAmReady");
}

function handleInput(data){
	console.log(" handleInput(data)");
	console.log(data);
	var intent = data.intent;
	console.log(intent);
	if(intent=="hostLoaded" && playerNumber != null){
		started = false;
		console.log("host loaded");
		//document.getElementById("playerNumber").innerHTML = ("Player: "+(playerNumber+1));
		iAmReady();
		/* document.getElementById("result").innerHTML = "Reconnected to host. Waiting...";
		document.getElementById("result").style.display = "block"; */
	}
}

function initReconnect(){
	toggleMenu();
	reconnect();
}
function handleReconnect(){
	console.log("handleReconnect");
	send("reconnect");
}

//------------------------------------------------Jquery inits----------------------------------------------------------------------------------------------------------------------------------------------
function initJquery(){
	$('.no-zoom').bind('touchend', function(e) {
	  e.preventDefault();
	  // Add your code here. 
	  $(this).click();
	  // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
	})

	$('#nav-icon1,#nav-icon2,#nav-icon3,#nav-icon4').click(function(){
		toggleMenu();
	});
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
}


function toggleMenu(){
		$("#nav-icon3").toggleClass('open');
		console.log("menu");
		if($("#menu").is(":visible")){
			$("#menu").slideUp(200);
		}else{
			$("#menu").slideDown(200);
		}
}
//--------------------------------------------Test-------------------------------------
