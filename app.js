var express = require('express');
var router  = express.Router();
var app     = express();
var ws      = require('express-ws')(app);
var moment  = require('moment-timezone');
var port    = process.env.PORT || 3000;

var wss     = ws.getWss('/');

var graphqlHTTP     = require('express-graphql');
var { buildSchema } = require('graphql');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
//app.use(express.multipart());
app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/node_modules/admin-lte'));

/////////////////////////////////////////////////////////////////////////
//
// middleware
//
app.use(function (req, res, next) {
  req.timestamp  = moment().unix();
  req.receivedAt = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');
  // https://luckyyowu.tistory.com/346
  console.log(req.receivedAt + ': ', req.method, req.protocol +'://' + req.hostname + req.url);

  return next();
});

//////////////////////////////////////////////////////////////
//
// External module
//
var passport  = require('./lib/passport.js');
var db        = require('./lib/db.js');
var grpc        = require('./lib/grpc.js');

passport.setup(app);
/*
db.connect('mongodb', function(err, result) {
  console.log(result);
});
db.query('SELECT * FROM users', function(err, result) {
  console.log('query: ', result);
  result.forEach(function(data) {
    console.log('select: data.id => ', data.id);
  });
});

// not support in pg
db.query('SELECT * FROM `users` WHERE `id` = ?', ['pushdown99'], function(err, result) {
  console.log(result);
  console.log(result[0]["id"]);
});
*/

//////////////////////////////////////////////////////////////
//
// Express routing
//
app.route('/')
  .get(passport.ensureAuthenticated, function(req, res, next) {
    res.send('Hi');
    /*
  res.render('account', {
    title: 'Account',
    name: req.user.displayName, // 패스포트를 통해 저장된 유저정보
    user: JSON.stringify(req.user)
  });
  */
});

app.route('/login')
  .get(function(req, res, next){
    res.render('login');
  });

app.route('/qr-scanner')
  .get(function(req, res, next){
    res.render('qr-scanner');
  });

app.route('/qr-code')
  .get(function(req, res, next){
    res.render('qr-code');
  });


/////////////////////////////////////////////////////////
// WebSocket

app.route('/ws')
  .get(function(req, res, next){
    res.render('ws');
  });

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    //ws.send('hi');
    wss.clients.forEach(function (c){
      c.send(msg);
    });
    console.log(msg);
  });
  console.log('socket', req.testing);
});

/////////////////////////////////////////////////////////
// GraphQL
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

var root = { hello: () => 'Hello world!' };

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

////////////////////////////////////////////////////////
// gRPC

grpc.chat(5001);

////////////////////////////////////////////////////////
// listener
app.listen(port, function(){
    console.log('Listener: ', 'Example app listening on port ' + port);
});

module.exports = app;