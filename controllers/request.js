const { createRequest } = require("../services/request");

exports.createRequest = async (req, res, next) => {
  try {
    const { client, serviceType, location, description, date, timeWindow, budget } = req.body;

    if (!client || !serviceType || !location || !date || !timeWindow || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const serviceRequest = await createRequest({
      client,
      serviceType,
      location,
      description,
      date,
      timeWindow,
      budget,
    });

    res.status(201).json({ success: true, serviceRequest });
  } catch (err) {
    next(err);
  }
};