var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var q = require('q');
var deferred = q.defer();
var enableResetDatabase = true;

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
    cart: String,
    total: Number
  });

  var Order = mongoose.model('Order', ordersSchema);

  var usersSchema = mongoose.Schema({
    token: String
  });

  var User = mongoose.model('User', usersSchema);


  function resetDatabase(){
    Order.remove({}, function(err){
      console.log('collection Orders reset');
    });

    Product.remove({}, function(err){
        console.log('collection Products reset');
    });

    User.remove({}, function(err){
        console.log('collection users reset');
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
      });
    }

    var user = new User();
    user.token = "user1";
    user.save(function(err, item){
      if(err) return console.error(err);
    })
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
      // console.log(items);
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
        // console.log(productsArr);
        // console.log(productsArr);
        var ordersPass = true;
        for(var key in req.body){
          if(productsArr[key].quantity < req.body[key].quantity ){
            console.log('out of stock, order can\'t go through');
            ordersPass = false;
          }else{
            console.log('we guuci for product: ' + key);
          }
        }


        if(ordersPass){
          var cart = JSON.stringify(req.body);
          var order = new Order();
          order.cart = cart;
          
          //SAVE CART TO ORDERS TABLE
          order.save(function(err){
            if(err){
              console.log(err);
              res.status(400);
              res.sendStatus(err);
            }else{
              res.status(200);
              // res.json({
              //   message: req.body + ' successfully registered!'
              // });
            }
          });


          // var createFindOneAndUpdateClosure = function(query, quantity, index){
          //   console.log('=====================')
          //   var closureQuery = query;
          //   var closureQuantity = quantity;
          //   return function(resolve, reject){
          //     Product.findOneAndUpdate(closureQuery, quantity, function(err, results){
          //       console.log(closureQuery.name);
          //       if(err){
          //         console.log(err)
          //       }else{
          //         resolve(index)
          //       }
          //     });
          //   }
          // }
          var promiseCounts = Object.size(req.body);
          // console.log(promiseCounts);
          var promisesArray = [];

          var currKey = 0;
          var reqBodyIndex = 0;
          //change products quantity in database

          var itemsToProcess = [];
          for (var key in req.body){
            itemsToProcess.push(req.body[key]);
          }
          var numItems = itemsToProcess.length - 1;
          var chain = itemsToProcess.reduce(function (previous, item, currentIndex) {
            return previous.then(function (previousValue) {
                var query = { name: item.key };
                var newQuantity = productsArr[item.key].quantity - req.body[item.key].quantity;
                return Product.findOneAndUpdate(query, {quantity: newQuantity}, function(err, results){
                  console.log(results);
                  if(err){
                    deferred.reject(new Error(err));
                  }else{
                    if(numItems > 0){
                      numItems--;
                    }else{
                      Product.find(function(err, products){
                        if(err) return console.error(err);
                        res.json(products);
                      });
                    }
                    deferred.resolve(item);
                  }
                });
            })
          }, q.resolve(null));

          chain.then(function (lastResult) {
              console.log(lastResult);
          });



          // for(var key in req.body){
          //   var query = { name: key };
          //   var newQuantity = productsArr[key].quantity - req.body[key].quantity;
            

            
          //   if(currKey == 0){
          //     var tempPromise = function(){
          //         var promise = new Promise(function(resolve, reject){
          //           console.log(query);
          //           Product.findOneAndUpdate(query, {quantity: newQuantity}, function(err, results){
          //             if(err){
          //               console.log(err);
          //             }else{
          //               resolve()
          //             }
          //           });
          //         }
          //       )
          //       promisesArray[currKey] = tempPromise;
          //       currKey++;
          //     }

          //   }else{

          //     promisesArray[currKey-1].then(
          //       function(){
                  
          //       var tempPromise = new Promise(
          //           function(resolve, reject){
          //             var newFindFn = createFindOneAndUpdateClosure(query, {quantity: newQuantity}, resolve);
          //           });
          //         promisesArray[currKey] = tempPromise;
          //         currKey++; 
          //       }
          //     ).catch(
          //       function(reason){
          //         console.log("Catch: " + reason);
          //       }
          //     ); 
                          
          //   }         
          // }

                // db.collection('products').find({}, function(err, items){
                //   if(err){
                //     res.end(err);
                //     console.log(err);
                //   }else{
                //     res.end(JSON.stringify(items));
                //   }
                // });

        }else{
          res.sendStatus(400);
        }
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

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};