var Client = function(id, name, room, time) {

	this.id = id;
	this.name = name;
	this.room = room;
	this.loginTime = time;
}

Client.prototype.getName = function(){
	return this.name;
}

module.exports = Client;