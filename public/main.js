var socket = null;

function startConnection(){
	// WebSocket
	if(window.location.host=="localhost:4330" || window.location.host=="localhost"){
		console.log("WebSocket is not used on localhost");
	}else{
		socket = new WebSocket( 'wss://' + window.location.host +"?1337" );  
		socket.addEventListener( 'message', doSocketMessage );
		console.log(socket);
		socket.onopen = function () {
			  console.log("Connected");
			  continueOnload();
		};
		setInterval(function(){ 
			if(socket.readyState == 3){
				reconnect();
			}
		}, 1000);
	}
}
function reconnect(){
	socket = new WebSocket( 'wss://' + window.location.host );  
	socket.addEventListener( 'message', doSocketMessage );
	socket.onopen = function () {
		 console.log("Re-Connected");
		 // continueOnload();
		 handleReconnect();
	};
}
function send(intent, value, value2){
	if(window.location.host=="localhost:4330" || window.location.host=="localhost"){
			/* console.log("sent");
			var message = {
			intent: intent,
			  value: value,
			  value2: value2,
			  sender: role,
			  playerNumber: playerNumber
			};
			handleInput(message); */
	}else{
			var message = {
			intent: intent,
			  value: value,
			  value2: value2,
			  sender: role,
			  playerNumber: playerNumber
			};
			socket.send( JSON.stringify( message ) );	
		}
}

function doSocketMessage( message ) {
	  var data = JSON.parse( message.data );
	  var intent = data.intent;
	  handleInput(data); 
}




//------------------------------------------------Canvas----------------------------------------------------------------------------------------------------------------------------------------------
/* function draw(){
	ctx.beginPath();
	ctx.moveTo(lastX,lastY);
	ctx.lineTo(currX,currY);
	ctx.stroke();
	lastX = currX;
	lastY = currY;
}
 */
function initCommonJquery(){
		$(".menuButton").click(function() {
        toggleMenu();
    });
	

}

function initCanvasVariables(){
	canvas = document.getElementById("theCanvas");
	ctx = canvas.getContext('2d');
	//ctx.globalCompositeOperation = 'source-over';
	canvasWidth = document.documentElement.clientWidth;
	canvasHeight = document.documentElement.clientHeight;
	canvas.height = canvasHeight;
	ctx.lineJoin = "round";
	canvas.width = canvasWidth;
	ctx.lineWidth=lineWidth;
	ctx.fillStyle = drawColor;
	ctx.strokeStyle = drawColor;
}
var tempImgData;
function saveImg(){
	tempImgData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
}
function loadSavedImg(){
	ctx.putImageData(tempImgData,0,0);
}
function updateCanvasVariables(){
	saveImg();
	canvas.height = canvasHeight;
	canvas.width = canvasWidth;
	ctx.lineWidth=lineWidth;
	console.log("drawColor"+drawColor);
	ctx.fillStyle = drawColor;
	ctx.strokeStyle = drawColor;
	loadSavedImg();
}


//---------------------------------------------Other---------------------------------------------------------------------------------------------------------------------------------------------------------
function addZeroes (str) {
  str = str.toString();
  return str.length < 4 ? addZeroes("0" + str, 4) : str;
}