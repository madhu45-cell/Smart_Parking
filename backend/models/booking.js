import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);
