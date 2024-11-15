var express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var app = express();
app.use(cors());

var mongoDB = 'mongodb://localhost:27017/mern';
mongoose.connect(mongoDB)
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.log('MongoDB connection error:', err));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());

const JWT_SECRET = 'password';  

function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(403).send('Access denied');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
}

var Schema = mongoose.Schema; 

var restaurantSchema = new Schema({
  "id": Number,
  "name": String,
  "type": String,
  "location": String,
  "rating": Number,
  "top_food": String
});

var Restaurant = mongoose.model('Restaurant', restaurantSchema);

var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

var User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h' 
    });

    res.status(200).send({ token });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(400).send('Error logging in');
  }
});

app.get('/getUsers', verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Error retrieving users');
  }
});

app.get('/restaurants', async function(req, res) {
  try {
    const data = await Restaurant.find({});
    res.status(200).send(data);
  } catch (err) {
    console.error('Error retrieving restaurants:', err);
    res.status(400).send('Error retrieving restaurants: ' + err.message);
  }
});

app.post('/insertRestaurants', verifyToken, async (req, res) => {
  try {
    const { id, name, type, location, rating, top_food } = req.body;

    const restaurant = new Restaurant({
      id,
      name,
      type,
      location,
      rating,
      top_food
    });

    await restaurant.save();
    res.status(200).send('Restaurant inserted successfully');
  } catch (err) {
    console.error('Error saving restaurant:', err);
    res.status(400).send('Error saving restaurant: ' + err.message);
  }
});

app.put('/updateRestaurant/:id', verifyToken, async (req, res) => {
  try {
    const { name, type, location, rating, top_food } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
      { id: req.params.id },
      { name, type, location, rating, top_food },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }

    res.status(200).send('Restaurant updated successfully');
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(400).send('Error updating restaurant: ' + err.message);
  }
});

app.delete('/deleteRestaurant/:id', verifyToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndDelete({ id: req.params.id });

    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }

    res.status(200).send('Restaurant deleted successfully');
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(400).send('Error deleting restaurant: ' + err.message);
  }
});

app.listen(8001, function(req, res) {
  console.log('Server is running on port 8001');
});