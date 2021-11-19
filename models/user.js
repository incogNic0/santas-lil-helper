const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  profileName: String

},{timestamps: true});

UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('User', UserSchema);