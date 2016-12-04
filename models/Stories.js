var mongoose = require('mongoose');

var StorySchema = new mongoose.Schema({
  title: String,
  description: String,
  lines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Line' }]
});



mongoose.model('Story', StorySchema);