var cart = [];
var products = [];
var timeoutAlertTimer;
var inactiveTime = 30000;
var cartTimeout = 30000;

function init(){
	products["Box1"] = 5;
	products["Box2"] = 5;
	products["Clothes1"] = 5;
	products["Clothes2"] = 5;
	products["Jeans"] = 5;
	products["Keyboard"] = 5;
	products["KeyboardCombo"] = 5;
	products["Mice"] = 5;
	products["PC1"] = 5;
	products["PC2"] = 5;
	products["PC3"] = 5;
	products["Tent"] = 5;
}

function displayTimeoutAlert(){
	alert("Hey there! Are you still planning to buy something?");
	clearTimeout(timeoutAlertTimer);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
}

var CartDisplayAlert = function(time, tempProductName){
	
	var productName = tempProductName;
	var timeout = time;

	return{
		init: function(){setTimeout(this.popupCartAlert, timeout);},
		popupCartAlert: function(){	
			alert(productName + ": " + cart[productName]);
			clearTimeout(timeoutAlertTimer);
		timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);

		}
	}
}

function addToCart(productName) {
	clearTimeout(timeoutAlertTimer);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
	if (productInStock(productName)){
		if(cart.hasOwnProperty(productName)){
			cart[productName]++;
		}else{
			cart[productName] = 1;
		}
		products[productName]--;
	}else{
		alert(productName + " is out of stock!");
	}
}

function removeFromCart(productName){
	clearTimeout(timeoutAlertTimer);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
	if(cart.hasOwnProperty(productName)){
		cart[productName]--;
		if(cart[productName] == 0){
			delete cart[productName];
		}
		products[productName]++;
	}else{
		alert("Item does not exist in cart.");
	}
}

function productInStock(productName){
	return(products[productName] > 0);
}

function displayCart(){
	var cartTime = cartTimeout;
	var cartAlerts = [];
	if (Object.keys(cart).length == 0){
		alert("Cart is Empty");
		return;
	}
	var i = 0;
	for(var key in cart){
		console.log(i);
		cartAlerts[i] = CartDisplayAlert(cartTime*i, key);
		cartAlerts[i].init();
		i++;
	}
}

function cartAlert(productName){
	alert(productName + ": " + cart[productName]);
}


$(document).ready(function(){ init(); }) 