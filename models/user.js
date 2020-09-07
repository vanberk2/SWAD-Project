const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'You must enter a username!'] },
  password: { type: Object, required: [true, 'You must enter a password!'] },
  answer: { type: [Number] },
  pastAnswer: { type: Number },
});

module.exports = mongoose.model('user', userSchema);
