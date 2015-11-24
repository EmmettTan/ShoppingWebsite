var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var enableResetDatabase = false;

var app = express();
mongoose.connect('mongodb://localhost:27017/database');

var maxTries = 5;

var url = 'mongodb://localhost:27017/database';


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  var productsSchema = mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
    url: String
  });

  var Product = mongoose.model('Product', productsSchema);

  //clear the database for initialization
  

  var ordersSchema = mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number
  });

  var Orders = mongoose.model('Order', ordersSchema);

  function resetDatabase(){
    Orders.remove({}, function(err){
      console.log('collection removed');
    });

    Product.remove({}, function(err){
        console.log('collection removed');
    });

    var initProductsStr = {
      "KeyboardCombo":{ "price":34,"quantity":8,"url":"https://cpen400a.herokuapp.com/images/KeyboardCombo.png"},
      "Mice":{ "price":5,"quantity":6,"url":"https://cpen400a.herokuapp.com/images/Mice.png"},
      "PC1":{"price":328,"quantity":7,"url":"https://cpen400a.herokuapp.com/images/PC1.png"},
      "PC2":{"price":356,"quantity":8,"url":"https://cpen400a.herokuapp.com/images/PC2.png"},
      "PC3":{"price":369,"quantity":7,"url":"https://cpen400a.herokuapp.com/images/PC3.png"},
      "Tent":{"price":38,"quantity":8,"url":"https://cpen400a.herokuapp.com/images/Tent.png"},
      "Box1":{"price":7,"quantity":5,"url":"https://cpen400a.herokuapp.com/images/Box1.png"},
      "Box2":{"price":7,"quantity":9,"url":"https://cpen400a.herokuapp.com/images/Box2.png"},
      "Clothes1":{"price":28,"quantity":10,"url":"https://cpen400a.herokuapp.com/images/Clothes1.png"},
      "Clothes2":{"price":24,"quantity":10,"url":"https://cpen400a.herokuapp.com/images/Clothes2.png"},
      "Jeans":{"price":40,"quantity":8,"url":"https://cpen400a.herokuapp.com/images/Jeans.png"},
      "Keyboard":{"price":21,"quantity":7,"url":"https://cpen400a.herokuapp.com/images/Keyboard.png"}
    }

    for(var key in initProductsStr){
      var item = new Product(initProductsStr[key]);
      item.name = key;
      item.save(function(err, item){
        if(err) return console.error(err);
        console.log(item);
      });
    }
  }

  if(enableResetDatabase){
    resetDatabase();
  }

  app.use(bodyParser.json());

  app.set('port', (process.env.PORT || 5000));



  app.get('/products', function(request, response) {

    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    Product.find(function(err, products){
      if(err) return console.error(err);
      response.json(products);
    });
  })

  //TODO: CHECKOUT 
  //  TAKE CART PRODUCT AND STORE AS ORDERS VARIABLE
  //  
  app.post('/checkout', function(req, res){
    Product.find(function(err, products){
      var dbProducts = products;
      
    });

    var products;
    var asdf = [];
    // for(var name in req.body){
    //   var newObject = {};
    //   newObject.name = name;
    //   asdf.push(newObject);
    // }
    // console.log(asdf);
    db.collection('products').find({}).toArray(function(err, items){
      // console.log("items : " + items);
      if(err){
        console.log(err);
        res.end(err);
        return;
      }else{
        //turn database query result into associative array
        var productsArr = [];
        for(var key in items){
          var name = items[key].name;
          productsArr[name] = items[key];
        }
        console.log(productsArr);
        res.json(items);
      }
    });
    // console.log("products \n" + products);
    
  })

  app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
  });


  // Product.find(function(err, products){
  //   if(err) return console.error(err);
  //   // console.log(products);
  // });

});