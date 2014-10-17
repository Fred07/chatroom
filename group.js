var Group = function(){
	this.total = 0;
	this.people = new Array();
}

Group.prototype.addPeople = function( p_id, p_name){

	this.people[p_id] = new Array();
	this.people[p_id]['name'] = p_name;
	this.total++;
}

Group.prototype.removePeople = function( p_id ) {
	delete this.people[p_id];
	this.total--;
}

Group.prototype.getAllPeopleName = function() {
	var result = new Array();
	for( var key in this.people) {
		result.push(this.people[key]['name']);
	}
	return result;
}

Group.prototype.getPeopleName = function( p_id ) {
	return this.people[p_id]['name'];
}

/*Group.prototype.inRoom = function(room) {
	
}*/

module.exports = Group;