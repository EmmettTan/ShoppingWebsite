var https = require('https');
var timeout = 2000;
var numTries = 0;
var maxTries = 5;
var products = {};

var options = {
  host: 'mysterious-basin-3200.herokuapp.com',
  path: '/products',
  method: 'GET'
};

var callback = function(res) {
  console.log("Received Status Code: " + res.statusCode);
  if(res.statusCode != 200){
    console.log("Error, sending another request");
    abortResendHttpRequest();
  }else{
  //how to get content type?
    res.on('data', function(d) {
        products = JSON.parse(d);
        console.log(products);
    });
  }
};

var req = https.request(options, callback);

function setupHttpsRequest(){
  req = https.request(options, callback);

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
  req.end().on('error', function(e) {
    console.log("Got error: " + e.message);
  });
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
sendHttpRequest();