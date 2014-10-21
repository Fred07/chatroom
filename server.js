var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
//var redis = require('socket.io/node_modules/redis');

if (cluster.isMaster) {

	/*for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }*/
	cluster.fork();
	cluster.fork();
	
	cluster.on('disconnect', function(worker) {
		console.error('disconnect!');
		cluster.fork();
	});

} else {
	
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
	  
	  try {
        // make sure we close down within 30 seconds
        var killtimer = setTimeout(function() {
          process.exit(1);
        }, 30000);
        // But don't keep the process open just for that!
        killtimer.unref();

        // stop taking new requests.
        server.close();

        // Let the master know we're dead.  This will trigger a
        // 'disconnect' in the cluster master, and then it will fork
        // a new worker.
        cluster.worker.disconnect();

        // try to send an error to the request that triggered the problem
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Oops, there was a problem!\n');
      } catch (er2) {
        // oh well, not much we can do at this point.
        console.error('Error sending 500!', er2.stack);
      }
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
		
		//routing task, keep broadcast to socket
		update_lobby_info();
		
		//socket.io
		io.on('connection', function(socket){

			socket.on('join', function(name, roomId){
			
				console.log( 'ID: ' + socket.id + ', Name: ' + name + ' joined ' + roomId);	//log
				
				//broadcast
				socket.broadcast.to(roomId).emit('chat_message', name + ' 進到了聊天室!');
				
				//object setting
				lobby.addRoom(roomId, function(){
				
					//register update room info.
					update_room_info(roomId)
				});
					
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
		http.listen(port, function(){
			console.log('listening on *:' + port);
		});
	});
	
}

//lobby info.
function update_lobby_info() {
	
	setTimeout(function(){
	
		var results = {};
		results['total_room'] = lobby.count();		//room number
		//results['test'] = lobby.hello();	//crash server
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
		
			io.in(roomId).emit('room_info', JSON.stringify(results));
			update_room_info(roomId);
		} else {
			//stop recursive
			return;
		}
	}, 10000);
}