var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    firstName: String,
    lastName: String,
    age: '',
    dob: '',
    email: '',
    matches: [],
    likes: [],
    dislikes: [],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);

