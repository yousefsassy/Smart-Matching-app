const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);
 // note : this is similar to : 

  //  const secretKey = process.env.JWT_SECRET;
  //  const payload = {
  //    _id: user._id,
  //    role: user.role,
  //    name: user.name,
  //  };
 
  //  const token = jwt.sign(payload, secretKey);

  // BUT more standard , stores less sensitive data and contains expiration.  sub means subject  
  // best practice is to store necessary data and fetch sensitive data from db 

}

module.exports = { signAccessToken };
