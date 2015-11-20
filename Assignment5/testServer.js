//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=5000; 

//We need a function which handles requests and send response
function handleRequest(request, response){
	if(request.method === "GET") {
    	if (request.url === "/products") {
    		response.end('return products here ' + request.url + request.method);
    		console.log('successful products get');
    	}else{
    		response.end('Unrecognized url path: ' + request.url);
    	}
    }else if(request.method === "POST"){
    	response.end('do a post request');
    }else{
    	response.end("request.method is :" + request.method);
    }
}

function clientErrorCallback(e, socket){
	response.end("Exception is " + e + ", Socket is " + socket);
}

function closeCallback(){
	response.end("socket closed");
}

//Create a server
var server = http.createServer(handleRequest);


server.on('clientError', clientErrorCallback);

server.on('close', closeCallback);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});