const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passport = require('passport');
const RegisterChar = require('./models/gym-model');


passport.use(new LocalStrategy({ usernameField: 'email' }, (email,password,done)=>{
  const user = RegisterChar.findOne({email:email}).then(async(user)=>{
    if (user==null) {
      return done(null,false,{message: 'wrong email entered'});
    }
    try{
      if (await bcrypt.compare(password, user.password)) {
        return done(null,user);
      }else{
        return done(null,false,{message: 'wrong password entered'});
      }
    }catch(e){
      return done(e);
    }
  });
}));

passport.serializeUser((user, done)=> { return done(null, user.id)})
passport.deserializeUser((id, done)=> {
  const fetchuser =(id)=>RegisterChar.findById(id);
  fetchuser(id).then((user)=>{
    return done(null, user); 
  });
   
});