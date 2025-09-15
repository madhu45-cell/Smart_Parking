
import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true },
  x: Number, y: Number, w: Number, h: Number, 
  status: { type: String, enum: ["free", "occupied", "reserved"], default: "free" },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("Slot", slotSchema);
