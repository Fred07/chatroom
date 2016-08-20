//var cluster = require('cluster');
//var numCPUs = require('os').cpus().length;
//var redis = require('socket.io/node_modules/redis');
//var redis = require('socket.io/node_modules/redis');


	
var App = require('express')();
var port = 8001;
var Http = require('http');
var SocketIO = require('socket.io');

var io;
var http;

var Lobby = require('./lobby');
var lobby = new Lobby();


var d = require('domain').create();
d.on('error', function(er) {
  // The error won't crash the process, but what it does is worse!
  // Though we've prevented abrupt process restarting, we are leaking
  // resources like crazy if this ever happens.
  // This is no better than process.on('uncaughtException')!
  console.log('error, but oh well', er.message);
    
});

// Because req and res were created before this domain existed,
// we need to explicitly add them.
// See the explanation of implicit vs explicit binding below.
//d.add(req);
//d.add(res);

d.run(function() {

	http = Http.createServer(App);
	io = SocketIO(http);
	
	//route
	App.get('/', function(req, res){
		res.sendFile(__dirname + '/home.html');
	});

	App.get('/home.html', function(req, res){
		res.sendFile(__dirname + '/home.html');
	});

	App.get('/chat.html', function(req, res){
		res.sendFile(__dirname + '/chat.html');
	});

	App.get('/dateChat.html', function(req, res){
		res.sendFile(__dirname + '/dateChat.html');
	});
	
	/*App.post('/APIgetMembers', function(req, res){
		//res.send('hello');
		var results = new Array();
		if ( lobby ) {
			results = lobby.getRoomList();
		}
		res.send(JSON.stringify(results));
	});*/
	
	//排程廣播lobby info.
	update_lobby_info();
	
	//socket.io
	io.on('connection', function(socket){

		//socket join room
		socket.on('join', function(name, roomId){

			//broadcast
			// socket.broadcast.to(roomId).emit('chat_message', name + ' 進到了聊天室!');
			
			//create new room
			lobby.addRoom(roomId, function(){
			
				//房間創造後, 排程廣播 room info.
				update_room_info(roomId);
			});
			//add client into room
			lobby.inRoom(roomId).addClient(socket.id, name, function(){

				//將用戶加入房間後, 若是唯一一人，則指定為roomMaster
				if (lobby.inRoom(roomId).total == 1) {
					lobby.inRoom(roomId).setRoomMaster(socket.id);
				}
			});
			
			//socket setting
			socket.join(roomId);
			socket.roomId = roomId;
			
			//log
			console.log( 'ID: ' + socket.id + ', Name: ' + name + ' joined ' + roomId);	//who joined the room.
			console.log('role:' + lobby.inRoom(roomId).getClient(socket.id).role);	//current user role.
		});
		
		//socket disconnect
		socket.on('disconnect', function(){

			//broadcast
			// socket.broadcast.to(socket.roomId).emit('chat_message', lobby.inRoom(socket.roomId).getClient(socket.id).getName() + ' 離開了聊天室!');
			
			//roomMaster exit, transfer roomMaster
			if ( lobby.inRoom(socket.roomId).getClient(socket.id).role == 'roomMaster' ) {
				var nextClient = lobby.inRoom(socket.roomId).findNextClient(socket.id);
				
				if ( nextClient ) {
					lobby.inRoom(socket.roomId).transferRoomMaster(socket.id, nextClient.id);
				}
			}
			
			//remove client
			lobby.inRoom(socket.roomId).removeClient(socket.id);
			
			//check room client number, if no client, close the room.
			if ( lobby.inRoom(socket.roomId).count() == 0 ) {
				delete lobby.closeRoom( socket.roomId );
			}
			
			//log
			console.log('user disconnected: id ' + socket.id);
		});

		//socket chat_message
		socket.on('chat_message', function(msg){
		
			io.in(socket.roomId).emit('chat_message', lobby.inRoom(socket.roomId).getClient(socket.id).getName() + ': ' + msg);
				
			//log
			console.log('message: ' + msg + ' from id ' + socket.id + ' -- role: ' + lobby.inRoom(socket.roomId).getClient(socket.id).role);
		});
	});
	
	//http server
	http.listen(port, function(){
		console.log('listening on *:' + port);
	});
});

//lobby info.
function update_lobby_info() {
	
	setTimeout(function(){
	
		var results = {};
		results['total_room'] = lobby.count();		//room number
		//results['crash'] = lobby.crash();	//crash
		results['room_list'] = lobby.getRoomList();	//room list
	
		io.emit('lobby_info', JSON.stringify(results));
		update_lobby_info();
	}, 10000);
}


//update info until there is no client.
function update_room_info( roomId ) {

	setTimeout(function(){
	
		var r = lobby.inRoom(roomId);	//r 回傳 Room object or undefined object
		if ( typeof r != 'undefined' && r.count() > 0 ) {
		
			var results = {};
			results['total_client'] = r.count();
			results['client_list'] = r.getAllClientNameList();
			results['room_master'] = r.getClient(r.roomMaster).getName();
		
			io.in(roomId).emit('room_info', JSON.stringify(results));
			update_room_info(roomId);
		} else {
			//stop recursive
			return;
		}
	}, 10000);
}