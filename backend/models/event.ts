import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    locationType: {
      type: String,
      enum: ["physical", "online", "hybrid"],
      default: "physical",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    registrationLink: {
      type: String,
      default: "",
      trim: true,
    },

        organizer: {
        type: String,
        required: true,
        trim: true,
        },

    category: {
      type: String,
      enum: [
        "alumni-meet",
        "reunion",
        "workshop",
        "seminar",
        "webinar",
        "networking",
        "career",
        "other",
      ],
      default: "other",
    },

    capacity: {
      type: Number,
      default: null,
    },
    guestSpeakers: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;