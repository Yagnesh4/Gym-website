const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const OnlineSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'First name required'],
		minlength:[3,'Minimun length should be 3 characters']
	},
	
	gender:{
		type: String, 
		required: [true, 'Gender is required']
	},
	age: {
		type: Number,
		required: [true, 'Age is required'],
		maxlength: [2,'Maximum length is 2 digits']
	},
	email: {
		type: String,
		required: [true,'Email is required']
	},
	number: {
		type: Number,
		required: [true,'Contact number is required'],
		minlength: [10,'Minimum length is 10 digits'],
		maxlength: [10,'Maximum length is 10 digits']
	},
	hasPaid: {
		type: Boolean, 
		default: false
	}
	

});



const OnlineChar = new mongoose.model('Online Model', OnlineSchema);
module.exports = OnlineChar;