import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetName: { type: String, required: true, trim: true },
    assetId: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Laptop", "Mouse", "Keyboard", "Monitor", "Desktop", "Printer", "Headset", "Other"]
    },
    brand: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Available", "Assigned"],
      default: "Available"
    },
    assignedTo: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);