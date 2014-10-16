var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var Group = require('./group');

//var people = new Array();
var group = new Group();
//route
app.get('/', function(req, res){
  res.send('<h1>index!</h1>');
});
app.get('/chat.html', function(req, res){
	res.sendFile(__dirname + '/chat.html');
});

//socket.io
io.on('connection', function(socket){
	console.log('a user connected: id ' + socket.id);

	//event: join
	socket.on('join', function(userName){
		socket.broadcast.emit('chat_message', userName + ' 進到了聊天室!');

		//set people
		//people[socket.id] = new Array();
		//people[socket.id]['userName'] = userName;
		//people[socket.id]['loginTime'] = new Date();
		
		//test
		group.addPeople(socket.id, userName);
	});

	//event: disconnect
	socket.on('disconnect', function(){
		console.log('user disconnected: id ' + socket.id);
		
		socket.broadcast.emit('chat_message', group.getPeopleName(socket.id) + ' 離開了聊天室!');
		
		group.removePeople(socket.id);
		
	});

	//event: chat_message
	socket.on('chat_message', function(msg){
		console.log('message: ' + msg + ' from id ' + socket.id);

		io.emit('chat_message', group.getPeopleName(socket.id) + ': ' + msg);
	});
});

//http server
http.listen(8001, function(){
	console.log('listening on *:8001');
});