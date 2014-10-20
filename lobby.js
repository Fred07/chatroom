var Room = require('./room');

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

Lobby.prototype.addRoom = function( roomId ) {
	if ( typeof this.rooms[roomId] == 'undefined' ) {
		this.rooms[roomId] = new Room(roomId);
		this.total++;
		
		return true;
	} else {
		//already exist
		return false;
	}
}

Lobby.prototype.inRoom = function( roomId ) {
	if (typeof this.rooms[roomId] != 'undefined' ) {
		return this.rooms[roomId];
	} else {
		return false;
	}
}

Lobby.prototype.closeRoom = function( roomId ) {
	delete this.rooms[roomId];
	this.total--;
}

module.exports = Lobby;