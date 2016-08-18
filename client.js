var Client = function(id, name, room, time) {

	this.id = id;
	this.name = name;
	this.room = room;
	this.loginTime = time;
	this.role = 'standard';
}

Client.prototype.getName = function(){
	return this.name;
}

Client.prototype.setRole = function( role ) {
	this.role = role;
}

module.exports = Client;