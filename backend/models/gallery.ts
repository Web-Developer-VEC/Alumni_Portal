import mongoose from "mongoose";

const galleryPhotoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const gallerySchema = new mongoose.Schema(
  {
    photos: {
      type: [galleryPhotoSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;