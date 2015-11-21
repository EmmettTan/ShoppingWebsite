var https = require('https');
var mongodb = require('mongodb');
var assert = require('assert');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var MongoClient = mongodb.MongoClient;

var maxTries = 5;

var url = 'mongodb://localhost:27017/database';
var remoteServer = 'https://cpen400a.herokuapp.com/products';

// var collections = ["products"];
// var db = require("mongojs").connect(url, collections);

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
			item.name = keys[key];
			collection.insert(item, function (err, result) {
		      if (err) {
		        console.log(err);
		      } else {
		        // console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
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

  
	setupHttpsRequest();

	app.use(bodyParser.json());

	app.set('port', (process.env.PORT || 5000));



	app.get('/products', function(request, response) {

	  response.header("Access-Control-Allow-Origin", "*");
	  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  db.collection('products').find().toArray(function(err, items){
	  	response.json(items);
	  });
	})

	app.post('/products', function(req, res){
		var resStr = "";
		console.log(req.body);
		for (var item in req.body){
			resStr += item;
		}
		res.end(resStr)
	})

	app.listen(app.get('port'), function() {
	  console.log("Node app is running at localhost:" + app.get('port'))
	});
  }
});







