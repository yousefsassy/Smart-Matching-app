require("dotenv").config();
require('./config/connect');

const express = require("express");
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const serviceRequestRoute = require('./routes/serviceRequestRoutes'); // ← new

const Port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Routes
app.use("/user", userRoute);
app.use("/admin",adminRoute);
app.use("/service-requests", serviceRequestRoute);


// 404 handler
app.use((req, res) => {
    res.status(404).json({ msg: "Route not found" });
});

// Start server
app.listen(Port, (err) => {
    if (err) console.error('Server failed ', err.message);
    console.log(`Server Listening on port ${Port}`);
});
