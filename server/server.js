var express                 = require("express"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    User                    = require("./models/user"),
    LocalStrategy           = require("passport-local"),
    multer                  = require("multer"),
    path                    = require("path"),
    fs                      = require("fs"),
    imageModel              = require('./models/imageModel');
const { off } = require("process");
    bufferFrom                = require('buffer-from')
    passportLocalMongoose   = require("passport-local-mongoose");
    
var app = express();
const port = 3080;
mongoose.connect('mongodb+srv://ryandoan:ryandb123@dove.rl55z.mongodb.net/Dove?retryWrites=true&w=majority');

app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret:"Test",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})
var upload = multer({storage: storage})
// Creates a user
app.post("/register", function(req, res){
User.register(new User({username:req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, 
                        age: req.body.age, dob: req.body.dob, interests: req.body.interest_select, 
                        email: req.body.email}),req.body.password, function(err, user){
       if(err){
            console.log(err);
            res.redirect("/register");
        } //user stragety
        passport.authenticate("local")(req, res, function(){
            res.redirect("/home"); //once the user sign up
       }); 
    });
});
app.post("/uploadImage", upload.single('myImage'), (req, res) => {
    console.log("connected to upLoadImage form")
    var img = fs.readFileSync(req.file.path);
    //console.log(img)
    //console.log(img.toString('utf8'))
    console.log("file name: ", req.file.filename)
    var encode_img = img.toString('base64');
    var final_img = {
        contentType: req.file.mimetype,
        image: new bufferFrom(encode_img, 'base64')
    };
    var created_image = imageModel.create(final_img, function(err, results){
    //Image.register(new Image({name: img, desc: "profile pic", img: final_img}), function(err, results) {
        if(err){
            console.log(err);
        }
        else{
            console.log(results.img.bufferFrom);
            console.log("Saved to database");
            /*Image.upload(new Image({
                name: req.file.filename,
                desc: "profile pic",
                img: 
                {
                    data: final_img.image,
                    contentType: final_img.contentType
                }}), function(err, image) {
                    console.log("saved in database hopefully")
                });*/
            //results.save()
            res.contentType(final_img.contentType);
            res.send(final_img.image);
        }
    })
})
app.post('/getProfilePic', (req, res) => {
    imageModel.find({}, (err, items) => {
        if(err) {
            console.log(err);
            res.status(500).send('An error has occurred', err)
        }
        else {
            res.render('imagesPage', {items: items})
        }
    });
});
// Authentication, if success it redirects to /home if not, redirects back to login
app.post("/login", passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/login"
}),function(req, res){
    res.send("User is "+ req.user.id);
});

// // Logout button sends back to homepage
// app.get("/logout", function(req, res){
//     req.logout();
//     res.redirect("/");
// });

app.post('/search', function(req, res){
    // We will have a dropdown menu to search for a category
    var inputSearch = req.body.search;
    var searchCategory = req.body.dataSearch;

    // Add more options to search by
    switch(searchCategory){
        case 'username':
            User.find({ username: inputSearch }, function(err, user){
                if(err){
                    console.log('Error')
                }
                else{
                    // user.length checks if we have found a search result
                    if (user.length){
                        res.send(user);
                    }
                    else{
                        res.send('No users found')
                    }
                }
            })
            break;
        case 'dob':
            User.find({ dob: inputSearch }, function(err, user){
                if(err){
                    console.log('Error')
                }
                else{
                    // user.length checks if we have found a search result
                    if (user.length){
                        res.send(user);
                    }
                    else{
                        res.send('No users found')
                    }
                }
            })
            break;
    }
})

app.post('/addLike', function(req, res){
    console.log('Added user to favorites for user id ' + req.user.id);
    User.findOneAndUpdate( {_id: req.user.id } , 
        { $addToSet: {likes: 'The rock' } },
        // { $push: {likes: 'The rock' }}, // Here, push the ID of the user on the card
        function(err, success){
        if(err){
            res.send('Error');
        }
        else{
            console.log('Success');
        }
    })
})

app.post('/addDislike', function(req, res){
    console.log('Added user to dislikes for user id ' + req.user.id);
    User.findOneAndUpdate( {_id: req.user.id } ,
        { $addToSet: {dislikes: 'zac efron' } },
        // { $push: {dislikes: 'zac efron' }}, // Here, push the ID of the user on the card
        function(err, success){
        if(err){
            res.send('Error');
        }
        else{
            console.log('Success');
        }
    })
})

// Checks if logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(port, () =>{
    try{
        console.log('Connected correctly server.');
    }
    catch(err){
        console.log(err.stack);
    }
    finally{
    }

    console.log('Example app listening at http://localhost:3080');
})