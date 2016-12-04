var mongoose = require('mongoose');

var StorySchema = new mongoose.Schema({
  title: String,
  Description: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Line' }]
});



mongoose.model('Story', StorySchema);