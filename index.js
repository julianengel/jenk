// Setup The .env File
require('dotenv').config()

// Importing Our Modules 

const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Post = require('./models/post');
const app = express();
const compression = require('compression');
var minifyHTML = require('express-minify-html-2');
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const db_usr = process.env.db_adr
const db_pwd = process.env.db_pwd
const db_adr = process.env.db_adr
const app_name = process.env.app_name
const profile_name = process.env.profile_name


// Set Up Yhe App
// set the view engine to ejs
app.set('view engine', 'ejs');
// Use Body Parser
app.use(bodyParser.json());
// Serve Static files from the public directory
app.use(express.static(__dirname + '/public'))
// Use Compression
app.use(compression());
// Use HTML Minifier
app.use(minifyHTML({
    override:      true,
    exception_url: false,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));


// Connect to the Datase
db = mongoose.connect(`mongodb+srv://julian:${db_pwd}@cluster0-nd7nf.mongodb.net/thecoffeeangel?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(console.log("Success in connecting to Database"))
    .catch(err => { throw err });


// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

// Change bucket property to our Space name (bucket/app_name)
// No more then 10 by default.

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: app_name,
        acl: 'public-read',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(request, file, cb) {
            console.log(file);
            cb(null, "posts/" + file.originalname);
        }
    })
}).array('upload', 10);

// Main GET & POST requests

// Home and Upload Page
app.get('/', function(request, response) {
    response.render("pages/index")
});

// Feed Page 
app.get('/feed', function(request, response) {

    // get all the posts - sort by date
    Post.find({}, function(err, posts) {
        if (err) throw err;
        console.log(posts);
        response.render('pages/feed', { app_name: app_name, profile_name: profile_name, posts: posts });
    });

});

// Render Success Page
app.get("/success", function(request, response) {

    response.render('pages/success')
});

// Error Page 

// pass in error eventually

app.get("/error", function(request, response) {
    response.render('pages/error')
});


// Upload POST route to accept upload
app.post('/upload', function(request, response, next) {

// Upload files to AWS
    upload(request, response, function(error) {
        if (error) {
            console.log(error);
            return response.redirect("/error");
        }

        // Preparing Post Data Here 
        let urls = []
        request.files.forEach(file => {
            let url_part = "https://" + app_name + ".fra1.cdn.digitaloceanspaces.com/posts/"
            let url = url_part + file.originalname
            urls.push(url)

        })
        let location = request.body.location
        let description = request.body.description
        let date = request.body.date
        console.log(urls)

        // create a new post
        var newPost = Post({
            date: date,
            location: location,
            description: description,
            urls: urls,
        });

        // save the post 
        newPost.save(function(err) {
            if (err) throw err;

            console.log('Post created! + ' + urls);
        });

        // success, redirect to Status page

        console.log('File uploaded successfully.');
        response.redirect("/success");
    });
});


// Main App, listen

app.listen(3001, function() {
    console.log('Server listening on port 3001.');
});