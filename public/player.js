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
var historyState = 0;
var imgHistory  = [];
var availableRedos;
var howMuchRedo = 30;

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
	updateHistory();
	
	//document.body.requestFullscreen();
	window.scrollTo(0,100);
	console.log("canvasWidth "+canvasWidth);
	console.log("canvasHeight "+canvasHeight);
	console.log("window.innerHeight "+window.innerHeight);
	console.log("screen.height "+screen.height);
	console.log("$('#theCanvas').height()"+$("#theCanvas").height());
	updateDiffY();
	ctx.fillStyle = "white";
	fillCanvas();
	ctx.fillStyle = "black";
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
	historyState = 0;
	imgHistory  = [];
	createHistoryArray();
	
}
function changeDrawSize(width){
	console.log("changeDrawSize");
	lineWidth= width;
	ctx.lineWidth=lineWidth;
	send("changeDrawSize",lineWidth );
}
function updateDiffY(){
	diffY = 30;
	//console.log("diffY "+diffY);
}
function setTextColor(picker) {
		//document.getElementsByTagName('body')[0].style.color = '#' + picker.toString()
		var newColor = '#' + picker.toString();
		console.log(newColor);
		changeDrawColor(newColor);
	}
function changeDrawColor(color){
	//console.log("changeDrawColor");
	//console.log(theButton);
	drawColor = color;
	//drawColor= $("."+color).css("background-color");
	//console.log(drawColor);
	ctx.strokeStyle = drawColor;
	ctx.fillStyle = drawColor;
	//console.log(ctx.fillStyle );
	send("changeDrawColor",drawColor );
}
function clearCanvas(){
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
	send("clear");
	updateHistory();
}
function fillCanvas(){
	ctx.fillRect(0, 0, canvasWidth, canvasHeight); // clear canvas
	send("fill");
	updateHistory();
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
			// updateHistory();
            currX = e.pageX - canvas.offsetLeft;
            currY = e.pageY - canvas.offsetTop-diffY;
			lastX = currX;
			lastY = currY;
            flag = true;
			var value = addZeroes(parseInt(currX))+""+addZeroes(parseInt(currY));
			send("start", value);
			sendCurrentXY();
        }
        if (res == 'up' || res == "out") {
			//updateHistory();
            flag = false;
			send("stop");
			updateHistory()
        }
        if (res == 'move') {
            if (flag) {
                currX = e.pageX - canvas.offsetLeft;
                currY = e.pageY - canvas.offsetTop-diffY;
				sendCurrentXY();
            }
        }
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
//------------------------------------------------Undo Redo----------------------------------------------------------------------------------------------------------------------------------------------

var img0;
var img1;
var img2;
var img3;
var img4;
var img5;
var img6;
var img7;
var testData = "data:​image/​png;​base64,iVBORw0KGgoAAAANSUhEUgAAA9QAAAInCAYAAAB5pRGHAAAgAElEQVR4Xu3dd7BtZ1kH4B8IEQEVB+kltCAQQ5HeNFIziA5lEIGhd2yEMhSBQUr4gySMMINBonQEpIgQSqR3pElooSR0EYcikqA0cb5hHdxu9z53n/​fsvc8qz565c5Nz1/​ut73u+dyb53bXXWueIDwECBAgQIECAAAECBAgQILBngXPsuUIBAQIECBAgQIAAAQIECBAgEIFaExAgQIAAAQIECBAgQIAAgYKAQF1AU0KAAAECBAgQIECAAAECBARqPUCAAAECBAgQIECAAAECBAoCAnUBTQkBAgQIECBAgAABAgQIEBCo9QABAgQIECBAgAABAgQIECgICNQFNCUECBAgQIAAAQIECBAgQECg1gMECBAgQIAAAQIECBAgQKAgIFAX0JQQIECAAAECBAgQIECAAAGBWg8QIECAAAECBAgQIECAAIGCgEBdQFNCgAABAgQIECBAgAABAgQEaj1AgAABAgQIECBAgAABAgQKAgJ1AU0JAQIECBAgQIAAAQIECBAQqPUAAQIECBAgQIAAAQIECBAoCAjUBTQlBAgQIECAAAECBAgQIEBAoNYDBAgQIECAAAECBAgQIECgICBQF9CUECBAgAABAgQIECBAgAABgVoPECBAgAABAgQIECBAgACBgoBAXUBTQoAAAQIECBAgQIAAAQIEBGo9QIAAAQIECBAgQIAAAQIECgICdQFNCQECBAgQIECAAAECBAgQEKj1AAECBAgQIECAAAECBAgQKAgI1AU0JQQIECBAgAABAgQIECBAQKDWAwQIECBAgAABAgQIECBAoCAgUBfQlBAgQIAAAQIECBAgQIAAAYFaDxAgQIAAAQIECBAgQIAAgYKAQF1AU0KAAAECBAgQIECAAAECBARqPUCAAAECBAgQIECAAAECBAoCAnUBTQkBAgQIECBAgAABAgQIEBCo9QABAgQIECBAgAABAgQIECgICNQFNCUECBAgQIAAAQIECBAgQECg1gMECBAgQIAAAQIECBAgQKAgIFAX0JQQIECAAAECBAgQIECAAAGBWg8QIECAAAECBAgQIECAAIGCgEBdQFNCgAABAgQIECBAgAABAgQEaj1AgAABAgQIECBAgAABAgQKAgJ1AU0JAQIECBAgQIAAAQIECBAQqPUAAQIECBAgQIAAAQIECBAoCAjUBTQlBAgQIECAAAECBAgQIEBAoNYDBAgQIECAAAECBAgQIECgICBQF9CUECBAgAABAgQIECBAgAABgVoPECBAgAABAgQIECBAgACBgoBAXUBTQoAAAQIECBAgQIAAAQIEBGo9QIAAAQIECBAgQIAAAQIECgICdQFNCQECBAgQIECAAAECBAgQEKj1AAECBAgQIECAAAECBAgQKAgI1AU0JQQIECBAgAABAgQIECBAQKDWAwQIECBAgAABAgQIECBAoCAgUBfQlBAgQIAAAQIECBAgQIAAAYFaDxAgQIAAAQIECBAgQIAAgYKAQF1AU0KAAAECBAgQIECAAAECBARqPUCAAAECBAgQIECAAAECBAoCAnUBTQkBAgQIECBAgAABAgQIEBCo9QABAgQIECBAgAABAgQIECgICNQFNCUECBAgQIAAAQIECBAgQECg1gMECBAgQIAAAQIECBAgQKAgIFAX0JQQIECAAAECBAgQIECAAAGBWg8QIECAAAECBAgQIECAAIGCgEBdQFNCgAABAgQIECBAgAABAgQEaj1AgAABAgQIECBAgAABAgQKAgJ1AU0JAQIECBAgQIAAAQIECBAQqPUAAQIECBAgQIAAAQIECBAoCAjUBTQlBAgQIECAAAECBAgQIEBAoNYDBAgQIECAAAECBAgQIECgICBQF9CUECBAgAABAgQIECBAgAABgVoPECBAgAABAgQIECBAgACBgoBAXUBTQoAAAQIECBAgQIAAAQIEBGo9QIAAAQIECBAgQIAAAQIECgICdQFNCQECBAgQIECAAAECBAgQEKj1AAECBAgQIECAAAECBAgQKAgI1AU0JQQIECBAgAABAgQIECBAQKDWAwQIECBAgAABAgQIECBAoCAgUBfQlBAgQIAAAQIECBAgQIAAAYFaDxAgQIAAAQIECBAgQIAAgYKAQF1AU0KAAAECBAgQIECAAAECBARqPUCAAAECBAgQIECAAAECBAoCAnUBTQkBAgQIECBAgAABAgQIEBCo9QABAgQIECBAgAABAgQIECgICNQFNCUECBAgQIAAAQIECBAgQECg1gMECBAgQIAAAQIECBAgQKAgIFAX0JQQIECAAAECBAgQIECAAAGBWg8QIECAAAECBAgQIECAAIGCgEBdQFNCgAABAgQIECBAgAABAgQEaj1AgAABAgQIECBAgAABAgQKAgJ1AU0JAQIECBAgQIAAAQIECBAQqPUAAQIECBAgQIAAAQIECBAoCAjUBTQlBAgQIECAAAECBAgQIEBAoNYDBAgQIECAAAECBAgQIECgICBQF9CUECBAgAABAgQIECBAgAABgVoPECBAgAABAgQIECBAgACBgoBAXUBTQoAAAQIECBAgQIAAAQIEBGo9QIAAAQIECBAgQIAAAQIECgICdQFNCQECBAgQIECAAAECBAgQEKj1AAECBAgQIECAAAECBAgQKAgI1AU0JQQIECBAgAABAgQIECBAQKDWAwQIECBAgAABAgQIECBAoCAgUBfQlBAgQIAAAQIECBAgQIAAAYFaDxAgQIAAAQIECBAgQIAAgYKAQF1AU0KAAAECBAgQIECAAAECBARqPUCAAAECBAgQIECAAAECBAoCAnUBTQkBAgQIECBAgAABAgQIEBCo9QABAgQIECBAgAABAgQIECgICNQFNCUECBAgQIAAAQIECBAgQECg1gMECBAgQIAAAQIECBAgQKAgIFAX0JQQIECAAAECBAgQIECAAAGBWg8QIECAAAECBAgQIECAAIGCgEBdQFNCgAABAgQIECBAgAABAgQEaj1AgAABAgQIECBAgAABAgQKAgJ1AU0JAQIECBAgQIAAAQIECBAQqPUAAQIECBAgQIAAAQIECBAoCAjUBTQlBAgQIECAAAECBAgQIEBAoNYDBAgQIECAAAECBAgQIECgICBQF9CUECBAgAABAgQIECBAgAABgVoPECBAgAABAgQIECBAgACBgoBAXUBTQoAAAQIECBAgQIAAAQIEBGo9QIAAAQIECBAgQIAAAQIECgICdQFNCQECBAgQIECAAAECBAgQEKj1AAECBAgQIECAAAECBAgQKAgI1AU0JQQIECBAgAABAgQIECBAQKDWAwQIECBAgAABAgQIECBAoCAgUBfQlBAgQIAAAQIECBAgQIAAAYFaDxAgQIAAAQIECBAgQIAAgYKAQF1AU0KAAAECBAgQIECAAAECBARqPUCAAAECBAgQIECAAAECBAoCAnUBTQkBAgQIECBAgAABAgQIEBCo9QABAgQIECBAgAABAgQIECgICNQFNCUECBAgQIAAAQIECBAgQECg1gMECBAgQIAAAQIECBAgQKAgIFAX0JQQIECAAAECBAgQIECAAAGBWg8QIECAAAECBAgQIECAAIGCgEBdQFNCgAABAgQIECBAgAABAgQEaj1AgAABAgQIECBAgAABAgQKAgJ1AU0JAQIECBAgQIAAAQIECBAQqPUAAQIECBAgQIAAAQIECBAoCAjUBTQlBAgQIECAAAECBAgQIEBAoNYDBAgQIECAAIF+CXw5yTtmfn2qX9MzGwIECBDYERCo9QIBAgQIECBAoD8CN0zyrrnp7ATsd3YhW8Duz36ZCQECExcQqCfeAJZPgAABAgQI9ErgUUmOO8SMrpvk8CR/​16uZmwwBAgQmKCBQT3DTLZkAAQIECBDorcDrkxyzy+z+PcnTkzyu+/​XE3q7ExAgQIDABAYF6AptsiQQIECBAgMBgBM5Kcr5dZvuhJNec+fMXJ7lnkh8MZoUmSoAAgREJCNQj2kxLIUCAAAECBAYvcO4kv5nkxt3v7Z9/​bmZVP5779/​ZHH+5C9WmDX70FECBAYGACAvXANsx0CRAgQIDAHgUukuSoJFed+f1mSb69x3EcfjACOwH7Jknuk+TCS6bxvSQnJ/​nTg5mmsxIgQGCaAgL1NPfdqgkQIEBgnALzwbmF6EssWOrRSd4+ToLRr+oJSR67YJUfSXKNJM9N8tAk3xq9hAUSIECgBwICdQ82wRQIECBAgMA+BO6S5IdJXpikXc1c5fMnSZ6xyoGO6aXAnbvgvLPfH0/​y6zMz/​VoXqv+2l7M3KQIECIxIQKAe0WZaCgECBAhMSqAF6WO7B1S1MP0HSc61osCzk9xvxWMd1k+B9mCy5yS5VJIz5h5UtjNjV6v7uXdmRYDAiAQE6hFtpqUQIECAwCQEZoP07IJPT3KlFQXen+R6Kx7rsP4KtKeB/​1WSdsV62addrX5Fkj/​u7zLMjAABAsMVEKiHu3dmToAAAQLTEmih6SFLrkQ2iTOTXG4ByX8n+ViS9gTond/​bP7eg5TMOgXslOSHJBRYs571Jru/​e6nFstFUQINA/​AYG6f3tiRgQIECBAoAm0+2Pbq5NuleROSS6+Ass3ulcozYfnFqp9xi3QHj7XQvUdZ5b5H0nOTnKx7mftL1HaX8q8ZNwUVkeAAIHtCQjU27N2JgIECBAgsJtAu/​+5vXN49tfO+4e/​lOTSuxSf2l2B9BAqPTZ7tfqd3V/​KzKu4t1qfECBAYE0CAvWaIA1DgAABAgT2KLBzBboF6FsmuXaSnQA9P9SPuj+b/​+92C9InJnnjHs/​t8HELtKvVL0tyg12W6Wr1uHvA6ggQ2JKAQL0laKchQIAAgckLzAbonavQOwG6vRP6tw4h9NKZr/​MK0pNvp5UAdru3+qNJPtG9r9oDy1bidBABAgT+v4BArSsIECBAgMBmBVp…ECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQICNR6gAABAgQIECBAgAABAgQIFAQE6gKaEgIECBAgQIAAAQIECBAgIFDrAQIECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQICNR6gAABAgQIECBAgAABAgQIFAQE6gKaEgIECBAgQIAAAQIECBAgIFDrAQIECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQICNR6gAABAgQIECBAgAABAgQIFAQE6gKaEgIECBAgQIAAAQIECBAgIFDrAQIECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQICNR6gAABAgQIECBAgAABAgQIFAQE6gKaEgIECBAgQIAAAQIECBAgIFDrAQIECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQICNR6gAABAgQIECBAgAABAgQIFAQE6gKaEgIECBAgQIAAAQIECBAgIFDrAQIECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQICNR6gAABAgQIECBAgAABAgQIFAQE6gKaEgIECBAgQIAAAQIECBAgIFDrAQIECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQICNR6gAABAgQIECBAgAABAgQIFAQE6gKaEgIECBAgQIAAAQIECBAgIFDrAQIECBAgQIAAAQIECBAgUBAQqAtoSggQIECAAAECBAgQIECAgECtBwgQIECAAAECBAgQIECAQEFAoC6gKSFAgAABAgQIECBAgAABAgK1HiBAgAABAgQIECBAgAABAgUBgbqApoQAAQIECBAgQIAAAQIECAjUeoAAAQIECBAgQIAAAQIECBQEBOoCmhICBAgQIECAAAECBAgQICBQ6wECBAgQIECAAAECBAgQIFAQEKgLaEoIECBAgAABAgQIECBAgIBArQcIECBAgAABAgQIECBAgEBBQKAuoCkhQIAAAQIECBAgQIAAAQICtR4gQIAAAQIECBAgQIAAAQIFAYG6gKaEAAECBAgQIECAAAECBAgI1HqAAAECBAgQIECAAAECBAgUBATqApoSAgQIECBAgAABAgQIECAgUOsBAgQIECBAgAABAgQIECBQEBCoC2hKCBAgQIAAAQIECBAgQICAQK0HCBAgQIAAAQIECBAgQIBAQUCgLqApIUCAAAECBAgQIECAAAECArUeIECAAAECBAgQIECAAAECBQGBuoCmhAABAgQIECBAgAABAgQI/​A/​rKHFGVNxjBgAAAABJRU5ErkJggg==";
function createHistoryArray(){
	for(var i =0; i<howMuchRedo; i++){
		var newImgObj = "not used";
		imgHistory.push(newImgObj);
	}
	availableRedos = imgHistory.length;
}
function getHistoryState(upOrDown){
	var historyStateTemp = historyState;
	if(upOrDown=="up"){
		historyStateTemp++;
		if(historyStateTemp==availableRedos){
			historyStateTemp=0;
		}
	}
	if(upOrDown=="down"){
		historyStateTemp--;
		if(historyStateTemp==-1){
			historyStateTemp=availableRedos-1;
		}
	}
	return historyStateTemp;
}
function updateHistory(){
	historyState = getHistoryState("up");
	imgHistory[historyState] =canvas.toDataURL();
	//console.log(imgHistory);
}
function undo(){
	historyState = getHistoryState("down");
	updateToCurrentState("up");
}
function redo(){
	historyState = getHistoryState("up");
	updateToCurrentState("down");
}
function updateToCurrentState(oppositeDirection){
	console.log("historyState "+historyState);
	if( imgHistory[historyState]=="not used"){
		console.log("no more undo/redo states");
		historyState = getHistoryState(oppositeDirection);
	}else{
		var oldImgData = imgHistory[historyState];
		drawImgData(oldImgData);
		send("drawImgData", oldImgData);
	}
	
}
function drawImgData(imgData){
	var img = new Image();
	img.src = imgData;
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
	};
}

//------------------------------------------------Turn Stuff----------------------------------------------------------------------------------------------------------------------------------------------
var yourWord ="";
var yourTurn = false;
function startTurn(word){
	$("#inputContainer").show();
	$("#whatsMyWordButton").show();
	$("#waitingDiv").hide();
	$("#guessContainer").hide();
	yourTurn = true;
	if(word==yourWord){
		console.log("I know");
	}else{
		yourWord = word;
		whatsMyWord();
	}
}
function showGuessing(){
	yourTurn = false;
	$("#inputContainer").hide();
	$("#whatsMyWordButton").hide();
	$("#waitingDiv").hide();
	$("#guessContainer").show();
}
function whatsMyWord(){
	document.getElementById("yourWord").innerHTML = "Your word is: "+ yourWord;
	document.getElementById("whatsMyWordButton").value = "Your word is: "+ yourWord;
	$("#yourWord").show();
	$("#yourWord").fadeOut(5000);
	//alert("your word is "+ yourWord);
}
function guess(){
	var guess = document.getElementById("guessText").value;
	send("guess", guess);
}
function showInfo(text){
	document.getElementById("waitingDiv").innerHTML = text;
	$("#inputContainer").hide();
	$("#whatsMyWordButton").hide();
	$("#waitingDiv").show();
	$("#guessContainer").hide();
}
function showWrong(){
	document.getElementById("guessText").value = "";
	$("#guessText").attr("placeholder", "Wrong");
}
function sendStart(){
	send("startGame");
}
function getNewWord(){
	send("getNewCard");
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
	if(intent=="startTurn"){
		if(playerNumber==data.value){
			startTurn(data.value2);
			console.log("start");
		}else{
			showGuessing();
		}
	}
	if(intent=="correct"){
		if(yourTurn){
			showInfo("Player "+ (data.value+1) +" guessed your drawing.");
			yourTurn = false;
		}else{
			if(playerNumber==data.value){
				showInfo("Congratulations. You got it right!");
			}else{
				showInfo("Sorry. Time is up! Player "+ (data.value+1) +" got it right.");
			}
		} 
		
	}
	if(intent=="incorrect"){
		if(playerNumber==data.value){	
			showWrong();
		}
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
		  if( yourTurn){
			send("userCanvas", canvasWidth, canvasHeight);
		  }
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
			findxy('move', e.touches[0])
        }, false);
        canvas.addEventListener("touchstart", function (e) {
			e.preventDefault();
		//	var values= "diffY " +diffY+ " canvasHeight" + canvasHeight;
			//	document.getElementById("playerNumber").innerHTML = values;
            findxy('down', e.touches[0])
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
		updateDiffY();
		updateHideDivSize();
		 if( yourTurn){
			send("userCanvas", canvasWidth, canvasHeight);
		  }
		//send("canvasSize", canvasWidth, canvasHeight);
	});
}
/* $(window).load(function() {
  $("html, body").animate({ scrollTop: $(document).height() }, 1);
});
 */

 function updateHideDivSize(){
	document.getElementById("rotate").style.height = "100vh";
	document.getElementById("rotate").style.width = "100vw";
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

function testStart(){
	toggleMenu();
	var message = {
      intent: "startTurn",
	  value: 0,
	  value2: "apple",
	  sender: "host",
	  playerNumber: 1
    };
	handleInput(message);
}
function testStart2(){
	toggleMenu();
	var message = {
      intent: "startTurn",
	  value: 1,
	  value2: "apple",
	  sender: "host",
	  playerNumber: 1
    };
	handleInput(message);
}




