var express = require('express')
var app = express()
var server = app.listen(3000);
var io = require('socket.io').listen(server);

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/carouseldb';
var digikey = require('./node_modules/node_digikey_parser/DigikeyPart.js');
var partinfo = require('./node_modules/node_partnumber_info/PartInfo.js');

var roslib = require('roslib');
var ros = new roslib.Ros({
    url : 'ws://192.168.2.130:11311'
});

ros.on('connection', function() {
    console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
    console.log('Connection to websocket server closed.');
});

var multer= require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(url, function(err, db) {
    if(!err) {
        console.log("We are connected");
    }

    var collection = db.collection('parts', function(err, collection) {});

    app.use(express.static('client'))

    app.post('/upload', upload.single('picture'), function (req, res, next) {
        console.log(req.file);
        const exec = require('child_process').exec;
        exec('zbarimg ' + req.file.path, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                res.send("failure");
                return;
            }
            console.log(`${stdout}`);
                // TODO: Parse barcodes
                var barcode = '';

            res.send("success");
            if (req.body.bagtype == "digikey")
            {
                digikey(barcode, function(data)
                {
                    // TODO: Generate position
                    var position = 0;
                    data.position = position;
                    collection.insert(data);
                });
            }
            else
            {
                partinfo(barcode, function(data)
                {
                    var position = 0;
                    data.position = position;
                    collection.insert(data);
                });

            }
        });
    });

    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('get part', function(number) {
            var doc = collection.findOne({'partNumber': number});
            if (doc)
            {
                socket.emit('get part', doc);
            }
        });
    });

});
