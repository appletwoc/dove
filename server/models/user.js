var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    firstName: String,
    lastName: String,
    bio: String,
    age: String,
    email: '',
    interests: [String],
    matches: [],
    profile_pic: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);

