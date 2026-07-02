// services/notifications.js
const { expo } = require("../config/notifications");

async function sendPushNotification(expoPushToken, title, body, data = {}) {
  try {
    if (!expoPushToken) return { ok: false, reason: "missing_token" };

    // Validate Expo token format
    if (!expo.isExpoPushToken(expoPushToken)) {
      return { ok: false, reason: "invalid_token" };
    }

    const messages = [
      {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data, // optional: { requestId, jobId, screen: "JobDetails" }
      },
    ];

    // Expo requires chunking
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (err) {
        console.error("Expo push chunk error:", err);
      }
    }

    return { ok: true, tickets };
  } catch (err) {
    console.error("sendPushNotification error:", err);
    return { ok: false, reason: "server_error" };
  }
}

// High-level helpers (optional, but clean)
async function sendNewMatchAlert(providerToken, requestId) {
  return sendPushNotification(
    providerToken,
    "New service request",
    "You have a new request to review.",
    { requestId, type: "NEW_MATCH" }
  );
}

async function sendMatchAcceptedAlert(clientToken, requestId) {
  return sendPushNotification(
    clientToken,
    "Request accepted",
    "A provider accepted your request.",
    { requestId, type: "ACCEPTED" }
  );
}

async function sendProviderUnavailableAlert(clientToken, requestId) {
  return sendPushNotification(
    clientToken,
    "Provider unavailable",
    "This provider is unavailable. Please choose another candidate.",
    { requestId, type: "PROVIDER_UNAVAILABLE" }
  );
}

async function sendJobCompletedAlert(clientToken, jobId) {
  return sendPushNotification(
    clientToken,
    "Job completed",
    "The job is finished. Please leave a rating.",
    { jobId, type: "JOB_COMPLETED" }
  );
}

async function sendJobCancelledAlert(otherPartyToken, jobId) {
  return sendPushNotification(
    otherPartyToken,
    "Job cancelled",
    "The job has been cancelled.",
    { jobId, type: "JOB_CANCELLED" }
  );
}

module.exports = {
  sendPushNotification,
  sendNewMatchAlert,
  sendMatchAcceptedAlert,
  sendProviderUnavailableAlert,
  sendJobCompletedAlert,
  sendJobCancelledAlert,
};
