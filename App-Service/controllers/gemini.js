const { matchProvidersWithGemini } = require("../services/gemini");

exports.matchProviders = async (req, res, next) => {
  try {
    const body = req.body || {};
    const candidates = req.candidates || body.candidates;
    const serviceRequest = req.serviceRequest || body.serviceRequest || null;
    const topK = body.top_k || body.topK || 3;

    if (!Array.isArray(candidates)) {
      return res.status(400).json({ error: "candidates must be an array" });
    }

    if (candidates.length === 0) {
      return res.status(200).json({
        success: true,
        top_providers: [],
        message: "No providers available",
        matchesCreated: 0,
        saved: false,
      });
    }

    const result = await matchProvidersWithGemini({
      candidates,
      serviceRequest,
      topK,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
