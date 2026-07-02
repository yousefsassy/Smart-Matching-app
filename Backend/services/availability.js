const User = require("../models/user");

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const buildError = (status, message) => ({ status, message });

const validateDateString = (dateStr) => {
  if (typeof dateStr !== "string" || !DATE_REGEX.test(dateStr)) {
    throw buildError(400, "Date must be in YYYY-MM-DD format");
  }
};

const normalizeDateYYYYMMDD = (dateStr) => {
  validateDateString(dateStr);

  const normalizedDate = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(normalizedDate.getTime())) {
    throw buildError(400, "Invalid date");
  }

  return normalizedDate;
};

const convertTimeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const validateSlot = (slot, label) => {
  if (slot === null || slot === undefined) return null;

  if (typeof slot !== "object" || Array.isArray(slot)) {
    throw buildError(400, `${label} must be null or an object`);
  }

  const { start, end } = slot;
  if (typeof start !== "string" || typeof end !== "string") {
    throw buildError(400, `${label} must include start and end`);
  }

  if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) {
    throw buildError(400, `${label} times must be in HH:mm format`);
  }

  if (convertTimeToMinutes(end) <= convertTimeToMinutes(start)) {
    throw buildError(400, `${label} end time must be later than start time`);
  }

  return { start, end };
};

const normalizeSlots = (slot1, slot2) => {
  const normalizedSlot1 = validateSlot(slot1, "slot1");
  const normalizedSlot2 = validateSlot(slot2, "slot2");

  return {
    slot1: normalizedSlot1,
    slot2: normalizedSlot2,
  };
};

const getProvider = async (userId) => {
  const provider = await User.findOne({ _id: userId, role: "provider" });

  if (!provider) {
    throw buildError(404, "Provider not found");
  }

  if (!provider.providerDetails) {
    throw buildError(400, "Provider details are missing");
  }

  if (!Array.isArray(provider.providerDetails.availability)) {
    provider.providerDetails.availability = [];
  }

  return provider;
};

exports.normalizeDateYYYYMMDD = normalizeDateYYYYMMDD;

exports.getMyAvailability = async (userId) => {
  const provider = await getProvider(userId);

  return {
    message: "Availability fetched successfully",
    isAvailable: provider.providerDetails.isAvailable,
    availability: provider.providerDetails.availability,
  };
};

exports.toggleOnline = async (userId, isAvailable) => {
  if (typeof isAvailable !== "boolean") {
    throw buildError(400, "isAvailable must be a boolean");
  }

  const provider = await getProvider(userId);
  provider.providerDetails.isAvailable = isAvailable;
  await provider.save();

  return {
    message: "Online availability updated successfully",
    isAvailable: provider.providerDetails.isAvailable,
    availability: provider.providerDetails.availability,
  };
};

exports.syncAvailability = async (userId, payload) => {
  const provider = await getProvider(userId);
  const normalizedDate = normalizeDateYYYYMMDD(payload.date);
  const normalizedDateKey = normalizedDate.getTime();
  const { slot1, slot2 } = normalizeSlots(payload.slot1, payload.slot2);

  const availabilityEntry = {
    date: normalizedDate,
    slot1,
    slot2,
  };

  const existingIndex = provider.providerDetails.availability.findIndex(
    (entry) => new Date(entry.date).getTime() === normalizedDateKey
  );

  if (existingIndex >= 0) {
    provider.providerDetails.availability[existingIndex] = availabilityEntry;
  } else {
    provider.providerDetails.availability.push(availabilityEntry);
  }

  provider.markModified("providerDetails.availability");
  await provider.save();

  return {
    message: "Availability synced successfully",
    isAvailable: provider.providerDetails.isAvailable,
    availability: provider.providerDetails.availability,
  };
};

exports.deleteAvailability = async (userId, dateStr) => {
  const normalizedDate = normalizeDateYYYYMMDD(dateStr);

  const updatedProvider = await User.findOneAndUpdate(
    { _id: userId, role: "provider" },
    {
      $pull: {
        "providerDetails.availability": {
          date: normalizedDate,
        },
      },
    },
    { new: true }
  );

  if (!updatedProvider) {
    throw buildError(404, "Provider not found");
  }

  return {
    message: "Availability deleted successfully",
    isAvailable: updatedProvider.providerDetails.isAvailable,
    availability: updatedProvider.providerDetails.availability || [],
  };
};
