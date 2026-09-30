import "dotenv/config";
import mongoose from "mongoose";
import Event from "../models/event.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/alumni_portal";

interface IEventSeed {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  locationType: "physical" | "online" | "hybrid";
  imageUrl: string;
  registrationLink: string;
  organizer: string;
  category:
    | "alumni-meet"
    | "reunion"
    | "workshop"
    | "seminar"
    | "webinar"
    | "networking"
    | "career"
    | "other";
  capacity: number | null;
  guestSpeakers: string[];
}

const testEvents: IEventSeed[] = [
  {
    title: "VEC Alumni Meet 2026",
    description:
      "An evening of reconnecting with classmates, revisiting old memories and celebrating the VEC spirit together on campus.",
    date: new Date("2026-11-15T10:00:00.000Z"),
    startTime: "10:00 AM",
    endTime: "02:00 PM",
    venue: "Main Auditorium, Velammal Engineering College",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&q=80",
    registrationLink: "https://forms.gle/example-alumni-meet",
    organizer: "Alumni Cell",
    category: "alumni-meet",
    capacity: 300,
    guestSpeakers: ["Arun Kumar (VP @ Google)", "Priya S (Director @ Microsoft)", "Rahul V (Founder @ FinTech)"],
  },
  {
    title: "Alumni Industry Connect",
    description:
      "Meet professionals across product, engineering and design, and build meaningful connections for your next career move.",
    date: new Date("2026-12-05T17:00:00.000Z"),
    startTime: "05:00 PM",
    endTime: "08:00 PM",
    venue: "ITC Grand Chola, Chennai",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80",
    registrationLink: "https://forms.gle/example-industry-connect",
    organizer: "Career & Mentorship Committee",
    category: "networking",
    capacity: 150,
    guestSpeakers: ["Keerthana R (Product Lead @ Stripe)", "Vignesh M (Staff Eng @ Meta)"],
  },
  {
    title: "Alumni Mentorship Session: Cracking Tech Interviews",
    description:
      "Experienced alumni share career insights, interview tips and guidance for students entering the tech industry.",
    date: new Date("2026-10-20T18:30:00.000Z"),
    startTime: "06:30 PM",
    endTime: "08:00 PM",
    venue: "Online via Google Meet",
    locationType: "online",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    registrationLink: "https://forms.gle/example-mentorship",
    organizer: "Alumni Cell",
    category: "career",
    capacity: 100,
    guestSpeakers: ["Harish Kumar (SDE II @ Amazon)"],
  },
  {
    title: "Tech Skills Bootcamp: GenAI & Cloud",
    description:
      "A hands-on workshop covering the latest in AI, cloud computing and full-stack development, led by alumni engineers.",
    date: new Date("2026-11-28T09:00:00.000Z"),
    startTime: "09:00 AM",
    endTime: "04:00 PM",
    venue: "CSE Block, Velammal Engineering College",
    locationType: "hybrid",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
    registrationLink: "https://forms.gle/example-tech-bootcamp",
    organizer: "Department of AI & DS",
    category: "workshop",
    capacity: 80,
    guestSpeakers: ["Divya S", "Sanjay Kumar", "Nithya R", "Karthik S"],
  },
  {
    title: "Department Batch Meetup",
    description:
      "Celebrate your department's legacy and reconnect with batchmates over dinner and nostalgia.",
    date: new Date("2026-09-12T19:00:00.000Z"),
    startTime: "07:00 PM",
    endTime: "10:00 PM",
    venue: "Velammal Engineering College Grounds",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=80",
    registrationLink: "https://forms.gle/example-batch-meetup",
    organizer: "Department Alumni Committee",
    category: "reunion",
    capacity: 400,
    guestSpeakers: [],
  },
  {
    title: "Startup & Innovation Summit",
    description:
      "Alumni entrepreneurs pitch their ideas and connect with investors and mentors from across the industry.",
    date: new Date("2027-01-18T11:00:00.000Z"),
    startTime: "11:00 AM",
    endTime: "03:00 PM",
    venue: "WeWork Prestige Central, Bengaluru",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80",
    registrationLink: "https://forms.gle/example-startup-summit",
    organizer: "Entrepreneurship Cell",
    category: "networking",
    capacity: 200,
    guestSpeakers: ["Swetha P", "Adithya R"],
  },
  {
    title: "AI in Industry Webinar",
    description:
      "A webinar exploring how alumni are applying AI and machine learning to solve real business problems.",
    date: new Date("2026-10-02T16:00:00.000Z"),
    startTime: "04:00 PM",
    endTime: "05:30 PM",
    venue: "Online via Zoom",
    locationType: "online",
    imageUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80",
    registrationLink: "https://forms.gle/example-ai-webinar",
    organizer: "Department of AI & DS",
    category: "webinar",
    capacity: 500,
    guestSpeakers: ["Rohit K", "Ananya M"],
  },
  {
    title: "Research & Innovation Seminar",
    description:
      "A seminar on emerging research areas, industry-academic collaboration and intellectual property publishing.",
    date: new Date("2025-08-14T10:00:00.000Z"),
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    venue: "Seminar Hall, Velammal Engineering College",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80",
    registrationLink: "",
    organizer: "Research Cell",
    category: "seminar",
    capacity: 120,
    guestSpeakers: ["Dr. Gokul R"],
  },
];

async function seedEvents() {
  try {
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully.");

    const existingCount = await Event.countDocuments();
    console.log(`Current event count in DB: ${existingCount}`);

    let insertedCount = 0;

    for (const eventData of testEvents) {
      // Check if event with same title already exists to avoid duplicates
      const exists = await Event.findOne({ title: eventData.title });
      if (!exists) {
        await Event.create(eventData);
        console.log(`Inserted event: "${eventData.title}"`);
        insertedCount++;
      } else {
        console.log(`Event already exists: "${eventData.title}"`);
      }
    }

    const totalCount = await Event.countDocuments();
    console.log(
      `Done! Inserted ${insertedCount} new events. Total events in DB: ${totalCount}`
    );
  } catch (error) {
    console.error("Error seeding events:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedEvents();
