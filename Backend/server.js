require("dotenv").config();

const express = require("express");
const cors = require('cors');
const { connectToDatabase } = require('./config/connect');
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const serviceRequestRoute = require('./routes/serviceRequestRoutes');
const profileRoute = require("./routes/profile");
const availabilityRoute = require("./routes/availabilityRoute");
const jobRoute = require("./routes/jobRoute");
const matchRoute = require("./routes/matchRoute");
const geminiRoute = require('./routes/gemini');

const Port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors({ origin: "*",  credentials: false}));
app.use(express.json());

// Routes
app.use("/user", userRoute);
app.use("/admin",adminRoute);
app.use("/service-requests", serviceRequestRoute);
app.use("/profile", profileRoute);
app.use("/availability", availabilityRoute);
app.use("/jobs", jobRoute);
app.use("/matches", matchRoute);
app.use("/gemini", geminiRoute);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ msg: "Route not found" });
});

// Start server after the database is ready so API requests do not hang.
connectToDatabase()
  .then(() => {
    app.listen(Port, "0.0.0.0", (err) => {
      if (err) console.error("Server failed", err.message);
      console.log(`Server listening on http://0.0.0.0:${Port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
