const express = require("express");

require('dotenv').config();

const router = express.Router();

const upload=require('../middlewares/cvUpload');

const userController = require("../controllers/user");

router.post("/login", userController.login);

router.post("/signup", userController.signup);


router.post("/forget-password", userController.forgetPassword);

router.post("/reset-password", userController.resetPassword);

//router.get("/logout");

module.exports = router;
