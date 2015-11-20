var https = require('https');

var mongodb = require('mongodb');
var assert = require('assert');

var MongoClient = mongodb.MongoClient;

var maxTries = 5;

var url = 'mongodb://localhost:27017/database';
var remoteServer = 'https://cpen400a.herokuapp.com/products';

var inflight = [];

var timeout = 2000;
var numTries = 0;
var maxTries = 5;
var products = {};

var options = {
  host: 'mysterious-basin-3200.herokuapp.com',
  path: '/products',
  method: 'GET',
};


// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
    // Get the documents collection
    var collection = db.collection('products');
    collection.drop();


    collection = db.collection('products');

   	
    function populateDbWithProducts(productList){
		var keys = Object.keys(products);
		for(var key in keys){
			var item = products[keys[key]];
			console.log(item);
			item.name = keys[key];
			collection.insert(item, function (err, result) {
		      if (err) {
		        console.log(err);
		      } else {
		        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
		      }
		  	});
		}
	}

	//https stuff
	var callback = function(res) {
	  console.log("Received Status Code: " + res.statusCode);
	  if(res.statusCode != 200){
	    console.log("Error, sending another request");
	    abortResendHttpRequest();
	  }else{
	  //how to get content type?
	    res.on('data', function(d) {
	        products = JSON.parse(d);
	        populateDbWithProducts();
	    });
	  }
	};

	var req;

	function setupHttpsRequest(){
	  req = https.get(options, callback);

	  req.on('error', function(e) {
	    console.error(e);
	    sendHttpRequest();
	  });

	  req.setTimeout(timeout, timeoutResendHttpRequest);
	};

	function sendHttpRequest(){
	  
	  if (numTries > maxTries){
	    console.log("Too many unsuccessful connection attempts.");
	    return;
	  }
	  numTries++;
	  req.end();
	}
	 
	function abortResendHttpRequest(){
	  req.end();
	  req.destroy();
	  setupHttpsRequest();
	  sendHttpRequest();
	}

	function timeoutResendHttpRequest(){
	  req.end();
	  req.destroy();
	  setupHttpsRequest();
	  console.log("Timed out, sending another request");
	  sendHttpRequest();
	}

	//end of https stuff

    // Insert some users
    // collection.insert([user1, user2, user3], function (err, result) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
    //   }
    //   //Close connection
    //   db.close();
    // });
  
	setupHttpsRequest();
  }
});

//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=5000; 

//We need a function which handles requests and send response
function handleRequest(request, response){
	response.writeHead(200, {
		"Access-Control-Allow-Origin" : "*"
		}
	)
	if(request.method === "GET") {
    	if (request.url === "/products") {
    		response.end('return products here ' + request.url + request.method);
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


// var db = mongoose.connection;

// var productSchema = mongoose.Schema({
// 	name: String,
// 	price: Number,
// 	quantity: Number,
// 	url: String
// });

// var Product = mongoose.model('Product', productSchema);


// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function (callback) {
// 	Product.find(function (err, products) {
// 	  if (err) return console.error(err);
// 	  console.log(products);
// 	});

// 	setupHttpsRequest();
// });




