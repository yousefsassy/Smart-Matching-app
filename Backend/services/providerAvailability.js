const User = require("../models/user");

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const toDateKey = (value) => new Date(value).toISOString().split("T")[0];

const cloneSlot = (slot) =>
  slot?.start && slot?.end ? { start: slot.start, end: slot.end } : null;

const cloneEntry = (entry) => ({
  date: entry.date,
  slot1: cloneSlot(entry.slot1),
  slot2: cloneSlot(entry.slot2),
});

const overlaps = (left, right) => {
  if (!left?.start || !left?.end || !right?.start || !right?.end) return false;

  return toMinutes(left.start) < toMinutes(right.end) &&
    toMinutes(right.start) < toMinutes(left.end);
};

const subtractWindow = (slot, bookedWindow) => {
  if (!slot?.start || !slot?.end) return [];
  if (!overlaps(slot, bookedWindow)) return [cloneSlot(slot)];

  const slotStart = toMinutes(slot.start);
  const slotEnd = toMinutes(slot.end);
  const bookedStart = toMinutes(bookedWindow.start);
  const bookedEnd = toMinutes(bookedWindow.end);
  const remaining = [];

  if (slotStart < bookedStart) {
    remaining.push({ start: slot.start, end: bookedWindow.start });
  }

  if (bookedEnd < slotEnd) {
    remaining.push({ start: bookedWindow.end, end: slot.end });
  }

  return remaining.filter((candidate) => toMinutes(candidate.start) < toMinutes(candidate.end));
};

const normalizeSlots = (slots) =>
  slots
    .filter((slot) => slot?.start && slot?.end)
    .sort((left, right) => toMinutes(left.start) - toMinutes(right.start))
    .slice(0, 2);

async function bookProviderAvailability(providerId, date, timeWindow) {
  const provider = await User.findById(providerId);

  if (!provider?.providerDetails) {
    const error = new Error("Provider not found");
    error.status = 404;
    throw error;
  }

  const requestDateKey = toDateKey(date);
  const availability = provider.providerDetails.availability || [];
  const entryIndex = availability.findIndex(
    (entry) => toDateKey(entry.date) === requestDateKey
  );

  if (entryIndex === -1) {
    const error = new Error("Provider is no longer available for this date");
    error.status = 400;
    throw error;
  }

  const entry = availability[entryIndex];
  const snapshot = cloneEntry(entry);
  const sourceSlots =
    !entry.slot1 && !entry.slot2
      ? [{ start: "00:00", end: "23:59" }]
      : [entry.slot1, entry.slot2].filter(Boolean);

  if (!sourceSlots.some((slot) => overlaps(slot, timeWindow))) {
    const error = new Error("Provider is no longer available for this time window");
    error.status = 400;
    throw error;
  }

  const remainingSlots = normalizeSlots(
    sourceSlots.flatMap((slot) => subtractWindow(slot, timeWindow))
  );

  if (remainingSlots.length === 0) {
    availability.splice(entryIndex, 1);
  } else {
    availability[entryIndex].slot1 = remainingSlots[0] || null;
    availability[entryIndex].slot2 = remainingSlots[1] || null;
  }

  provider.markModified("providerDetails.availability");
  await provider.save();

  return snapshot;
}

async function restoreProviderAvailability(providerId, snapshot) {
  if (!snapshot?.date) return null;

  const provider = await User.findById(providerId);
  if (!provider?.providerDetails) return null;

  const availability = provider.providerDetails.availability || [];
  const snapshotDateKey = toDateKey(snapshot.date);
  const existingIndex = availability.findIndex(
    (entry) => toDateKey(entry.date) === snapshotDateKey
  );
  const restoredEntry = {
    date: snapshot.date,
    slot1: cloneSlot(snapshot.slot1),
    slot2: cloneSlot(snapshot.slot2),
  };

  if (existingIndex === -1) {
    availability.push(restoredEntry);
  } else {
    availability[existingIndex] = restoredEntry;
  }

  availability.sort((left, right) => new Date(left.date) - new Date(right.date));
  provider.markModified("providerDetails.availability");
  await provider.save();

  return restoredEntry;
}

module.exports = {
  bookProviderAvailability,
  restoreProviderAvailability,
};
