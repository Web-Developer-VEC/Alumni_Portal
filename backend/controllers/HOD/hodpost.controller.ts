import type { Request, Response } from "express";
import path from "path";
import PrePost from "../../models/prePost.js";
import Post from "../../models/post.js";
import Event from "../../models/event.js";
import { uploadFileToS3 } from "../../service/s3Upload.js";

/**
 * Get all posts waiting for HOD approval from pre_post collection.
 * Supports optional status query (?status=PENDING | APPROVED | REJECTED).
 * Defaults to PENDING.
 */
export const getPendingPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};

    if (status && typeof status === "string") {
      filter.status = status.toUpperCase();
    } else {
      filter.status = "PENDING";
    }

    const posts = await PrePost.find(filter)
      .populate("author", "name email photo displayName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("getPendingPosts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get a single post from pre_post collection by ID.
 * Expected params: { id: string }
 */
export const getPendingPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    const post = await PrePost.findById(postId)
      .populate("author", "name email photo displayName");

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("getPendingPostById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Approve a post from pre_post collection and move it to the post collection.
 * Expected params: { id: string } (post id)
 */
export const approvePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    // 1. Find the post in pre_post collection
    const prePost = await PrePost.findById(postId);
    if (!prePost) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    // 2. Prepare post data for the post collection
    const prePostObj = prePost.toObject();
    const { _id, __v, status, rejectReason, createdAt, updatedAt, ...cleanPostData } = prePostObj;

    // 3. Insert into the post collection preserving the original _id
    const newPost = await Post.create({
      _id,
      ...cleanPostData,
    });

    // 4. Delete the post from pre_post collection after successful insert
    try {
      await PrePost.findByIdAndDelete(postId);
    } catch (delError) {
      // Rollback newly created post if delete from pre_post fails
      await Post.findByIdAndDelete(newPost._id);
      throw delError;
    }

    // 5. Populate author info for the response
    await newPost.populate("author", "name email photo displayName");

    res.status(200).json({
      success: true,
      message: "Post approved and successfully moved to post collection",
      post: newPost,
    });
  } catch (error) {
    console.error("approvePost error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Reject a post in pre_post collection with optional reason.
 * Expected params: { id: string }, body: { reason?: string, delete?: boolean }
 */
export const rejectPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    const reason = req.body.reason?.trim();
    const shouldDelete = req.body.delete === true || req.query.action === "delete";

    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    const prePost = await PrePost.findById(postId);
    if (!prePost) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    if (shouldDelete) {
      await PrePost.findByIdAndDelete(postId);
      res.status(200).json({
        success: true,
        message: "Post rejected and deleted from pre_post collection",
      });
      return;
    }

    prePost.status = "REJECTED";
    if (reason) prePost.rejectReason = reason;
    await prePost.save();

    res.status(200).json({
      success: true,
      message: "Post marked as rejected",
      post: prePost,
    });
  } catch (error) {
    console.error("rejectPost error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a post from pre_post collection.
 * Expected params: { id: string }
 */
export const deletePrePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    const deleted = await PrePost.findByIdAndDelete(postId);
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Post deleted from pre_post collection successfully",
    });
  } catch (error) {
    console.error("deletePrePost error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// =========================================================
// HOD EVENT CONTROLLERS
// =========================================================

/**
 * Create a new event by HOD with optional image upload to AWS S3.
 * Route: POST /api/hod/events or POST /api/hod/event
 */
export const createHODEvent = async (req: Request, res: Response): Promise<void> => {
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
      guestSpeakers,
      department,
    } = req.body;

    // Validate required fields
    if (!title || !description || !date || !startTime || !endTime || !venue) {
      res.status(400).json({
        success: false,
        message: "Title, description, date, start time, end time, and venue are required.",
      });
      return;
    }

    // Validate date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid event date.",
      });
      return;
    }

    // Handle optional image upload to S3 or URL in body
    let imageUrl = req.body.imageUrl || "";
    const file = req.file;

    if (file) {
      const extension = path.extname(file.originalname).toLowerCase();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `events/hod/${Date.now()}-${randomString}${extension}`;

      imageUrl = await uploadFileToS3(file.buffer, fileName, file.mimetype);
    }

    // Parse guest speakers
    let speakers: string[] = [];
    if (guestSpeakers) {
      if (Array.isArray(guestSpeakers)) {
        speakers = guestSpeakers.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof guestSpeakers === "string") {
        try {
          const parsed = JSON.parse(guestSpeakers);
          if (Array.isArray(parsed)) {
            speakers = parsed.map((s) => String(s).trim()).filter(Boolean);
          } else {
            speakers = guestSpeakers.split(",").map((s) => s.trim()).filter(Boolean);
          }
        } catch {
          speakers = guestSpeakers.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    // Determine organizer
    const finalOrganizer =
      organizer?.trim() ||
      (department ? `Department of ${department} (HOD)` : "HOD Office");

    // Create event
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      venue: venue.trim(),
      locationType: locationType || "physical",
      imageUrl,
      registrationLink: registrationLink?.trim() || "",
      organizer: finalOrganizer,
      category: category || "other",
      capacity: capacity ? Number(capacity) : null,
      guestSpeakers: speakers,
    });

    res.status(201).json({
      success: true,
      message: "Event successfully created and posted by HOD",
      event,
    });
  } catch (error) {
    console.error("createHODEvent error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating HOD event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all events for HOD management.
 * Route: GET /api/hod/events
 */
export const getHODEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (category && typeof category === "string" && category !== "all") {
      filter.category = category.toLowerCase();
    }

    if (search && typeof search === "string" && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { venue: { $regex: search.trim(), $options: "i" } },
        { organizer: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const events = await Event.find(filter).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("getHODEvents error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching HOD events",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update an existing event by HOD.
 * Route: PUT /api/hod/events/:id or PATCH /api/hod/events/:id
 */
export const updateHODEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id || req.body.id;
    if (!eventId) {
      res.status(400).json({ success: false, message: "Event ID is required." });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

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
      guestSpeakers,
    } = req.body;

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) event.date = parsedDate;
    }
    if (startTime) event.startTime = startTime.trim();
    if (endTime) event.endTime = endTime.trim();
    if (venue) event.venue = venue.trim();
    if (locationType) event.locationType = locationType;
    if (registrationLink !== undefined) event.registrationLink = registrationLink.trim();
    if (organizer) event.organizer = organizer.trim();
    if (category) event.category = category;
    if (capacity !== undefined) event.capacity = capacity ? Number(capacity) : null;

    if (guestSpeakers) {
      if (Array.isArray(guestSpeakers)) {
        event.guestSpeakers = guestSpeakers.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof guestSpeakers === "string") {
        try {
          const parsed = JSON.parse(guestSpeakers);
          event.guestSpeakers = Array.isArray(parsed)
            ? parsed.map((s) => String(s).trim()).filter(Boolean)
            : guestSpeakers.split(",").map((s) => s.trim()).filter(Boolean);
        } catch {
          event.guestSpeakers = guestSpeakers.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    // Handle new image upload if provided
    const file = req.file;
    if (file) {
      const extension = path.extname(file.originalname).toLowerCase();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `events/hod/${Date.now()}-${randomString}${extension}`;

      event.imageUrl = await uploadFileToS3(file.buffer, fileName, file.mimetype);
    } else if (req.body.imageUrl) {
      event.imageUrl = req.body.imageUrl;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully by HOD",
      event,
    });
  } catch (error) {
    console.error("updateHODEvent error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete an event by HOD.
 * Route: DELETE /api/hod/events/:id
 */
export const deleteHODEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id || req.body.id;
    if (!eventId) {
      res.status(400).json({ success: false, message: "Event ID is required." });
      return;
    }

    const deleted = await Event.findByIdAndDelete(eventId);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Event not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully by HOD",
    });
  } catch (error) {
    console.error("deleteHODEvent error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
