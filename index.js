const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const fs = require('fs');
const app = express();
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configure AWS SDK
AWS.config.update({
  accessKeyId: '', // Replace with your AWS Access Key ID
  secretAccessKey: '', // Replace with your AWS Secret Access Key
  region: '', // Replace with your AWS region
});

const s3 = new AWS.S3();

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Check MongoDB connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

// Create a Mongoose Schema for images
const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
});

const Image = mongoose.model('Image', imageSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const newImage = new Image({
      filename: req.file.filename,
      path: req.file.path,
    });
    
    await newImage.save();
    
    // Upload the image to S3
    const fileContent = fs.readFileSync(req.file.path);
    const params = {
      Bucket: '', // Replace with your S3 bucket name
      Key: req.file.filename, // File name you want to save as in S3
      Body: fileContent,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading to S3:', err);
        res.send('Error uploading image to S3');
      } else {
        console.log(`Image successfully uploaded to S3 at ${data.Location}`);
        res.send('Image uploaded to MongoDB and S3');
      }
    });

  } catch (err) {
    console.error('Error saving image:', err);
    res.send('Error uploading image');
  }
});

app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.render('images', { images }); 
  } catch (err) {
    console.error('Error retrieving images:', err);
    res.status(500).send('Error retrieving images');
  }
});

app.listen(1000, () => {
  console.log('Server started on port 1000');
});
