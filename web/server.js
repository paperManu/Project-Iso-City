// Copyright (C) 2013 Emmanuel Durand
//
// Main server file

var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app).listen(4242);
var io = require('socket.io').listen(server);

/*************/
app.use("/js", express.static(__dirname + "/client/js"));
app.use("/assets", express.static(__dirname + "/client/assets"));
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client/index.html');
});

/*************/
io.sockets.on('connection', function(socket) {
    console.log("Client connected");
});