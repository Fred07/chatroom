var Client = require( './client' );

var Room = function(id) {

	this.id = id;	//room name
	this.total = 0;	//clients number
	this.clients = new Array();
}

Room.prototype.count = function() {
	return this.total;
}

Room.prototype.addClient = function( c_id, c_name ) {

	var loginTime = '';
	this.clients[c_id] = new Client(c_id, c_name, this.id, loginTime);
	this.total++;
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

Room.prototype.getAllClientNameList = function() {

	var results = new Array();
	for (var c_id in this.clients) {
		results.push(this.clients[c_id].getName());
	}
	return results;
}

module.exports = Room;