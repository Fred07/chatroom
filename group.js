var Group = function(){
	this.group_id = 0;
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

Group.prototype.getPeople = function( p_id ) {
	return this.people[p_id];
}

Group.prototype.getPeopleName = function( p_id ) {
	return this.people[p_id]['name'];
}

module.exports = Group;