var mongoose = require('mongoose');

var LineSchema = new mongoose.Schema({
  body: String,
  author: String,
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' }
});

mongoose.model('Line', CommentSchema);