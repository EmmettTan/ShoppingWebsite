var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/database');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  var kittySchema = mongoose.Schema({
    name: String
  });

  kittySchema.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
  }

  var Kitten = mongoose.model('Kitten', kittySchema);

  var fluffy = new Kitten({ name: 'fluffy' });
  fluffy.speak(); // "Meow name is fluffy"

  var silence = new Kitten({ name: 'Silence' });
  console.log(silence.name); // 'Silence'

  fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
  });

  Kitten.find(function (err, kittens) {
    // if (err) return console.error(err);
    // console.log(kittens);
  });

  var callback = function(err, kittens, something){
    console.log(err);
    console.log(kittens);
    console.log(something);
  }

  Kitten.find({ name: /^fluff/ }, callback);

});