import Slot from "../models/Slot.js";

export const getSlots = async (req, res) => {
  const slots = await Slot.find().sort({ slotNumber: 1 });
  res.json(slots);
};

export const updateSlotStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const slot = await Slot.findByIdAndUpdate(id, { status, lastUpdated: Date.now() }, { new: true });
  if (!slot) return res.status(404).json({ msg: "Slot not found" });
  res.json(slot);
};
