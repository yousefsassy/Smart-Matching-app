const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");

async function createRequest(data) {
  // Validate client exists and has role "client"
  const client = await User.findById(data.client).lean();
  if (!client) throw new Error("Client not found");
  if (client.role !== "client") throw new Error("User is not a client");

  // Validate budget
  if (data.budget.min > data.budget.max) {
    throw new Error("Budget min cannot be greater than max");
  }

  // Validate date is in the future
  if (new Date(data.date) < new Date()) {
    throw new Error("Request date must be in the future");
  }

  const serviceRequest = await ServiceRequest.create({
    client: data.client,
    serviceType: data.serviceType.trim().toLowerCase(),
    location: data.location,
    description: data.description || "",
    date: new Date(data.date),
    timeWindow: data.timeWindow,
    budget: data.budget,
    status: "pending",
  });

  return serviceRequest;
}

module.exports = { createRequest };