var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var aws = require('aws-sdk');
var request = require('request');
var bodyParser = require('body-parser');

var port = process.env.PORT || 9000;

var db;
var mongoHost = ''

var Twitter = require('node-tweet-stream')
  , t = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    token: '',
    token_secret: ''
  });

aws.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-west-2'
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/mentions/geotagged', function(req, res){
  var collection = db.collection('mentions');
  collection.find().toArray(function(err, items){
    if(err) throw err;

    res.send(items);
  });
});

app.get('/sentiment', function(req, res){
  var coll = db.collection('sentiment');
  coll.find().toArray(function(err, items){
    if(err) throw err;
    res.send(items);
  });
});

app.post('/sentimentComplete', function(req, res){
  var amzHeader = req.headers['x-amz-sns-message-type'];
  if(amzHeader === 'SubscriptionConfirmation'){
    // console.log(req.body.SubscribeURL);
    console.log(req.body);
    var body = JSON.parse(req.body);
    console.log(body.SubscribeURL);
    request(body.SubscribeURL, function (error, response, body) {
  // if (!error && response.statusCode == 200) {
  //   console.log(body) // Show the HTML for the Google homepage.
  // }
    })
    // request.get(req.body.SubscribeURL);
  }
  else{
    var coll = db.collection('sentiment');
    coll.find().toArray(function(err, items){
      if(err) throw err;
      io.emit('sentiment', items);
      res.send('{}');
    });
  }
});

// app.get('/', function(req, res){
//   res.sendFile(__dirname + 'public/index.html');
// });

io.on('connection', function(socket){
  console.log('a user connected!');
});

function handleMention(candidate, party, mention){
  mention.candidate = candidate;
  mention.party = party;
  if(mention.coordinates){
    var collection = db.collection('mentions');
    collection.insert(mention, function(){});
  }

  sendSqsMessage(mention);

  // socket handle
  io.emit('mention', mention);
}

MongoClient.connect(mongoHost, function(err, database){
  if(err) throw err;

  db = database;

  http.listen(port, function(){
    console.log('listening on *' + port);
  });

  t.on('tweet', function (tweet) {

    // console.log('tweet');

    var text = tweet.text;

    var mention = {
      text : text,
      coordinates : tweet.coordinates,
      timestamp : tweet.timestamp_ms
      // issues : []
    };



    if(text.match(/hillary/i) || text.match(/clinton/i)){
      handleMention('clinton', 'dem', mention);
    }
    if(text.match(/bernie/i) || text.match(/sanders/i)){
      handleMention('sanders', 'dem', mention);
    }

    if(text.match(/donald/i) || text.match(/trump/i)){
      handleMention('trump', 'rep', mention);
    }
    if(text.match(/ben/i) || text.match(/carson/i)){
      handleMention('carson', 'rep', mention);
    }
    if(text.match(/jeb/i) || text.match(/bush/i)){
      handleMention('bush', 'rep', mention);
    }
    if(text.match(/marco/i) || text.match(/rubio/i)){
      handleMention('rubio', 'rep', mention);
    }
    if(text.match(/carly/i) || text.match(/fiorina/i)){
      handleMention('fiorina', 'rep', mention);
    }
    if(text.match(/ted/i) || text.match(/cruz/i)){
      handleMention('cruz', 'rep', mention);
    }

  });

  t.on('error', function (err) {
    console.log('Oh no')
  });

  t.trackMultiple([
    'HillaryClinton',
    'BernieSanders',
    'realDonaldTrump',
    'RealBenCarson',
    'JebBush',
    'marcorubio',
    'CarlyFiorina',
    'tedcruz'
  ]);
})

function sendSqsMessage(mention){

  sqs = new aws.SQS();

  var params = {
    MessageBody: JSON.stringify(mention),
    QueueUrl: '',
    DelaySeconds: 0
  };

  sqs.sendMessage(params, function(err, data){
    if(err){
      console.log(err, err.stack);
    }
  })

};

// function sendSentiment(){
//
//   var coll = db.collection('sentiment');
//   coll.find().toArray(function(err, items){
//     io.emit('sentiment', items);
//   }
//
// }
