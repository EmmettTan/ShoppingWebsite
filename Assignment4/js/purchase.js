var cart = [];
var products = [];
var cashTotal = 0;
var inactiveIntervalTimer;
var inactiveTime = 30000;
var cartTimeout = 3000;
var enableTimeouts = false;
var xhrTimeout = 200;
var productsLoaded = false;
var remoteServer = "https://cpen400a.herokuapp.com/products";
var inflight = [];
var cartOverlayUrl = "images/cart.png";

function init(){
	var ngScope = angular.element(document.getElementById("ngWrapper")).scope();
	ngScope.sendRequest();
}

//angularjs module init
var mainModule = angular.module('mainModule', []);
mainModule.controller('cart-products-controller', ['$scope', '$interval', function($scope, $interval){
	$scope.inactiveTimeLeft = inactiveTime/1000;
	
	$scope.cart = {};
	$scope.products = {};
	$scope.cashTotal = 0;
	
	var stop; //we assign the countdownFn interval to stop

	console.log($scope.products);

	//Cart and product functions
	$scope.addToCart = function(productName) {
		$scope.resetCountdown();

		if ($scope.productInStock(productName)){
			if($scope.cart.hasOwnProperty(productName)){
				$scope.cart[productName]++;
			}else{
				$scope.cart[productName] = 1;
			}
			$scope.products[productName]["quantity"]--;
		}else{
			alert(productName + " is out of stock!");
		}
		$scope.updateCartPrice();
	}

	$scope.removeFromCart = function(productName){
		$scope.resetCountdown();

		if($scope.cart.hasOwnProperty(productName)){
			$scope.cart[productName]--;
			if($scope.cart[productName] == 0){
				delete $scope.cart[productName];
			}
			$scope.products[productName]["quantity"]++;
		}else{
			alert("Item does not exist in cart.");
		}
		$scope.updateCartPrice();
	}


	$scope.productInStock = function(productName){
		return($scope.products[productName]["quantity"] > 0);
	}

	$scope.itemExistsInCart = function(productName){
		return($scope.cart.hasOwnProperty(productName));
	}

	$scope.getNumProducts = function(){
		return Object.keys($scope.products).length;
	}

	console.log($scope.getNumProducts());

	$scope.updateCartPrice = function(){
		var key;
		$scope.cashTotal = 0;
		for(key in $scope.cart){
			$scope.cashTotal += $scope.products[key]["price"] * $scope.cart[key];
		}
	}


	//Inactive Timeout Functions
	$scope.startCountdown = function(){
		if(angular.isDefined(stop))return; 
		$scope.inactiveTimeLeft = inactiveTime/1000;
		stop = $interval($scope.countdown, 1000);
	}
	$scope.countdown = function(){
		if(!enableTimeouts) return;
		$scope.inactiveTimeLeft -= 1;
		if($scope.inactiveTimeLeft < 0){
			$scope.displayTimeoutAlert();
			$scope.resetCountdown();
		}
	}


	$scope.displayTimeoutAlert = function(){
		alert("Hey there! Are you still planning to buy something?");
	}

	$scope.resetCountdown = function(){
		$scope.inactiveTimeLeft = inactiveTime/1000;
	}


	$scope.requestCount = function(msg, xhrBuffer){
		console.log("Sending request to server: " + remoteServer);
		var count = 0;
		return function(){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", remoteServer);
			xhr.timeout = 2000;
			xhr.onload = function(){
				if(xhr.status == 200){
					console.log(xhr.getResponseHeader("Content-type"));
					if(xhr.getResponseHeader("Content-type") == 'application/json; charset=utf-8'){
						$scope.products = JSON.parse(xhr.responseText);
						$scope.updateCartPrice();
						$scope.startCountdown();
					}else{
						console.log("responseText is not of type JSON: " + xhr.responseText);
					}
				}else{
					console.log("error code: " + xhr.status + ", sending another request");
					xhr.open("GET", remoteServer);
					xhr.send();
				}
				var index = xhrBuffer.indexOf(xhr);
				xhrBuffer.splice(index, 1);
			}
			xhr.ontimeout = function(){
				console.log("Timeout Exceeded, sending another request");
				xhr.open("GET", remoteServer);
				xhr.send();
			}
			xhr.onabort = function(){
				console.log("aborted")
				var index = xhrBuffer.indexOf(xhr);
				xhrBuffer.splice(index, 1);
			}
			xhr.onerror = function(){
				console.log("error: " )
				var index = xhrBuffer.indexOf(xhr);
				xhrBuffer.splice(index, 1);
			}
			xhrBuffer.push(xhr);
			xhr.send();
		}
	}

	$scope.sendRequest = $scope.requestCount(remoteServer, inflight);


}]);

mainModule.filter('filterProductsArray', function(){
	return function(items, field){
		var filtered = [];
		angular.forEach(items, function(item, key){
			item["key"]=key;
			filtered.push(item);
		});
		return filtered;
	}
});

$(document).ready(function(){ init();  }) 