global.PORT = 3000;
global.MONGODB_PORT = 27017;
global.MONGODB_NAME = 'bing_image_search';
global.COLLECTION_NAME = 'images';
global.mongodb = require('./node_modules/node-mongodb-native/lib/mongodb');
global.PROJECT_ROOT = 'learn-node/Bing-Image-Search-in-node.js/downloads/';

var request = require('request');
var express = require('express');
var jqtpl = require('jqtpl');
var Downloader = require('./node_modules/Downloader.js');

var app = express.createServer();
    app.use(express.bodyParser());
    app.set("view options", { layout: false })
    app.set("view engine", "html");
    app.register(".html", require("jqtpl").express);
    app.set('views', __dirname+'/views');

    app.get('/', function(req, res) {
        res.render('searchForm');
    });

    app.post('/', function(req, res, next){
        request({uri: 'http://api.search.live.net/json.aspx?AppId=3465F86307063B7ADC5D16E6A608A110E437E925&Sources=image&Query='+escape(req.body.search)+'&Image.Count=1&Image.Offset=1000'}, function (error, response, body) {
            var responseJSON = JSON.parse(body);
            imageUrl = responseJSON.SearchResponse.Image.Results[0].MediaUrl;
            if (imageUrl != undefined) {
                var dl = new Downloader.Downloader();
                dl.set_remote_file(imageUrl, __dirname+'/downloads/');
                dl.run(function () {
                    res.redirect('http://localhost:'+PORT+'/fetchImage');
                });
            }
        });
    });

    app.get('/fetchImage', function (req, res, next) {
        new mongodb.Db(MONGODB_NAME, new mongodb.Server('localhost', MONGODB_PORT, {}), {}).open(function (error, client) {
            if (error) throw error;
            var collection = new mongodb.Collection(client, COLLECTION_NAME);
            collection.find({}, {sort : [['_id','desc']]}).toArray(function(err, docs) {
                res.render('fetchImage', {locals : {images : docs, project_root : PROJECT_ROOT}});
            });
        });
    });

    app.listen(PORT);
    console.log('Listening to http://localhost:'+PORT);
