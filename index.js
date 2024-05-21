// Import required modules
const express = require('express'); // Web framework for Node.js
const mongoose = require('mongoose'); // MongoDB object modeling tool
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies
const rateLimit = require('express-rate-limit'); // Middleware to limit repeated requests

// Initialize Express app
const app = express();

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/api_security_demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define User model
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    data: String
}));

// Apply rate limiting to all requests
const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiter middleware to all routes
app.use(apiLimiter);

// Vulnerable endpoint to get user data by ID
app.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Find user by ID
        if (user) {
            res.send(user); // Send user data if found
        } else {
            res.status(404).send('User not found'); // Send 404 if user not found
        }
    } catch (error) {
        res.status(500).send('Server error'); // Send 500 if there's a server error
    }
});

// Endpoint to create a new user
app.post('/user', async (req, res) => {
    try {
        const newUser = new User(req.body); // Create a new User document from request body
        await newUser.save(); // Save the new user to the database
        res.status(201).send(newUser); // Send the newly created user as response
    } catch (error) {
        res.status(400).send('Error creating user'); // Send 400 if there's an error creating the user
    }
});

// Start the server and listen on port 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
