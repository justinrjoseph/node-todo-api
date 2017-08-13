const { mongoose, Schema } = require('../db');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
