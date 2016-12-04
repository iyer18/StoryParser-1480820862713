var mongoose = require('mongoose');

var LineSchema = new mongoose.Schema({
  text: String,
  user: String,
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' }
});

mongoose.model('Line', CommentSchema);