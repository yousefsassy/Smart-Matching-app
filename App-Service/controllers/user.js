const userService = require("../services/user");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await userService.login(email, password);
    res.status(200).json({
      message: "Login successful",
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};



exports.signup = async(req,res)=>{
  
  const { email, password, role, phone, location } = req.body;

  try {
    const result = await userService.signup({ email, password, role, phone, location });

    return res.status(201).json({
      message: "Signup successful",
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Server error",
    });
  }


};


exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await userService.forgetPassword(email);

    if (result.error) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json({
      message: "Reset password email sent",
      resetPasswordToken: result.resetPasswordToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;
    const message = await userService.resetPassword(newPassword, token);
    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// exports.get("/logout", (req, res) => {
//   //TO DEFINE IN CLIENT
// });
