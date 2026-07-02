const matchService = require("../services/match");
const {
  sendMatchAcceptedAlert,
  sendNewMatchAlert,
  sendProviderUnavailableAlert,
} = require("../services/notifications");

const handleError = (res, error) =>
  res.status(error.status || 500).json({ message: error.message || "Server error" });

exports.generateMatches = async (req, res) => {
  try {
    const result = await matchService.generateMatches(req.params.requestId);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getMatchesByRequest = async (req, res) => {
  try {
    const result = await matchService.getMatchesByRequest(req.params.requestId, req.user);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getInvitations = async (req, res) => {
  try {
    const result = await matchService.getInvitations(req.user.id);
    const { notifications, ...payload } = result;

    for (const notification of notifications || []) {
      if (!notification?.clientToken) continue;

      try {
        await sendProviderUnavailableAlert(
          notification.clientToken,
          notification.requestId
        );
      } catch (error) {
        console.error("sendProviderUnavailableAlert failed:", error.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.selectMatch = async (req, res) => {
  try {
    const result = await matchService.selectMatch(req.params.matchId, req.user.id);
    const { notification, ...payload } = result;

    if (notification?.providerToken) {
      try {
        await sendNewMatchAlert(notification.providerToken, notification.requestId);
      } catch (error) {
        console.error("sendNewMatchAlert failed:", error.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.respondToMatch = async (req, res) => {
  try {
    const result = await matchService.respondToMatch(
      req.params.matchId,
      req.user.id,
      req.body.action
    );
    const { notification, ...payload } = result;

    if (notification?.clientToken) {
      try {
        if (req.body.action === "accept") {
          await sendMatchAcceptedAlert(
            notification.clientToken,
            notification.requestId
          );
        } else {
          await sendProviderUnavailableAlert(
            notification.clientToken,
            notification.requestId
          );
        }
      } catch (error) {
        console.error("match response notification failed:", error.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.expireMatch = async (req, res) => {
  try {
    const result = await matchService.expireMatch(req.params.matchId);
    const { notification, ...payload } = result;

    if (notification?.clientToken) {
      try {
        await sendProviderUnavailableAlert(
          notification.clientToken,
          notification.requestId
        );
      } catch (error) {
        console.error("sendProviderUnavailableAlert failed:", error.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    return handleError(res, error);
  }
};
