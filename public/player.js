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
var diffY;
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
	initCommonJquery();
	//document.body.requestFullscreen();
	window.scrollTo(0,100);
	console.log("canvasWidth "+canvasWidth);
	console.log("canvasHeight "+canvasHeight);
	console.log("window.innerHeight "+window.innerHeight);
	console.log("screen.height "+screen.height);
	console.log("$('#theCanvas').height()"+$("#theCanvas").height());
	diffY = window.innerHeight-screen.height;
	console.log("diffY "+diffY);
	
	//draw();
	
}
function continueOnload(){
	//$("#sent").hide();
	console.log("continueOnload");
	iAmReady();
	send("userCanvas", canvasWidth, canvasHeight);
	//waitForOthers();
}

//------------------------------------------------Canvas and other varibales----------------------------------------------------------------------------------------------------------------------------------------------
function resetVariables(){
	lastX = 0;
	lastY = 0;
	lineWidth =5;
	drawColor = "black";
	players = [];
}
function changeDrawSize(width){
	console.log("changeDrawSize");
	lineWidth= width;
	ctx.lineWidth=lineWidth;
	send("changeDrawSize",lineWidth );
}

function changeDrawColor(color){
	//console.log("changeDrawColor");
	//console.log(theButton);
	//drawColor = theButton.style.backgroundColor;
	drawColor= $("."+color).css("background-color");
	//console.log(drawColor);
	ctx.strokeStyle = drawColor;
	//console.log(ctx.fillStyle );
	send("changeDrawColor",drawColor );
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

function findxy(res, e) {
        if (res == 'down') {
			//document.getElementById("playerNumber").innerHTML = ("Player: "+(canvas.offsetTop));
			
		
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop-diffY;
			lastX = currX;
			lastY = currY;
            flag = true;
			var value = addZeroes(parseInt(currX))+""+addZeroes(parseInt(currY));
			
			send("start", value);
			sendCurrentXY();
        }
        if (res == 'up' || res == "out") {
            flag = false;
			send("stop");
        }
        if (res == 'move') {
            if (flag) {
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop-diffY;
				sendCurrentXY();
            }
        }
    }
function clearCanvas(){
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
	send("clear");
}
function sendCurrentXY(){
	var value = addZeroes(parseInt(currX))+""+addZeroes(parseInt(currY));
	send("DrawMessage", value);
	//console.log(value);
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
	var intent = data.intent;
	if(intent=="hostLoaded" && playerNumber != null){
		started = false;
		console.log("host loaded");
		iAmReady();
	}
	if(intent=="canvasSize"){
		canvasSize = data.value;
		canvasHeight = data.value2;
		updateCanvasVariables();
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
var stepValue = 0;
function initJquery(){
	$('.no-zoom').bind('touchend', function(e) {
	  e.preventDefault();
	  // Add your code here. 
	  $(this).click();
	  // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
	})

	$('#sound').click(function(event){
		event.stopPropagation();
		toggleMenu();
	});
	$( window ).scroll(function() {
		  updateCanvasSize();
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
		canvas.addEventListener("touchmove", function (e) {
			findxy('move', e.changedTouches[0])
        }, false);
        canvas.addEventListener("touchstart", function (e) {
			e.preventDefault();
			var values= "diffY " +diffY+ " canvasHeight" + canvasHeight;
				document.getElementById("playerNumber").innerHTML = values;
            findxy('down', e.changedTouches[0])
        }, false);
		canvas.addEventListener("touchend", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("touchcancel", function (e) {
            findxy('out', e)
        }, false);
	$( "#menuContainer" ).click(function( event ) {
		event.stopPropagation();
		// Do something
	});
		$(window).resize(function () {
		updateCanvasSize();
		diffY = window.innerHeight-screen.height;
		//send("canvasSize", canvasWidth, canvasHeight);
	});
}
/* $(window).load(function() {
  $("html, body").animate({ scrollTop: $(document).height() }, 1);
});
 */

function toggleMenu(){
		$("#nav-icon3").toggleClass('open');
		console.log("menu");
		if($("#menu").is(":visible")){
			$("#menu").slideUp(200);
		}else{
			$("#menu").slideDown(200);
		}
}
function toggleSideMenu(){
		//$("#nav-icon3").toggleClass('open');
		console.log("sideMenu");
		if($("#sideMenu").is(":visible")){
			$("#sideMenu").hide(200);
			window.setTimeout(function() {
				$("#sideHide").val("Show Toolbar");
			}, 200);
		}else{
			$("#sideMenu").show(200);
			window.setTimeout(function() {
				$("#sideHide").val("Hide Toolbar");
			}, 200);
			
		}
}
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}
//--------------------------------------------Test-------------------------------------
