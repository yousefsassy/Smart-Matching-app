const User = require("../models/User");
const bcrypt = require("bcrypt");

async function createClient(data) { // To be removed later, just for testing . will be handled by admin .
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error("Email already in use");

  // Dummy password since auth is skipped for now
  const passwordHash = await bcrypt.hash("password123", 10);

  const client = await User.create({
    name: data.name,
    email: data.email.toLowerCase().trim(),
    phone: data.phone || "",
    passwordHash,
    role: "client",
  });

  return {
    _id: client._id,
    name: client.name,
    email: client.email,
    role: client.role,
  };
}

module.exports = { createClient };