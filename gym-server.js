var express = require('express');
var app = express();

var bodyparser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
//const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const RegisterChar = require('./models/gym-model');
const OnlineChar = require('./models/gym-online-model');
//const auth = require('./auth');


// setting the Passport
app.use(flash());
app.use(session({
  secret: 'secret',//process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

const pass = require('./passport-config');

// making the user global so that we can apply conditions in ejs for passport
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

app.use(express.urlencoded());
var urlencodedParser = bodyparser.urlencoded({extended: false});
app.use(bodyparser.json()) 

// setting the view engine.
app.set('view engine', 'ejs');

// to use css and images.
app.use(express.static('public'));
//app.use('/css', express.static(__dirname + '/public/css'));
//app.use(express.static(__dirname + '/gym-snippet'));
//app.use(express.static(__dirname, '/public'));

// mongodb connection
mongoose.connect('mongodb://localhost/Gym-Website', {useNewUrlParser: true}, { useUnifiedTopology: true }, { useFindAndModify: false } );
mongoose.set('useFindAndModify', false);
mongoose.connection.once('open', function(){
	console.log('connection has been made !!');
}).on('error', function(error){
	console.log('error is: ', error);
});


app.get('/', checkNotAuthenticated, function(req,res){
	//res.render('gym-main');
	// RegisterChar.find({}, function(err, data){
	// 	res.render('gym-main', {records: data});
	// })
	const useremail = RegisterChar.find(req.body.email);
	res.render('gym-main', {records:useremail});

});

app.get('/gym-main', checkNotAuthenticated, function(req,res){
	res.render('gym-main');//, {'records':useremail});	
	
});

app.get('/gym-aboutus', function(req,res){
	if (req.isAuthenticated()) {
    	res.render('gym-aboutus', { name: req.user.fname });
  	}else{
  		res.render('gym-aboutus');
  	}
});

app.get('/gym-login', checkNotAuthenticated, function(req,res){
	res.render('gym-login');
});

app.post('/gym-login', checkNotAuthenticated, urlencodedParser,	 [
	check('fname', ['Username should be 3+ long','Enter all the fields'])
		.exists()
		.trim()
		.isLength({min: 3}),
	check('lname')
		.trim()
		.exists(),
	check('email', 'Email is not valid')
		.trim()
        .isEmail()
        .normalizeEmail(),
    check('age', 'Age should not be more than 2 digits')
    	.isNumeric()
    	.trim()
		.exists()
		.isLength({max: 2}),
	check('tel', 'Invalid contact number')
		.isNumeric()
    	.trim()
		.isLength({min: 10, max: 10})
		.exists(),
	check('pass', 'Password should be more than 5 digits ')
		.trim()
		.exists()
		.isLength({min: 5}),
	check('optradio', 'Select Gender')
		.exists(),

	], async function(req,res){

	
		const errors = validationResult(req);
    	if(!errors.isEmpty()) {
        	const alert = errors.array()
        	res.render('gym-login', {
            	alert
        	});
    		
    	}
    	try{
		
				var details = new RegisterChar({
					fname: req.body.fname,
					lname: req.body.lname,
					gender: req.body.optradio,
					age: req.body.age,
					email: req.body.email,
					number: req.body.tel,			
					password : req.body.pass
				});

				if (errors.isEmpty()) {

					console.log('Going to model page');
					// const ftoken = await details.generateAuthToken();
					// console.log('Token part ' + ftoken);

					// res.cookie('jwt', ftoken, {
					// expires:new Date(Date.now() + 30000),
					// httpOnly:true
					// });


					const registered = await details.save();
					console.log('Successfully saved to database ');

					// sending mails through node mailer

// 					var transporter = nodemailer.createTransport({
// 						service: 'gmail',
// 						auth: {
// 							user: 'yagnesh.narayanan18@siesgst.ac.in',
// 							pass: 'thongmuk4'
// 						}
// 					});

// 					var mailOptions = {
// 						from: 'yagnesh.narayanan18@siesgst.ac.in',
// 						to: req.body.email,
// 						subject: 'Welcome to Gold Gym!!',
// 						text: `Thank you for registering with Gold Gym. Hope you have an amazing time with us.
// Regards
// Gold Gym`
// 					};

// 					transporter.sendMail(mailOptions, function(error,info){
// 						if (error) {
// 							console.log(error);
// 						}else{
// 							console.log('Email Sent: ' + info.response);
// 						}
// 					});

					//res.render('gym-main');	
					RegisterChar.find({}, function(err, data){
					res.render('gym-register', {records: data});
					})
						
				}
				

			}catch(error){
				res.status(400).send('Invalid details please try again!! ' + error);
				console.log('Invalid details please try again!! ' + error);
			}

	
});

app.get('/gym-register', checkNotAuthenticated, function(req,res){
	res.render('gym-register');
	
});

// app.post('/gym-register', async function(req,res){
// 	try{
// 		const email = req.body.email;
// 		const password = req.body.password;

// 		global.useremail =  await RegisterChar.findOne({email:email});
// 		const isMatch = await bcrypt.compare(password, useremail.password);
// 		// res.send(useremail);
// 		// console.log(useremail);

// 		const ftoken = await useremail.generateAuthToken();
// 		console.log('Token part ' + ftoken);

// 		res.cookie('jwt', ftoken, {
// 			expires:new Date(Date.now() + 600000),
// 			httpOnly:true,
// 		});


// 		if (isMatch || useremail.password === password) {
// 			//res.status(201).render('gym-main');
// 			// RegisterChar.find({}, function(err, data){
// 			// res.render('gym-main', {records: data.fname});
// 			// });
// 			res.render('gym-main-afterlogin', {records: useremail });

// 		}else{
// 			res.status(400).send('Invalid login details');
// 			//console.log("Invalid Details");
// 		}
		
// 	} catch (error) {
// 		res.status(400).send('Invalid login details');
// 	}
	
// })

app.post('/gym-register', checkNotAuthenticated, passport.authenticate('local', {
  failureRedirect: '/gym-register',
  failureFlash: true
}), function(req,res){
	res.redirect('/gym-main-afterlogin');
	//successRedirect: '/gym-main-afterlogin',
});

app.get('/gym-online',  function(req,res){
	res.render('gym-online');
	//console.log('THe cookie is ' + req.cookies.jwt);
});

app.get('/gym-main-afterlogin', function(req,res){
	//console.log(req.user.fname);
	res.render('gym-main-afterlogin', { name: req.user.fname });//{records: useremail});
});

app.get('/gym-equipment', function(req,res){
	if (req.isAuthenticated()) {
    	res.render('gym-equipment', { name: req.user.fname });
  	}else{
  		res.render('gym-equipment');
  	}

	
});

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/gym-main')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/gym-main')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/gym-main-afterlogin');
  }
  next()
}

app.get('/gym-onlineprog', function(req,res){
	res.render('gym-onlineprog');
})

app.post('/gym-onlineprog', urlencodedParser,	 [
	check('name', ['Username should be 3+ long','Enter all the fields'])
		.trim()
		.exists()
		.isLength({min: 3}),
	check('gender', 'Enter gender either M or F')
		// .matches({
	 //      options: [/\b(?:M|F|m|f)\b/],
	 //      errorMessage: "Enter either M or F"})
	 	.isIn(['M','F','m','f'])
		.isLength({min: 1, max: 1})
		.trim()
		.exists(),
	check('age', 'Age should not be more than 2 digits')
		.isNumeric()
    	.trim()
		.exists()
		.isLength({max: 2}),
	check('email', 'Email is not valid')
        .isEmail()
        .trim()
        .normalizeEmail(),
    check('mobile', 'Invalid contact number')
    	.isNumeric()
		.trim()
		.isLength({min: 10, max: 10})
		.exists(),


	], async function(req,res){

		const errors = validationResult(req);
    	if(!errors.isEmpty()) {
        	const alert = errors.array()
        	res.render('gym-onlineprog', {
            	alert
        	});
    		
    	}
		try{
		
				var details = new OnlineChar({
					name: req.body.name,
					gender: req.body.gender,
					age: req.body.age,
					email: req.body.email,
					number: req.body.mobile			
					
				});
				if (errors.isEmpty()) {
					const registered = await details.save();
					console.log('Successfully saved to database ');

					
					res.render('gym-payment', {name: req.body.name});
				}		
				
			}catch(error){
				res.status(400).send('Invalid details please try again!! ' + error);
				console.log('Invalid details please try again!! ' + error);
			}
})

app.get('/gym-online',function(req,res){
	res.render('gym-online');
})

// stripe payment
var Publishable_Key = 'pk_test_51IzjbhSFlsblk0CM36CWyPJyiST944BEPSSiUTKXAbjBvVQPcxQxtqQA1IxYCl0unRpe5dhNvw4cx6ynuuGYmdN300A4qrMSbJ'
var Secret_Key = 'sk_test_51IzjbhSFlsblk0CMrYm2goJC6gYFzgJb61JxYCHUu628msFHt5qUIc0Or0jbTFEMOI6b5d6hzSOWiiH5IE82YLTE00MGgZTb0G'
const stripe = require('stripe')('sk_test_51IzjbhSFlsblk0CMrYm2goJC6gYFzgJb61JxYCHUu628msFHt5qUIc0Or0jbTFEMOI6b5d6hzSOWiiH5IE82YLTE00MGgZTb0G')
// const stripe = Stripe('sk_test_51IzjbhSFlsblk0CMrYm2goJC6gYFzgJb61JxYCHUu628msFHt5qUIc0Or0jbTFEMOI6b5d6hzSOWiiH5IE82YLTE00MGgZTb0G');


app.get('/gym-payment',  function(req, res){ 
    res.render('gym-payment', { key: Publishable_Key }); 
}) 

app.post('/gym-payment',  function(req, res){ 
	//const useremail = OnlineChar.findOne({email:req.body.stripeEmail});
    // Moreover you can take more details from user 
    // like Address, Name, etc from form 
    stripe.customers.create({ 
        email: req.body.stripeEmail, 
        source: req.body.stripeToken, 
        name: 'Yagnesh', 
        address: { 
            line1: 'TC 9/4 Old MES colony', 
            postal_code: '110092', 
            city: 'New Delhi', 
            state: 'Delhi', 
            country: 'India', 
        } 
    }) 
    .then((customer) => { 

        return stripe.charges.create({ 
            amount: 200000,    // Charing Rs 25 
            description: 'Online Program', 
            currency: 'INR', 
            customer: customer.id 
        }); 
    }) 
    .then((charge) => { 
        //res.send("Success") // If no error occurs 
        // To set the hasPaid property to true after payment.
       	if (req.isAuthenticated()) {
       		OnlineChar.findOneAndUpdate({email: req.user.email}, {'$set': {'hasPaid':true}}).exec(function(err){
	        	if (err) {
	        		throw err
	        	}else{
	        		res.render('invoice', {email:req.body.stripeEmail});
	        	}
        	})	
       	}else{
       		OnlineChar.findOneAndUpdate({email: req.body.stripeEmail}, {'$set': {'hasPaid':true}}).exec(function(err){
	        	if (err) {
	        		throw err
	        	}else{
	        		res.render('invoice', {email:req.body.stripeEmail});
	        	}
        	})	
       	}       
    }) 
    .catch((err) => { 
        res.send(err)    // If some error occurs 
    }); 

   
        	
}) 

// stripe ends

// invoice 

app.get('/invoice',  function(req,res){
	res.render('invoice')
})

app.get('/gym-register2', function(req,res){
	res.render('gym-register2')
})

app.post('/gym-register2', passport.authenticate('local', {
  failureRedirect: '/gym-register',
  failureFlash: true
}),  function(req,res){
	//console.log(req.body.email)
	RegisterChar.findOne({email:req.body.email}, function(err,data){
		var register = new OnlineChar({
			name: data.fname,
			gender: data.gender,
			age: data.age,
			email: data.email,
			number: data.number		
		})
		const registered = register.save();
		console.log(register.name);
		//res.redirect({name: register.name},'/gym-payment');
		return res.render('gym-payment', {name: register.name});
	});
})

// Update profile 
app.get('/gym-update', function(req,res){
	res.render('gym-update', { name: req.user.fname });
})
app.post('/gym-update', async function(req,res){
	console.log(req.user.fname);
	await RegisterChar.updateOne({fname: req.user.fname, lname: req.user.lname}, {fname: req.body.firstname, lname: req.body.lastname});
	console.log(req.body.name);

	var email = req.body.email;
	var password = req.body.password;
	var useremail =  await RegisterChar.findOne({email:email});

	if (useremail.email === email) {
		await RegisterChar.updateOne({email:req.user.email}, {email: req.body.email})
	}

	if (await bcrypt.compare(password, useremail.password)) {
		var newpass = await bcrypt.hash(req.body.newpass, 10);
		console.log("new password " + newpass);
		await RegisterChar.updateOne({password: req.user.password}, {password: newpass});
		
	}
	
})
// update ends

// app.get('gym-delete', function(req,res){
// 	res.render(gym)
// })
app.delete('/gym-main-afterlogin', function(req,res){
	RegisterChar.findOneAndDelete({fname:req.user.fname});
	console.log('Account Deleted');
	res.render('gym-main');
})

app.get("/gym-profile", function(req,res){
	res.render('gym-profile', {name: req.user.fname, lname: req.user.lname, email: req.user.email, 
		number: req.user.number, age: req.user.age, gender: req.user.gender
	});
})

app.listen(3000, function(){
	console.log('server is running on port 3000 !!');
});


// https://www.youtube.com/watch?v=uuT54JIpJzc - for stripe payment
// https://www.youtube.com/watch?v=_gikjdpWmcI  - for chat app