var express = require('express');
var bodyparser = require('body-parser');
var app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const RegisterChar = require('./models/gym-model');

const auth = async function(req,res,next){
	try{
		console.log("Going to auth.js page...");
		const token = req.cookies.jwt;
		const verifyUser = jwt.verify(token, 'mynameisyagneshnarayananengineeringstudentcomps');
		console.log(verifyUser );

		const user = await RegisterChar.findOne({_id:verifyUser._id});
		console.log(user);
		next();
	}catch(error){
		res.status(401).send(error);
	}
}

module.exports = auth;