/*eslint-env node*/


var cfenv = require( 'cfenv' );  
var express = require( 'express' );  
var http = require( 'http' );  
var ws = require( 'ws' );
var fs = require('fs');
var stream = fs.createWriteStream("public/index3.html");
stream.once('open', function(fd) {
	  stream.write('<!DOCTYPE html><html><body><p id="data">ITS DONE: </p></body></html>');
	  stream.end();
	});
var clients = [];
// Environment
var environment = cfenv.getAppEnv();
// Web
var app = express();

// Static
app.use( '/', express.static( 'public' ) );

// Sockets
var server = http.createServer();  
var sockets = new ws.Server( {  
  server: server
} );
console.log("Started");

var theHost;
var players = [];
var player1 = "";
var player2 = "";
var failedSend = []
var allowedStrikes = 2;
var rooms = [];

function addToRoom(newClient, ip){
	var foundRoom = false;
	for(var i =0; i<rooms.length; i++){
		if(rooms[i].ip == ip){
			foundRoom = true;
			rooms[i].clients.push(newClient);
	}
	if(!foundRoom){
		var newRoom = [];
		newRoom.ip = ip;
		newRoom.clients = [];
		newRoom.clients.push(newClient);
		rooms.push(newRoom);
	}
}

// Listeners
sockets.on( 'connection', function( client ) {  
  // Debug
  console.log( 'Connection.' );
  clients.push(client);
 // failedSend.push(0);
  console.log("------------------clients------------------------");
  console.log(client);
 // console.log("------------------1-----------------------------------");
  //var ip = client.header('x-forwarded-for') || req.connection.remoteAddress;
  // var address = sockets.handshake.address;
 //  console.log('New connection from ' + address.address + ':' + address.port);
  //console.log(client[0]);
  //console.log(client.Socket);
   //console.log("------------------2----------------------------------");
  //console.log(client.Server);
 // console.log("------------------3----------------------------------");
  //console.log(client.Websocket);
  //console.log("------------------4---------------------------------");
  //console.log(client.headers);
  //console.log(clients[0]);
  // Echo messages to all clients
  client.on( 'message', function( message ) {
	var res = message.substring(0, 2);
	//console.log(res);
	console.log(message);
	if(res=="IP"){
		console.log("IP");
		var theIP = message.split("IP")[1];
		console.log(theIP);
		addToRoom(client, theIP);
		console.log(rooms);
	}else{
		broadcast(message);
	}
	
	
	

  } );
   client.on('disconnect', function() {
      console.log('Got disconnect!');
      var i = clients.indexOf(socket);
      clients.splice(i, 1);
	  broadcast( createMessage("someoneDC"));
   });
} );
function broadcast(text){
	 for( var i = 0; i < clients.length; i++ ) {
		try{
			clients[i].send( text ); 
		}catch(err){
			console.log("Could not send to Client " + i + " error: " +err);
			//var forSender = ("Failed to send some other client with i: " +i+" error: " +err);
			//sendTo(client, forSender);
		}	 
    }
}
function createMessage(text){
	return '{"content":"'+text+'"}';
}
function sendTo(theClient, text){
	try{
		theClient.send(createMessage(text));
	}catch(err){
		console.log("Error in sendTo(theClient, text) Error msg: " + err);
	}
	
	
}
// Start
server.on( 'request', app );  
server.listen( environment.port, function() {  
  console.log("environment.url");
  console.log( environment.url );
} );


			/* failedSend[i]++;
			if(failedSend[i] > (allowedStrikes-1)){
				console.log("removing client"+ i);
				failedSend.splice(i, 1);
				clients.splice(i, 1);
			} */
//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------
/*
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
*/