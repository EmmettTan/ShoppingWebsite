var cart = [];
var products = [];
var timeoutAlertTimer;
var inactiveTime = 30000;

function init(){
	products["Box1"] = "$10";
	products["Box2"] = "$20";
	products["Clothes1"] = "$20";
	products["Clothes2"] = "$30";
	products["Jeans"] = "$50";
	products["Keyboard"] = "$20";
	products["KeyboardCombo"] = "$40";
	products["Mice"] = "$20";
	products["PC1"] = "$350";
	products["PC2"] = "$400";
	products["PC3"] = "$300";
	products["Tent"] = "$100";

	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
}

function displayTimeoutAlert(){
	alert("Hey there! Are you still planning to buy something?");
	clearTimeout(timeoutAlertTimer);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
}

function addToCart(productName) {
	clearTimeout(timeoutAlertTimer);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
	if(cart.hasOwnProperty(productName)){
		cart[productName]++;
	}else{
		cart[productName] = 1;
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
	}else{
		alert("Item does not exist in cart.");
	}
}

function displayCart(){
	if (Object.keys(cart).length == 0){
		alert("Cart is Empty");
		return;
	}
	for(var key in cart){
		alert(key + ": " + cart[key]);
	}
}


