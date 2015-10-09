var cart = [];
var products = [];

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
}

function myFunction(){
	alert(cart["Box1"]);
}

function addToCart(name) {
	if(cart.hasOwnProperty(name)){
		cart[name]++;
	}else{
		cart[name] = 1;
	}
}

function removeFromCart(name){
	if(cart.hasOwnProperty(name)){
		cart[name]--;
		if(cart[name] == 0){
			delete cart[name];
		}
	}
}



