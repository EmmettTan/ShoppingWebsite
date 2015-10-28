var cart = [];
var products = [];
var cashTotal = 0;
var timeoutAlertTimer;
var updateTimeRemainingTimer;
var inactiveTime = 300000;
var timeRemaining = inactiveTime;
var cartTimeout = 3000;
var enableTimeouts = false;

function init(){
	products["Box1"] = {};
	products["Box2"] = {};
	products["Clothes1"] = {};
	products["Clothes2"] = {};
	products["Jeans"] = {};
	products["Keyboard"] = {};
	products["KeyboardCombo"] = {};
	products["Mice"] = {};
	products["PC1"] = {};
	products["PC2"] = {};
	products["PC3"] = {};
	products["Tent"] = {};

	products["Box1"]["quantity"] = 5;
	products["Box1"]["price"] = 10;
	products["Box1"]["src"] = "images/Box1_$10.png";


	products["Box2"]["quantity"] = 5;
	products["Box2"]["price"] = 20;
	products["Box2"]["src"] = "images/Box2_$20.png";

	products["Clothes1"]["quantity"] = 5;
	products["Clothes1"]["price"] = 20;
	products["Clothes1"]["src"] = "images/Clothes1_$20.png";

	products["Clothes2"]["quantity"] = 5;
	products["Clothes2"]["price"] = 30;
	products["Clothes2"]["src"] = "images/Clothes2_$30.png";

	products["Jeans"]["quantity"] = 5;
	products["Jeans"]["price"] = 50;
	products["Jeans"]["src"] = "images/Jeans_$50.png";

	products["Keyboard"]["quantity"] = 5;
	products["Keyboard"]["price"] = 20;
	products["Keyboard"]["src"] = "images/Keyboard_$20.png";

	products["KeyboardCombo"]["quantity"] = 5;
	products["KeyboardCombo"]["price"] = 40;
	products["KeyboardCombo"]["src"] = "images/KeyboardCombo_$40.png";

	products["Mice"]["quantity"] = 5;
	products["Mice"]["price"] = 20;
	products["Mice"]["src"] = "images/Mice_$20.png";

	products["PC1"]["quantity"] = 5;
	products["PC1"]["price"] = 350;
	products["PC1"]["src"] = "images/PC1_$350.png";

	products["PC2"]["quantity"] = 5;
	products["PC2"]["price"] = 400;
	products["PC2"]["src"] = "images/PC2_$400.png";

	products["PC3"]["quantity"] = 5;
	products["PC3"]["price"] = 300;
	products["PC3"]["src"] = "images/PC3_$300.png";

	products["Tent"]["quantity"] = 5;
	products["Tent"]["price"] = 100;
	products["Tent"]["src"] = "images/Tent_$100.png";

	updateTimeRemainingTimer = setTimeout(updateInactiveTime, 1000);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
	document.getElementById('cashTotalText').innerHTML = "$" + cashTotal;
	document.getElementById("inactiveTimeText").innerHTML = timeRemaining/1000 - 1;
	updateAddBtnVisibility();
	updateRemoveBtnVisibility();
}

function displayTimeoutAlert(){
	if(!enableTimeouts)return;
	alert("Hey there! Are you still planning to buy something?");
	clearTimeout(timeoutAlertTimer);
	clearTimeout(updateTimeRemainingTimer);
	timeRemaining = inactiveTime;
	updateTimeRemainingTimer = setTimeout(updateInactiveTime, 1000);
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

function updateInactiveTime(){
	if(!enableTimeouts) return;
	timeRemaining = timeRemaining - 1000;
	document.getElementById("inactiveTimeText").innerHTML = timeRemaining/1000 - 1;
	updateTimeRemainingTimer = setTimeout(updateInactiveTime, 1000)
}

function modalAddToCart(caller){
	var key = getModalItemName(caller);
	addToCart(key);
}

function getModalItemName(caller){
	return caller.parentNode.parentNode.getAttribute("item")
}

function addToCart(productName) {
	clearTimeout(timeoutAlertTimer);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
	timeRemaining = inactiveTime;
	clearTimeout(updateTimeRemainingTimer);
	updateTimeRemainingTimer = setTimeout(updateInactiveTime, 1000);
	if (productInStock(productName)){
		if(cart.hasOwnProperty(productName)){
			cart[productName]++;
		}else{
			cart[productName] = 1;
		}
		products[productName]["quantity"]--;
	}else{
		alert(productName + " is out of stock!");
	}
	updateCartPrice();
	updateAddBtnVisibility();
	updateRemoveBtnVisibility();
}

function removeFromCart(productName){
	clearTimeout(timeoutAlertTimer);
	timeoutAlertTimer = setTimeout(displayTimeoutAlert, inactiveTime);
	timeRemaining = inactiveTime;
	clearTimeout(updateTimeRemainingTimer);
	updateTimeRemainingTimer = setTimeout(updateInactiveTime, 1000);
	if(cart.hasOwnProperty(productName)){
		cart[productName]--;
		if(cart[productName] == 0){
			delete cart[productName];
		}
		products[productName]["quantity"]++;
	}else{
		alert("Item does not exist in cart.");
	}
	updateCartPrice();
	updateAddBtnVisibility();
	updateRemoveBtnVisibility();
}

function modalRemoveFromCart(caller){
	var key = getModalItemName(caller);
	removeFromCart(key);
}


function updateCartPrice(){
	var key;
	var cashTotal = 0;
	for(key in cart){
		cashTotal += products[key]["price"] * cart[key];
	}
	document.getElementById('cashTotalText').innerHTML = "$" + cashTotal;	
}

function updateAddBtnVisibility(){
	for(var key in products){
		if(!productInStock(key)){
			document.getElementById(key).classList.add('addBtnHidden');
			if(document.getElementById("modalAddBtn-" + key)) document.getElementById("modalAddBtn-" + key).classList.add('addBtnHidden'); 
			// document.querySelector('#' + key + ':hover ' + '.addBtn').style.visibility = 'hidden';
		}else{
			document.getElementById(key).classList.remove('addBtnHidden');
			if(document.getElementById("modalAddBtn-" + key)) document.getElementById("modalAddBtn-" + key).classList.remove('addBtnHidden'); 
			// document.querySelector('#' + key + ' ' + '.addBtn').style.visibility = 'visible';
		}
	}
}

function updateRemoveBtnVisibility(){
	for(var key in products){
		if(!itemExistsInCart(key)){
			document.getElementById(key).classList.add('removeBtnHidden');
			removeElementById("modalItem-" + key);
			// if(document.getElementById("modalRemoveBtn-" + key)) document.getElementById("modalRemoveBtn-" + key).classList.add('removeBtnHidden'); 
			// document.querySelector('#' + key + ':hover ' + '.addBtn').style.visibility = 'hidden';
		}else{
			document.getElementById(key).classList.remove('removeBtnHidden');
			if(document.getElementById("modalRemoveBtn-" + key)) document.getElementById("modalRemoveBtn-" + key).classList.remove('removeBtnHidden'); 
			// document.querySelector('#' + key + ' ' + '.addBtn').style.visibility = 'visible';
		}
	}
}


function removeElementById(el){
	if(!document.getElementById(el)) {
		console.log("removeElementById(" + el + ") does not exist.");
		return;
	}
	var parent = document.getElementById(el).parentNode;
	parent.removeChild(document.getElementById(el));
}

function productInStock(productName){
	return(products[productName]["quantity"] > 0);
}

function itemExistsInCart(productName){
	return(cart.hasOwnProperty(productName));
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


$(document).ready(function(){ init();  }) 