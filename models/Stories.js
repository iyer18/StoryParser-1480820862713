var mongoose = require('mongoose');

var StorySchema = new mongoose.Schema({
  title: String,
  Description: String,
  lines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Line' }]
});



mongoose.model('Story', StorySchema);