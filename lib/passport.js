'use strict';

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
  },
  setup: function(app) {
    require('dotenv').config();
    var passport  = require('passport');

    app.use(require('express-session')({ secret:'short', resave:false, saveUninitialized:false, cookie:{ secure:false } }));
    app.use(passport.initialize());
    app.use(passport.session());    
    
    var mylocal   = require(process.env.LOCAL_STRATEGY).Strategy;
    var openbank  = require(process.env.OPENBANK_STRATEGY).Strategy;
    var facebook  = require(process.env.FACEBOOK_STRATEGY).Strategy;
    var microsoft = require(process.env.MICROSOFT_STRATEGY).Strategy;
    var google    = require(process.env.GOOGLE_STRATEGY).Strategy;
    var naver     = require(process.env.NAVER_STRATEGY).Strategy;
    var kakao     = require(process.env.KAKAO_STRATEGY).Strategy;

    passport.use(new mylocal({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true 
    }, function (req, username, password, done) {
      if(username === 'user001' && password === 'password'){
        console.log('login-success', username, password);
        return done(null, {
          'user_id': username,
        });
      }else{
        console.log('login-fail', username, password);
        return done(false, null)
      }
    }));

    passport.use(new openbank({
      authorizationURL: 'https://testapi.open-platform.or.kr/oauth/2.0/authorize2',
      tokenURL:         'https://testapi.open-platform.or.kr/oauth/2.0/token',
      clientID:         process.env.OPENBANK_CLIENT_ID,
      clientSecret:     process.env.OPENBANK__CLIENT_SECRET,
      callbackURL:      "http://localhost:3000/auth/openbank/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    ));

    passport.use(new facebook({
      clientID:     process.env.FACEBOOK_CLIENT_ID, 
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL:  process.env.FACEBOOK_CALLBACK_URL
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    ));

    passport.use(new microsoft({
      clientID:     process.env.MICROSOFT_CLIENT_ID, 
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL:  process.env.MICROSOFT_CALLBACK_URL
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    ));

    passport.use(new google({
      clientID:     process.env.GOOGLE_CLIENT_ID, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          // To keep the example simple, the user's Google profile is returned to
          // represent the logged-in user.  In a typical application, you would want
          // to associate the Google account with a user record in your database,
          // and return that user instead.
          return done(null, profile);
        });
      }
    ));

    passport.use(new naver({
      clientID:     process.env.NAVER_CLIENT_ID, 
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL:  process.env.NAVER_CALLBACK_URL
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    ));

    passport.use(new kakao({
      clientID:     process.env.KAKAO_CLIENT_ID, 
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL:  process.env.KAKAO_CALLBACK_URL
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    ));

    passport.serializeUser(function(user, done) {
      console.log('serializeUser', user);
      done(null, user);
    });
    
    passport.deserializeUser(function(obj, done) {
      console.log('deserializeUser', obj);
      done(null, obj);
    });
    
    var middleware = function (req, res, next) {
      console.log('middleware', req.params.name);
      passport.authenticate('facebook');
      console.log('next');
      next();
    }

    app.post('/auth/local', passport.authenticate('local', { failureRedirect: '/login' }), function (req, res) { res.redirect('/'); });

    app.get('/auth/openbank', passport.authenticate('oauth2', {scope: 'login inquiry transfer', auth_type: 0}), function(req, res){});
    app.get('/auth/openbank/callback', passport.authenticate('oauth2', { failureRedirect: '/login' }), function(req, res) { console.log(req.query); res.redirect('/'); }); 

    app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){});
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) { console.log(req.query); res.redirect('/'); }); 

    app.get('/auth/google',   passport.authenticate('google', {scope: ['openid', 'email', 'profile']}), function(req, res){});
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) { console.log(req.query); res.redirect('/'); }); 

    app.get('/auth/microsoft', passport.authenticate('microsoft', {scope: ['openid', 'email']}), function(req, res){});
    app.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/login' }), function(req, res) { console.log(req.query); res.redirect('/'); }); 

    app.get('/auth/naver',    passport.authenticate('naver'), function(req, res){});
    app.get('/auth/naver/callback', passport.authenticate('naver', { failureRedirect: '/login' }), function(req, res) { console.log(req.query); res.redirect('/'); }); 

    app.get('/auth/kakao',    passport.authenticate('kakao'), function(req, res){});
    app.get('/auth/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/login' }), function(req, res) { console.log(req.query); res.redirect('/'); }); 

    app.get('/logout', function(req, res) { req.logout(); res.redirect('/login'); });  
  }
}
