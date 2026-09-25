import { type Request, type Response } from "express";
import path from "path";

import Event from "../../models/event.js";
import { uploadFileToS3 } from "../../service/s3Upload.js";


export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      locationType,
      registrationLink,
      organizer,
      category,
      capacity,     
      guestSpeakers
    } = req.body;

    // -----------------------------------------
    // Validate required fields
    // -----------------------------------------

    if (
      !title ||
      !description ||
      !date ||
      !startTime ||
      !endTime ||
      !venue ||
      !organizer
    ) {
      res.status(400).json({
        message:
          "Title, description, date, start time, end time, venue and organizer are required",
      });

      return;
    }

    // -----------------------------------------
    // Validate date
    // -----------------------------------------

    const eventDate = new Date(date);

    if (isNaN(eventDate.getTime())) {
      res.status(400).json({
        message: "Invalid event date",
      });

      return;
    }

    // -----------------------------------------
    // Validate image
    // -----------------------------------------

    const file = req.file;

    let imageUrl = "";

    if (file) {
      const extension = path
        .extname(file.originalname)
        .toLowerCase();

      const randomString = Math.random()
        .toString(36)
        .substring(2, 8);

      const fileName =
        `events/${Date.now()}-${randomString}${extension}`;

      imageUrl = await uploadFileToS3(
        file.buffer,
        fileName,
        file.mimetype
      );
    }

    // -----------------------------------------
    // Create event
    // -----------------------------------------

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      startTime,
      endTime,
      venue,
      locationType:
        locationType || "physical",
      imageUrl,
      registrationLink:
        registrationLink || "",
      organizer,
      category:
        category || "other",
      capacity:
        capacity
          ? Number(capacity)
          : null,
      guestSpeakers:
        guestSpeakers || [],
    });

    // -----------------------------------------
    // Response
    // -----------------------------------------

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error(
      "Create event error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error while creating event",
    });
  }
};

// ======================================================
// GET ALL EVENTS
// GET /events
// ======================================================

export const getAllEvents = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const events = await Event.find()
      .sort({
        date: 1,
        startTime: 1,
      });

    res.status(200).json({
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.error(
      "Get events error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error while fetching events",
    });
  }
};