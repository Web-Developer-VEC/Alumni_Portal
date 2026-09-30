import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IGalleryImage {
  _id?: Types.ObjectId;
  imageUrl: string;
}

export interface IGallery extends Document {
  caption: string;
  images: Types.DocumentArray<IGalleryImage & Document>;
  createdAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>({
  imageUrl: { type: String, required: true },
});

const gallerySchema = new Schema<IGallery>(
  {
    caption: { type: String, default: "", trim: true },
    images: { type: [galleryImageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IGallery>("Gallery", gallerySchema);