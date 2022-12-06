// Step 1 - set up express & mongoose
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
  
var fs = require('fs');
var path = require('path');
require('dotenv/config');

// Step 2 - connect to the database. Simple, but not sure what useNewUrlParser and useUnifiedTopology are. 
mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    }
);

// Step 3 - this is the code for ./models.js
// Step 4 - set up EJS. We make our app use EJS, then set it as our "template engine".
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
  
// Set EJS as templating engine 
app.set("view engine", "ejs");

// Step 5 - set up multer for storing uploaded files. Here, we are using the middleware Multer to 
// upload the photo to the server in a folder called `uploads` so we can process it.
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())   // define the crazy filename
    }
});
var upload = multer({ storage: storage }); // set our "storage" to the "multer.diskStorage" obj defined above ^ 

// Step 6 - load the mongoose model for Image. Easy.
var imgModel = require('./model');

// Step 7 - the GET request handler that provides the HTML UI
// GET this images and render them. Otherwise, return an error. 
app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    });
});

// Step 8 - the POST handler for processing the uploaded file. EASY
app.post('/', upload.single('image'), (req, res, next) => {
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),    
            contentType: 'image/png'
        }
        // stuff for the image (the path and file type...EASY)
    }
    imgModel.create(obj, (err, item) => {       // CREATE AN IMAGE
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');      // AFTER NEW IMAGE IS UPLOADED, REDIRECT USER TO '/'. PRETTY NEAT.
        }
    });
});

// Step 9 - configure the server's port. EASY
var port = process.env.PORT || '3000'
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server Success! listening on port', port)
})