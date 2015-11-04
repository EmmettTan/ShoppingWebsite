var cart = [];
var products = [];
var cashTotal = 0;
var inactiveIntervalTimer;
var inactiveTime = 3000;
var cartTimeout = 3000;
var enableTimeouts = false;
var xhrTimeout = 5000;
var productsLoaded = false;
var remoteServer = "https://cpen400a.herokuapp.com/products";
var inflight = [];
var cartOverlayUrl = "images/cart.png";

//angularjs module init
var mainModule = angular.module('mainModule', []);
mainModule.controller('cart-products-controller', ['$scope', '$interval', function($scope, $interval){
	$scope.inactiveTimeLeft = inactiveTime/1000;
	
	$scope.cart = [];
	$scope.products = [];
	$scope.cashTotal = 0;
	var stop; //we assign the countdownFn interval to stop

	//TODO, REMOVE THIS AND REPLACE WITH XMLHTTPREQUEST 
	$scope.products["Box1"] = {};
	$scope.products["Box2"] = {};
	$scope.products["Clothes1"] = {};
	$scope.products["Clothes2"] = {};
	$scope.products["Jeans"] = {};
	$scope.products["Keyboard"] = {};
	$scope.products["KeyboardCombo"] = {};
	$scope.products["Mice"] = {};
	$scope.products["PC1"] = {};
	$scope.products["PC2"] = {};
	$scope.products["PC3"] = {};
	$scope.products["Tent"] = {};

	$scope.products["Box1"]["quantity"] = 1;
	$scope.products["Box1"]["price"] = 10;
	$scope.products["Box1"]["url"] = "images/Box1_$10.png";


	$scope.products["Box2"]["quantity"] = 5;
	$scope.products["Box2"]["price"] = 20;
	$scope.products["Box2"]["url"] = "images/Box2_$20.png";

	$scope.products["Clothes1"]["quantity"] = 5;
	$scope.products["Clothes1"]["price"] = 20;
	$scope.products["Clothes1"]["url"] = "images/Clothes1_$20.png";

	$scope.products["Clothes2"]["quantity"] = 5;
	$scope.products["Clothes2"]["price"] = 30;
	$scope.products["Clothes2"]["url"] = "images/Clothes2_$30.png";

	$scope.products["Jeans"]["quantity"] = 5;
	$scope.products["Jeans"]["price"] = 50;
	$scope.products["Jeans"]["url"] = "images/Jeans_$50.png";

	$scope.products["Keyboard"]["quantity"] = 5;
	$scope.products["Keyboard"]["price"] = 20;
	$scope.products["Keyboard"]["url"] = "images/Keyboard_$20.png";

	$scope.products["KeyboardCombo"]["quantity"] = 5;
	$scope.products["KeyboardCombo"]["price"] = 40;
	$scope.products["KeyboardCombo"]["url"] = "images/KeyboardCombo_$40.png";

	$scope.products["Mice"]["quantity"] = 5;
	$scope.products["Mice"]["price"] = 20;
	$scope.products["Mice"]["url"] = "images/Mice_$20.png";

	$scope.products["PC1"]["quantity"] = 5;
	$scope.products["PC1"]["price"] = 350;
	$scope.products["PC1"]["url"] = "images/PC1_$350.png";

	$scope.products["PC2"]["quantity"] = 5;
	$scope.products["PC2"]["price"] = 400;
	$scope.products["PC2"]["url"] = "images/PC2_$400.png";

	$scope.products["PC3"]["quantity"] = 5;
	$scope.products["PC3"]["price"] = 300;
	$scope.products["PC3"]["url"] = "images/PC3_$300.png";

	$scope.products["Tent"]["quantity"] = 5;
	$scope.products["Tent"]["price"] = 100;
	$scope.products["Tent"]["url"] = "images/Tent_$100.png";

	//

	//Cart and product functions
	$scope.addToCart = function(productName) {
		$scope.resetCountdown();

		if ($scope.productInStock(productName)){
			if($scope.cart.hasOwnProperty(productName)){
				$scope.cart[productName]++;
				//updateModalWindowQty(productName); TODO: REPLACE WITH TWO WAY BINDING
			}else{
				$scope.cart[productName] = 1;
				//addCartItemToModalWindow(productName); TODO: 2-WAY-BINDING
			}
			$scope.products[productName]["quantity"]--;
		}else{
			alert(productName + " is out of stock!");
		}
		$scope.updateCartPrice();
		updateAddBtnVisibility();
		updateRemoveBtnVisibility();
	}

	$scope.removeFromCart = function(productName){
		$scope.resetCountdown();

		if(cart.hasOwnProperty(productName)){
			$scope.cart[productName]--;
			updateModalWindowQty(productName);
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

	$scope.trueshit = function(test){
		console.log(test);
		return false;
	}

	$scope.productInStock = function(productName){
		return($scope.products[productName]["quantity"] > 0);
	}

	$scope.itemExistsInCart = function(productName){
		return(cart.hasOwnProperty(productName));
	}

	$scope.updateCartPrice = function(){
		var key;
		$scope.cashTotal = 0;
		for(key in $scope.cart){
			$scope.cashTotal += $scope.products[key]["price"] * $scope.cart[key];
		}
		//TODO: REPLACE WITH 2WAY BINDING
		// document.getElementById('cashTotalText').innerHTML = "$" + cashTotal;	
		// document.getElementById('modalCartPriceTotalText').textContent = "$" + cashTotal;
	}


	//Inactive Timeout Functions
	$scope.startCountdown = function(){
		if(angular.isDefined(stop))return; //don't start if already started
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


}]);


function init(){
	var xmlProductReq = requestCount(remoteServer, inflight);
	xmlProductReq();
}

var requestCount = function(msg, xhrBuffer){
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
					//TODO UNCOMMENT products = JSON.parse(xhr.responseText);
					console.log(products);
					productsReadyEvent();
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

//run this once products have been initialized
function productsReadyEvent(){
	var ngScope = angular.element(document.getElementById("ngWrapper")).scope();
	ngScope.startCountdown();
	document.getElementById('cashTotalText').innerHTML = "$" + cashTotal;
	//TODO UNCOMMENT
	//if(!productsLoaded) addAllProductsToShoppingMenu();
	//updateAddBtnVisibility();
	//updateRemoveBtnVisibility();
	updateCartPrice();
}


function testFunction(){

	var resNode = createProductItem("Box1");



	addItemToCartModal(resNode);
}


//functions to add an item to the modal window after user adds an item to cart
function addCartItemToModalWindow(item){
	document.getElementById("cartModalForm").appendChild(createCartItem(item));
}

function createCartItem(item){
	var resNode;

	var imgNode = createModalImgWithItemKey(item);
	var imgNodeDiv = createDivWithClass("col-xs-3");
	imgNodeDiv.appendChild(imgNode);

	var addNode = createModalAddToCartButtonForItem(item);
	var addNodeDiv = createDivWithClass("col-xs-2");
	addNodeDiv.appendChild(addNode);

	var removeNode = createModalRemoveFromCartButtonForItem(item);
	var removeNodeDiv = createDivWithClass("col-xs-2");
	removeNodeDiv.appendChild(removeNode);

	var qtyNode = document.createElement("span");
	qtyNode.id = "modalItemQty-" + item;
	qtyNode.textContent = 1;
	var qtyNodeDiv = createDivWithClass("col-xs-5");
	addClassToNode("modalCartQuantityText", qtyNodeDiv);
	qtyNodeDiv.textContent = "Quantity: ";

	var priceNode = document.createElement("span");
	priceNode.id = "modalItemPrice-" + item;
	priceNode.textContent = "Price: " + products[item]["price"];

	var itemInfoChangesNode = document.createElement("span");
	itemInfoChangesNode.id = "modalItemUpdates-" + item;
	itemInfoChangesNode.textContent = "TODO";
	var br = document.createElement("br");
	qtyNodeDiv.appendChild(qtyNode);
	qtyNodeDiv.appendChild(br);
	br = document.createElement("br");
	qtyNodeDiv.appendChild(priceNode);
	qtyNodeDiv.appendChild(br);
	qtyNodeDiv.appendChild(itemInfoChangesNode);


	resNode = createDivWithId("modalItem-" + item);
	addClassToNode("row", resNode);
	addClassToNode("cartItem", resNode);

	resNode.appendChild(imgNodeDiv);
	resNode.appendChild(qtyNodeDiv);
	resNode.appendChild(addNodeDiv);
	resNode.appendChild(removeNodeDiv);

	return resNode;
}

function createModalAddToCartButtonForItem(item){
	var resNode = createButtonWithId("modalAddBtn-" + item);
	addClassToNode("modalAddBtn", resNode);
	addClassToNode("btn-success", resNode);
	addClassToNode("btn", resNode);
	resNode.textContent="+";
	resNode.onclick = createAddToCartFnForItem(item);
	return resNode;
}

function createModalRemoveFromCartButtonForItem(item){
	var resNode = createButtonWithId("modalAddBtn-" + item);
	addClassToNode("modalRemoveBtn", resNode);
	addClassToNode("btn-danger", resNode);
	addClassToNode("btn", resNode);
	resNode.textContent="-";
	resNode.onclick = createRemoveFromCartFnForItem(item);
	return resNode;
}

function addAllProductsToShoppingMenu(){
	var itemCount = 0;
	var productList = document.getElementById("productList");
	var productRow = createDivWithClass("row");
	addClassToNode("productRow", productRow);
	for(var key in products){
		var productItem = createProductItem(key);
		productRow.appendChild(productItem);
		if(itemCount != 0 && itemCount/3 == 0){
			productList.appendChild(productRow);
			productRow = createDivWithClass("row");
			addClassToNode("productRow", productRow);			
		}
	}
	productList.appendChild(productRow);
}

function createProductItem(item){
	var resNode;

	var imgNode = createImgTagWithUrl(products[item]["url"]);
	var imgNodeDiv = createDivWithClass("productImg");
	imgNodeDiv.appendChild(imgNode);

	var addNode = createProductAddToCartButtonForItem(item);
	var addNodeDiv = createDivWithClass("addBtn");
	addNodeDiv.appendChild(addNode);

	var removeNode = createProductRemoveFromCartButtonForItem(item);
	var removeNodeDiv = createDivWithClass("removeBtn");
	removeNodeDiv.appendChild(removeNode);

	var cartOverlayImg = createImgTagWithUrl(cartOverlayUrl);
	var cartOverlayDiv = createDivWithClass("cartOverlay");
	cartOverlayDiv.appendChild(cartOverlayImg);

	var img_container = createDivWithId(item);
	addClassToNode("img-container", img_container);

	var priceLabelDiv = createDivWithClass("priceLabel");
	priceLabelDiv.textContent = "$" + products[item]["price"];


	var itemNameDiv = createDivWithClass("itemName");
	itemNameDiv.textContent = item;


	img_container.appendChild(imgNodeDiv);
	img_container.appendChild(cartOverlayDiv);
	img_container.appendChild(addNodeDiv);
	img_container.appendChild(removeNodeDiv);

	resNode = createDivWithClass("product");
	addClassToNode("col-xs-4", resNode);

	resNode.appendChild(img_container);
	resNode.appendChild(priceLabelDiv);
	resNode.appendChild(itemNameDiv);

	return resNode;
}

function createProductAddToCartButtonForItem(item){
	var resNode = document.createElement("button");
	addClassToNode("btn-success", resNode);
	addClassToNode("btn", resNode);
	resNode.textContent="Add";
	resNode.onclick = createAddToCartFnForItem(item);
	resNode.type = "button";
	return resNode;
}

function createProductRemoveFromCartButtonForItem(item){
	var resNode = document.createElement("button");
	addClassToNode("btn-danger", resNode);
	addClassToNode("btn", resNode);
	resNode.textContent="Remove";
	resNode.onclick = createRemoveFromCartFnForItem(item);
	resNode.type = "button";
	return resNode;
}

function addClassToNode(newClass, newNode){
	newNode.classList.add(newClass);
}

function createDivWithId(nodeId){
	var divNode = document.createElement("div");
	divNode.id = nodeId;
	return divNode;
}

function createDivWithClass(className){
	var divNode = document.createElement("div");
	divNode.classList.add(className);
	return divNode;
}

function createModalImgWithItemKey(key){
	var resNode = document.createElement("img");
	addClassToNode("modalItemImg", resNode);
	resNode.src = products[key]["url"];
	resNode.alt = products[key]["url"];
	return resNode;
}

//create a shopping menu item img
function createImgTagWithUrl(url){
	var resNode = document.createElement("img");
	resNode.src = url;
	resNode.alt = url;
	return resNode;
}

function createButtonWithId(buttonId){
	var buttonNode = document.createElement("button");
	buttonNode.type="button";
	buttonNode.id = buttonId;
	return buttonNode;
}

function addItemToCartModal(node){

	document.getElementById("test123").appendChild(node);
}

function addToCart(productName) {
	if (productInStock(productName)){
		if(cart.hasOwnProperty(productName)){
			cart[productName]++;
			updateModalWindowQty(productName);
		}else{
			cart[productName] = 1;
			addCartItemToModalWindow(productName);
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
	if(cart.hasOwnProperty(productName)){
		cart[productName]--;
		updateModalWindowQty(productName);
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

function updateModalWindowQty(productName){
	document.getElementById("modalItemQty-" + productName).textContent = cart[productName];
}

function createAddToCartFnForItem(item){
	var closure_item = item;
	return function(){
		addToCart(item);
	}
}

function createRemoveFromCartFnForItem(item){
	var closure_item = item;
	return function(){
		removeFromCart(item);
	}
}


function updateCartPrice(){
	var key;
	var cashTotal = 0;
	for(key in cart){
		cashTotal += products[key]["price"] * cart[key];
	}
	document.getElementById('cashTotalText').innerHTML = "$" + cashTotal;	
	document.getElementById('modalCartPriceTotalText').textContent = "$" + cashTotal;
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
		//console.log("removeElementById(" + el + ") does not exist.");
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




function cartAlert(productName){
	alert(productName + ": " + cart[productName]);
}


$(document).ready(function(){ init();  }) 