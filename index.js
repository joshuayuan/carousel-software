var express = require('express')
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty.usbmodem1421', {
      baudRate: 9600
});
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
    url : 'ws://192.168.2.130:9090'
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

var cmd = new roslib.Topic({
    ros : ros,
    name : '/motor_controller/command',
    messageType : 'std_msgs/Float64'
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

    var insertPart = function(data)
    {
        collection.find({'partNumber': data.partNumber}).toArray(function(err, result)
        {
            if (result.length == 0)
            {
                collection.find({}).toArray(function(err, result) {
                    var lastIndex = 0;
                    var empty = [];
                    for (var i = 0; i < result.length; i++)
                    {
                        if (result[i].position > lastIndex + 1)
                        {
                            for (var j = lastIndex + 1; j < result[i].position; j++)
                            {
                                empty.push(j);
                            }
                        }
                        lastIndex = result[i].position;
                    }
                    for (var j = lastIndex + 1; j < 45; j++)
                    {
                        empty.push(j);
                    }
                    data.position = empty[Math.floor(Math.random()*empty.length)];
                    var pos = 1 << Math.floor(data.position / 15);

                    var buf = new Buffer(1);
                    buf[0] = pos;
                    port.write(buf, function(err) {
                        if (err) {
                            return console.log('Error on write: ', err.message);
                        }
                        console.log('position ' + pos + ' written');
                    });
                    var message = new roslib.Message({data: data.position % 15 * 2 * Math.PI / 15});
                    console.log(data.position % 15 * 2 * Math.PI / 15);
                    cmd.publish(message);
                    collection.insert(data);
                });
            }
            else
            {
                var position = result[0].position;
                //TODO

            }
        });
    };

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
            

            var isDigikey = false; 
            var pn = stdout.split(":")[1].trim();
            if (pn.length == 22 && !isNaN(pn)){
               isDigikey = true; 
            }


            if (isDigikey)
            {
                var barcode = stdout.split(":")[1];
                digikey(barcode, function(data)
                {
                    console.log(data);
                    res.send(data);
                    insertPart(data);
                });
            }
            else
            {
                var barcodes = [];
                var barcode = "";
                if (stdout.indexOf("CODE-39:") == -1 ){
                    barcodes = stdout.split("CODE-128:");
                    var maxlength = 0;
                    var code = barcodes[0];
                    for (var i = 0; i < barcodes.length; i++){
                        var bc = barcodes[i].trim();
                        if (bc.length > maxlength){
                            maxlength = bc.length;
                            code = bc;
                        }
                    }
                    barcode = code.substring(code.indexOf("-")+1,code.length);
                    console.log(barcode);
                } else {
                    barcodes = stdout.split("CODE-39:");
                    barcode = barcodes[0];
                    for (var i = 0; i < barcodes.length; i++){
                        var bc = barcodes[i].trim(); 
                        if (bc.indexOf("MULT") > 0){
                            barcode = bc.split("MULT")[0];
                        }
                    }
                }
                if (barcode != ""){
                    partinfo(barcode, function(data)
                            {
                                console.log(data);
                                res.send(data);
                                insertPart(data);
                            });

                } else {
                    res.send("failure");
                }
            }
        });
    });

    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('get part', function(number) {
            var doc = collection.findOne({'partNumber': number}, function(err, doc)
            {
                console.log(number);
                console.log(doc);
                if (doc)
                {
                    socket.emit('get part', doc);
                }
            });
        });
    });


    port.on('open', function() {
        port.write(5, function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
            console.log('message written');
        });
    });

});
