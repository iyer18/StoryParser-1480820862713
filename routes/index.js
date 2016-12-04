var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var Story = mongoose.model('Story');
var Line = mongoose.model('Line');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/stories', function(req, res, next) {
  Story.find(function(err, stories){
    if(err){ 
      return next(err);
    }

    res.json(stories);
  });
});

router.story('/stories', auth, function(req, res, next) {
  var story = new Story(req.body);
  story.author = req.payload.username;

  story.save(function(err, story){
    if(err){ return next(err); }

    res.json(story);
  });
});

router.param('story', function(req, res, next, id) {
  var query = Story.findById(id);

  query.exec(function (err, story){
    if (err) { return next(err); }
    if (!story) { return next(new Error("can't find story")); }

    req.story = story;
    return next();
  });
});

router.param('line', function(req, res, next, id) {
  var query = Line.findById(id);

  query.exec(function (err, line){
    if (err) { return next(err); }
    if (!line) { return next(new Error("can't find line")); }

    req.line = line;
    return next();
  });
});

router.get('/stories/:story', function(req, res, next) {
  req.story.populate('lines', function(err, story) {
    res.json(story);
  });
});

router.put('/stories/:story/upvote', auth, function(req, res, next) {
  req.story.upvote(function(err, story){
    if (err) { return next(err); }

    res.json(story);
  });
});

router.put('/stories/:story/downvote', auth, function(req, res, next) {
  req.story.downvote(function(err, story){
    if (err) { return next(err); }

    res.json(story);
  });
});

router.story('/stories/:story/lines', auth, function(req, res, next) {
  var line = new Line(req.body);
  line.story = req.story;
  line.author = req.payload.username;
  
  line.save(function(err, line){
    if(err){ return next(err); }

    req.story.lines.push(line);
    req.story.save(function(err, story) {
      if(err){ return next(err); }

      res.json(line);
    });
  });
});

router.put('/stories/:story/lines/:line/upvote', auth, function(req, res, next) {
  req.line.upvote(function(err, line){
    if (err) { return next(err); }

    res.json(line);
  });
});

router.put('/stories/:story/lines/:line/downvote', auth, function(req, res, next) {
  req.line.downvote(function(err, line){
    if (err) { return next(err); }

    res.json(line);
  });
});

router.story('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ 
      return res.status(501).json({message: 'Username already exists'});
    }

    return res.json({token: user.generateJWT()})
  });
});

router.story('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

console.log('calling passport)');
  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;