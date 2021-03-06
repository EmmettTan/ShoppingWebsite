var cart = [];
var products = [];
var inactiveIntervalTimer;
var inactiveTime = 300000;
var enableTimeouts = true;
var xhrTimeout = 200;
var productsLoaded = false;
// var remoteServer = "https://cpen400a.herokuapp.com/products";http://localhost:5000/
// var remoteServer = "https://mysterious-basin-3200.herokuapp.com/products";
var remoteServer = "http://localhost:5000/products";
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
	$scope.XMLSendFinished = false;
	
	var stop; //we assign the countdownFn interval to stop
	var numTries = 0; //stop after certain threshold
	var maxTries = 10;
	//compares cart quantity and price with updated info from server
	var compareCartWithProducts = function(){
		var keys = Object.keys($scope.cart);
		console.log(keys);
		for(var key in keys){
			if($scope.cart[keys[key]]['quantity'] > $scope.products[keys[key]]['quantity']){
				$scope.cart[keys[key]]['quantity-diff'] = true; 
				$scope.cart[keys[key]]['quantity'] = $scope.products[keys[key]]['quantity'];
				$scope.products[keys[key]]['quantity'] = 0;
			}else{
				 $scope.cart[keys[key]]['quantity-diff'] = false; 
				 $scope.products[keys[key]]['quantity'] -= $scope.cart[keys[key]]['quantity'];
			}
			// if($scope.cart[keys[key]]['quantity'] == 0) delete $scope.cart[keys[key]];
		}
	}

	//Cart and product functions
	$scope.addToCart = function(productName) {
		$scope.resetCountdown();

		if ($scope.productInStock(productName)){
			if($scope.cart.hasOwnProperty(productName)){
				$scope.cart[productName]['quantity']++;
			}else{
				$scope.cart[productName] = {};
				$scope.cart[productName]['quantity'] = 1;
				$scope.cart[productName]['price'] = $scope.products[productName]['price'];
			}
			$scope.products[productName]["quantity"]--;
		}else{
			alert(productName + " is out of stock!");
		}
	}

	$scope.removeFromCart = function(productName){
		$scope.resetCountdown();

		if($scope.cart.hasOwnProperty(productName)){
			$scope.cart[productName]['quantity']--;
			if($scope.cart[productName]['quantity'] == 0){
				delete $scope.cart[productName];
			}
			$scope.products[productName]["quantity"]++;
		}else{
			alert("Item does not exist in cart.");
		}
	}
	

	$scope.deleteItemFromCart = function(productName){
		if($scope.cart[productName])delete $scope.cart[productName];
	}

	$scope.productInStock = function(productName){
		return($scope.products[productName]["quantity"] > 0);
	}

	$scope.itemExistsInCart = function(productName){
		return($scope.cart.hasOwnProperty(productName) && $scope.cart[productName]['quantity'] > 0);
	}

	$scope.getNumProducts = function(){
		return Object.keys($scope.products).length;
	}

	$scope.getCartPrice = function(){
		var key;
		var total = 0;
		for(key in $scope.cart){
			total += $scope.products[key]["price"] * $scope.cart[key]['quantity'];
		}
		return total;
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

	$scope.showCashTotal = function(){
		var updatedProductsAlertStr = "";
		updatedProductsAlertStr += "Total Amount Due: $" + $scope.getCartPrice() + '\n\n';
		var keys = Object.keys($scope.cart);
		for(var key in keys){
			if ( $scope.cart[keys[key]]['price'] != $scope.products[keys[key]]['price'] ){
				updatedProductsAlertStr += keys[key] + " price changed from " + $scope.cart[keys[key]]['price'] + " to " + $scope.products[keys[key]]['price'] + "." + '\n';
			}
			if($scope.cart[keys[key]]['quantity-diff']){
				updatedProductsAlertStr += keys[key] + " quantity: only " + ($scope.products[keys[key]]['quantity']+$scope.cart[keys[key]]['quantity']) + " items found in inventory." + '\n';
			}
		}

		alert(updatedProductsAlertStr);
	}				


	$scope.requestCount = function(msg, xhrBuffer){
		console.log("Sending request to server: " + remoteServer);

		var count = 0;

		

		return function(){
			if(!isEmpty($scope.cart)){
				alert("Checking server for inventory availability and price changes...");
			}
			numTries++;
			//updating the price each time we refetch data
			var keys = Object.keys($scope.cart);
			for(var key in keys){
				$scope.cart[keys[key]]['price'] = $scope.products[keys[key]]['price']; 
			}

			var xhr = new XMLHttpRequest();
			xhr.open("GET", remoteServer);
			xhr.timeout = 2000;
			xhr.onload = function(){
				if(xhr.status == 200){
					numTries = 0;
					console.log(xhr.getResponseHeader("Content-type"));
					if(xhr.getResponseHeader("Content-type") == 'application/json; charset=utf-8'){
						$scope.products = JSON.parse(xhr.responseText);
						compareCartWithProducts();
						$scope.XMLSendFinished = true;
						if(!isEmpty($scope.cart))$scope.showCashTotal();
						$scope.startCountdown();
					}else{
						console.log("responseText is not of type JSON: " + xhr.responseText);
					}
				}else{
					if(numTries > maxTries){
						console.log("Connection failed too many times. Try refreshing the page.")
						return;
					}
					console.log("error code: " + xhr.status + ", sending another request");
					xhr.open("GET", remoteServer);
					numTries++;
					xhr.send();
				}
				var index = xhrBuffer.indexOf(xhr);
				xhrBuffer.splice(index, 1);
			}
			xhr.ontimeout = function(){
				if(numTries > maxTries){
					console.log("Connection failed too many times. Try refreshing the page.")
					return;
				}
				console.log("Timeout Exceeded, sending another request");
				xhr.open("GET", remoteServer);
				numTries++;
				xhr.send();
			}
			xhr.onabort = function(){
				numTries = 0;
				console.log("aborted")
				var index = xhrBuffer.indexOf(xhr);
				xhrBuffer.splice(index, 1);
			}
			xhr.onerror = function(){
				if(numTries > maxTries){
					console.log("Connection failed too many times. Try refreshing the page.")
					return;
				}
				console.log("error: " + xhr.status );
				xhr.open("GET", remoteServer);
				numTries++;
				xhr.send();
			}
			xhrBuffer.push(xhr);
			$scope.XMLSendFinished = false;
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

mainModule.filter('cartPriceIsDifferent', function(){
	return function(key){
		if($scope.cart[key]['price'] != $scope.products[key]['price']){
			return true;
		}
	}
});

var showCashTotal = function(){
	var ngScope = angular.element(document.getElementById("ngWrapper")).scope();
	
	alert("Total Amount Due: $" + ngScope.getCartPrice());
}	

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

$(document).ready(function(){ init();  }) 