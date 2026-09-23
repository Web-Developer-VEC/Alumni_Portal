import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth/auth.route.js";
import passport from "./config/passport.js";
import session from "express-session";
import router from "./routes/index.routes.js";

// Connect to MongoDB
connectDB();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "alumni_portal_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Alumni Portal Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
