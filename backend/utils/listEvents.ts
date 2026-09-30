import "dotenv/config";
import mongoose from "mongoose";
import Event from "../models/event.js";

async function listEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/alumni_portal");
    const count = await Event.countDocuments();
    const events = await Event.find().sort({ date: 1 }).lean();
    console.log(`\n=== Total Events in MongoDB: ${count} ===`);
    events.forEach((ev, i) => {
      console.log(
        `${i + 1}. [${ev.category}] ${ev.title} (${ev.date?.toISOString().split("T")[0]}) - Venue: ${ev.venue}`
      );
    });
  } catch (error) {
    console.error("Error listing events:", error);
  } finally {
    await mongoose.disconnect();
  }
}

listEvents();
