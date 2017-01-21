var express = require('express')
var app = express()

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/carouseldb';


app.use(express.static('client'))


app.listen(3000, function () {
      console.log('Example app listening on port 3000!')
})



