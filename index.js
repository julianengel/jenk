require('dotenv').config()

// Load dependencies
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');

const app = express();

var accessKeyId = process.env.accessKeyId;
var secretAccessKey = process.env.secretAccessKey;


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
        	let url = "https://codeerolabs.fra1.digitaloceanspaces.com/"
            console.log(url+file.originalname)

        })
        console.log('File uploaded successfully.');
        response.redirect("/success");
    });
});



app.listen(3001, function() {
    console.log('Server listening on port 3001.');
});