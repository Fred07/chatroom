var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var Lobby = require('./lobby');
var lobby = new Lobby();

//route
app.get('/', function(req, res){
  res.send('<h1>index!</h1>');
});
app.get('/chat.html', function(req, res){
	res.sendFile(__dirname + '/chat.html');
});

//socket.io
io.on('connection', function(socket){

	socket.on('join', function(name, roomId){
	
		console.log( 'ID: ' + socket.id + ', Name: ' + name + ' joined ' + roomId);	//log
		
		//broadcast
		socket.broadcast.to(roomId).emit('chat_message', name + ' 進到了聊天室!');
		
		//object setting
		if ( lobby.addRoom(roomId) ) {
			//register to update room info
			update_room_info(roomId);
		}
		lobby.inRoom(roomId).addClient(socket.id, name);
		
		//socket setting
		socket.join(roomId);
		socket.roomId = roomId;
	});
	
	socket.on('disconnect', function(){
	
		console.log('user disconnected: id ' + socket.id);	//log
		
		//broadcast
		socket.broadcast.to(socket.roomId).emit('chat_message', lobby.inRoom(socket.roomId).getClient(socket.id).getName() + ' 離開了聊天室!');
		
		//remove client
		lobby.inRoom(socket.roomId).removeClient(socket.id);
		
		//check room client number
		if ( lobby.inRoom(socket.roomId).count() == 0 ) {
			delete lobby.closeRoom( socket.roomId );
		}
	});

	socket.on('chat_message', function(msg){
		console.log('message: ' + msg + ' from id ' + socket.id);

		io.in(socket.roomId).emit('chat_message', lobby.inRoom(socket.roomId).getClient(socket.id).getName() + ': ' + msg);
	});
});

//http server
http.listen(8001, function(){
	console.log('listening on *:8001');
});

//lobby info.
update_lobby_info();
function update_lobby_info() {
	
	setTimeout(function(){
	
		var results = {};
		results['total_room'] = lobby.count();		//room number
		results['room_list'] = lobby.getRoomList();	//room list
	
		io.emit('lobby_info', JSON.stringify(results));
		update_lobby_info();
	}, 10000);
}



//update info until there is no client.
function update_room_info( roomId ) {

	setTimeout(function(){
	
		var results = {};
		results['total_client'] = lobby.inRoom(roomId).count();
		results['client_list'] = lobby.inRoom(roomId).getAllClientNameList();
	
		if ( lobby.inRoom(roomId).count() > 0) {
			io.in(roomId).emit('room_info', JSON.stringify(results));
			update_room_info(roomId);
		} else {
			//stop recursive
			return;
		}
	}, 10000);
}