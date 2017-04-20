var socket = null;

function startConnection(){
	// WebSocket
	if(window.location.host=="localhost:4330" || window.location.host=="localhost"){
		console.log("WebSocket is not used on localhost");
	}else{
		socket = new WebSocket( 'wss://' + window.location.host );  
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
	//if(window.location.host=="diabled"){
		if(intent=="DrawMessage"){
			//socket.send(value);
		//	console.log("sending draw data");
			doSocketMessage(value);
		}
	//	console.log("sending diabled beacause Localhost. Message:"+ intent+" value: "+value);
	}else{
		if(intent=="DrawMessage"){
			console.log("sending" +value)
			socket.send(value);
			
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
}

function doSocketMessage( message ) {
		console.log("message");
	console.log(message);
	console.log(message.length);
	if(message.length == 8){
		handleDrawMessage(message);
		//console.log("DrawMessage");
	}else{
	  console.log("doSocketMessage");
	  // Parse
	 /*  var data = JSON.parse( message.data );
	  var intent = data.intent;
	  //console.log(intent);
	  handleInput(data); */
	}
}

