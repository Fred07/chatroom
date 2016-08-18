var Room = require('./room');

//var msg_greet = '{username} 進到了聊天室';
//var msg_exit = '{username} 離開了聊天室';

var Lobby = function() {
	this.total = 0;
	this.rooms = new Array();
}

Lobby.prototype.count = function() {
	return this.total;
}

Lobby.prototype.getRoomList = function() {
	var results = new Array();
	for ( var roomId in this.rooms ) {
		results.push(roomId);
	}
	return results;
}

Lobby.prototype.addRoom = function( roomId, callback ) {
	if ( typeof this.rooms[roomId] == 'undefined' ) {
		this.rooms[roomId] = new Room(roomId);
		this.total++;
		
		callback();
		return;
	} else {
		//already exist
		return;
	}
}

Lobby.prototype.inRoom = function( roomId ) {
	if (typeof this.rooms[roomId] != 'undefined' ) {
		return this.rooms[roomId];
	} else {
		return this.rooms[roomId];
	}
}

Lobby.prototype.closeRoom = function( roomId ) {
	delete this.rooms[roomId];
	this.total--;
}

/*Lobby.prototype.broacastMsg = function( msg ) {
	
}*/

module.exports = Lobby;