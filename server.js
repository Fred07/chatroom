var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var Group = require('./group');
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
	socket.on('join', function(userName, room){
		console.log(userName + ' joined ');
		socket.join(room);
	
		//broadcast
		socket.broadcast.to(room).emit('chat_message', userName + ' 進到了聊天室!');
		
		//add people
		group.addPeople(socket.id, userName, room);
	});

	//event: disconnect
	socket.on('disconnect', function(){
		console.log('user disconnected: id ' + socket.id);
		
		//broadcast
		socket.broadcast.to(room).emit('chat_message', group.getPeopleName(socket.id) + ' 離開了聊天室!');
		
		//remove people
		group.removePeople(socket.id);
	});

	//event: chat_message
	socket.on('chat_message', function(msg){
		console.log('message: ' + msg + ' from id ' + socket.id);

		io.in(room).emit('chat_message', group.getPeopleName(socket.id) + ': ' + msg);
	});
});

//http server
http.listen(8001, function(){
	console.log('listening on *:8001');
});


update_total_people();
function update_total_people() {

	var results = {};
	results['total'] = group.total;
	results['members'] = group.getAllPeopleName();

	//udpate every 15 sec. (JSON)
	setTimeout(function(){
	
		io.emit('total_people', JSON.stringify(results));
		update_total_people();

	}, 15000);
}