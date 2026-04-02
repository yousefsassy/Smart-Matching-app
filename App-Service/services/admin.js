const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require('dotenv').config();

const  userModel = require("../models/user");

exports.add = async (userData) => {  // wrap all form fields on one userData object 
  try {
    const newUser = new userModel(userData);
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getall = async () => {
  try {
    const users = await userModel.find({ role: "user" }); // Filter users by role: user
    return users;
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
};

exports.getbyid = async (id) => {
  try {
    const user = await userModel.findOne({ _id: id, role: "user" }); // Find user by id and role: user
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getbyemail = async (email) => {
  try {
    const user = await userModel.findOne({ email, role: "user" }); // Find user by email and role: user
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deletebyid = async (id) => {
  try {
    const deletedUser = await userModel.findOneAndDelete({ _id: id, role: "user" }); // Find and delete user by id and role: user
    return deletedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.deletebyemail = async (email) => {
  try {
    const deletedUser = await userModel.findOneAndDelete({ email, role: "user" }); // Find and delete user by email and role: user
    return deletedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.updatebyid = async (id, newData) => { // wraps all form fields in newData object
  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id, role: "user" },
      newData,
      {
        new: true,
      }
    ); // Find and update user by id and role: user
    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createadmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email address already registered" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new admin instance
    const newAdmin = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      verified: true,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// exports.login = async (email, password) => {
//   const admin = await userModel.findOne({ email, role: "admin" });

//   if (!admin) {
//     throw new Error("Email or password invalid");
//   }

//   const validPass = bcrypt.compareSync(password, admin.password);

//   if (!validPass) {
//     throw new Error("Email or password invalid");
//   }

//     console.log(admin);
//     const secretKey = process.env.JWT_SECRET;
//     const payload = {
//       _id: admin._id,
//       email: admin.email,
//       role: admin.role,
//     };

//     const token = jwt.sign(payload, secretKey);

//     return { mytoken: token };

// };

exports.addProvider = async (data) => {
  const {
    email,
    name,
    phoneNumber,
    password,
    businessAdress,
    businessCategory,
  } = data;

  // Check for missing fields
  if (
    !name ||
    !phoneNumber ||
    !email ||
    !password ||
    !businessAdress ||
    !businessCategory
  ) {
    const error = new Error("Missing required fields");
    error.statusCode = 400;
    throw error;
  }

  // Validate email
  if (!validator.isEmail(email)) {
    const error = new Error("Invalid email address");
    error.statusCode = 400;
    throw error;
  }

  // Check for existing user
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    const error = new Error("Email address already registered");
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Create a new user instance
  const provider = new userModel({
    name,
    phoneNumber,
    email,
    password: hashedPassword,
    verified: true,
    businessCategory,
    businessAdress,
    role: "provider",
  });

  // Save to the database
  return await provider.save();
};


// Crud aal Products

//Crud aal Orders