var Client = require( './client' );

var Room = function(id) {

	this.id = id;	//room name
	this.total = 0;	//clients number
	this.clients = new Array();
	this.roomMaster;
}

Room.prototype.count = function() {
	return this.total;
}

Room.prototype.addClient = function( c_id, c_name, callback ) {

	var loginTime = '';
	this.clients[c_id] = new Client(c_id, c_name, this.id, loginTime);
	this.total++;
	
	callback();
	
	return this;
}

Room.prototype.removeClient = function( c_id ){
	if ( typeof this.clients[c_id] != 'undefined' ) {
		delete this.clients[c_id];
		this.total--;
	}
}

Room.prototype.getClient = function( c_id ) {
	if ( typeof this.clients[c_id] != 'undefined' ) {
		return this.clients[c_id];
	}
}

//get a client in sequence
Room.prototype.findNextClient = function(c_id) {
	for ( var key in this.clients ) {
		if ( c_id == key ) {
			//pass
			continue;
		} else {
			//find next!!
			return this.clients[key];
		}
	}
	return false;
}

Room.prototype.getAllClientNameList = function() {

	var results = new Array();
	for (var c_id in this.clients) {
		results.push(this.clients[c_id].getName());
	}
	return results;
}

Room.prototype.setRoomMaster = function( c_id ) {
	this.roomMaster = c_id;
	this.getClient(c_id).setRole('roomMaster');
	
	return this;
}

Room.prototype.transferRoomMaster = function(from_c_id, to_c_id) {
	this.roomMaster = to_c_id;
	this.getClient(from_c_id).setRole('standard');
	this.getClient(to_c_id).setRole('roomMaster');
	
	return this;
}

module.exports = Room;