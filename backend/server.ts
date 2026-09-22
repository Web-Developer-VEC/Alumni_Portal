import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import  indexRoutes from "./routes/index.routes.js";


dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api",indexRoutes)

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: " Alumni Portal Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
