const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
app.use('/images', express.static(path.join(__dirname, 'images')));

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

const image = mongoose.model('Image', imageSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    console.log(file);
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
    const newImage = new image({
      filename:req.file.filename,
      path: req.file.path,
    });
    console.log('./images/'+req.file.filename)
    await newImage.save();
    res.send('Image uploaded to MongoDB');
  } catch (err) {
    console.error('Error saving image:', err);
    res.send('Error uploading image');
  }
});
app.get('/images', async (req, res) => {
    try {
      const images = await image.find(); // Retrieve all images from the database
      res.render('images', { images }); // Render the 'images' template with retrieved images
    } catch (err) {
      console.error('Error retrieving images:', err);
      res.status(500).send('Error retrieving images');
    }
  });
  
app.listen(1000, () => {
  console.log('Server started on port 1000');
});