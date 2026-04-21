const { createClient } = require("../services/client");

exports.createClient = async (req, res, next) => { // To be removed later, just for testing . will be handled by admin .
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const client = await createClient({ name, email, phone });

    res.status(201).json({ success: true, client });
  } catch (err) {
    next(err);
  }
};

