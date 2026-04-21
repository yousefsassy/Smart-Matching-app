const { matchProvidersWithGemini } = require("../services/gemini");

exports.matchProviders = async (req, res, next) => {
  try {
    const body = req.body || {};
    const candidates = req.candidates || body.candidates;
    const serviceRequest = req.serviceRequest || body.serviceRequest || null;
    const saveMatchesToDb = Boolean(req.params.id);
    const serviceRequestId =
      req.params.id ||
      body.serviceRequestId ||
      serviceRequest?._id ||
      serviceRequest?.id ||
      null;
    const topK = body.top_k || body.topK || 3;

    if (!Array.isArray(candidates)) {
      return res.status(400).json({ error: "candidates must be an array" });
    }

    if (saveMatchesToDb && !serviceRequestId) {
      return res.status(400).json({ error: "serviceRequestId is required" });
    }

    const result = await matchProvidersWithGemini({
      candidates,
      serviceRequest,
      serviceRequestId,
      saveMatchesToDb,
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
