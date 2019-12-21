require('dotenv').config()
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
// Load dependencies
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');

var Post = require('./models/post');

const app = express();
app.use(bodyParser.json());

var accessKeyId = process.env.accessKeyId;
var secretAccessKey = process.env.secretAccessKey;

let db_usr = process.env.db_adr
let db_pwd = process.env.db_pwd
let db_adr = process.env.db_adr


db = mongoose.connect(`mongodb+srv://julian:${db_pwd}@cluster0-nd7nf.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(console.log("Success in connecting to Database"))
    .catch(err => { throw err });




// Views in public directory
app.use(express.static('public'));


// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

// Change bucket property to your Space name
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'codeerolabs',
        acl: 'public-read',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(request, file, cb) {
            console.log(file);
            cb(null, file.originalname);
        }
    })
}).array('upload', 10);



// Main, error and success views
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

app.get("/success", function(request, response) {

    // // create a new user
    // var newPost = Post({
    //     location: "location",
    //     description: "description",
    //     url: "url"
    // });

    // // save the user
    // newPost.save(function(err) {
    //     if (err) throw err;

    //     console.log('Post created! + ' + "url");
    // });


    response.sendFile(__dirname + '/public/success.html');
});

app.get("/error", function(request, response) {
    response.sendFile(__dirname + '/public/error.html');
});

app.post('/upload', function(request, response, next) {



    upload(request, response, function(error) {
        if (error) {
            console.log(error);
            return response.redirect("/error");
        }
        request.files.forEach(file => {
            let url_part = "https://codeerolabs.fra1.digitaloceanspaces.com/"
            let url = url_part + file.originalname
            let location = request.body.location
            let description = request.body.description
            let date = request.body.date

            // create a new user
            var newPost = Post({
                date: date,
                location: location,
                description: description,
                url: url,
            });

            // save the user
            newPost.save(function(err) {
                if (err) throw err;

                console.log('Post created! + ' + url);
            });


        })
        console.log('File uploaded successfully.');
        response.redirect("/success");
    });
});



app.listen(3001, function() {
    console.log('Server listening on port 3001.');
});