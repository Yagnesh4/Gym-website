const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RegisterSchema = new mongoose.Schema({
	fname: {
		type: String,
		required: [true, 'First name required'],
		minlength:[3,'Minimun length should be 3 characters']
	},
	lname: {
		type: String,
		required: [true, 'Last name required']	
	},
	gender:{
		type: String, 
		possibleValues: ['male','female'],
		required: [true,'Select a gender']
	},
	age: {
		type: Number,
		required: [true, 'Age is required'],
		maxlength: [2,'Maximum length is 2 digits']
	},
	number: {
		type: Number,
		required: [true,'Contact number is required'],
		minlength: [10,'Minimum length is 10 digits'],
		maxlength: [10,'Maximum length is 10 digits']
	},
	email: {
		type: String,
		required: [true,'Email is required']
	},
	password: {
		type: String,
		required:true
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}]

	// fname: String,
	// lname: String,
	// gender: String, possibleValues: ['male','female'],
	// age: Number,
	// number: Number,
	// email:String,
	// password:String
});

RegisterSchema.methods.generateAuthToken = async function(){
	try{
		console.log('Currently registered id ' + this._id);
		const gtoken = jwt.sign({_id:this._id.toString()}, 'mynameisyagneshnarayananengineeringstudentcomps');
		this.tokens = this.tokens.concat({token:gtoken});
		await this.save();
		return gtoken;
	}catch(error){
		// res.send('Error part ' + error);
		console.log('Error part ' + error);
	}
}

RegisterSchema.pre("save", async function(next){
	
	if (this.isModified('password')) {
		console.log('the password before hash ' + this.password);
		this.password = await bcrypt.hash(this.password, 10);
		console.log('the password after hash' + this.password);	
	}
	
	next();
});

const RegisterChar = new mongoose.model('Gym Model', RegisterSchema);
module.exports = RegisterChar;