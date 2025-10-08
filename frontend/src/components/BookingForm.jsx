import React, { useState } from "react";
import { createBooking } from "../api";

export default function BookingForm({ slots, onBooked }){
  const [user, setUser] = useState("");
  const [slotId, setSlotId] = useState("");

  async function submit(e){
    e.preventDefault();
    if (!slotId) return alert("Select a free slot");
    try {
      await createBooking({ user: user || "Anonymous", slot_id: slotId });
      alert("Booked!");
      onBooked && onBooked();
    } catch(err){
      console.error(err);
      alert(err?.response?.data?.error || "Booking failed");
    }
  }

  return (
    <form onSubmit={submit} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
      <div>
        <input placeholder="Your name" value={user} onChange={e=>setUser(e.target.value)} style={{ width:"100%", padding:8, marginBottom:8 }} />
      </div>
      <div>
        <select value={slotId} onChange={e=>setSlotId(e.target.value)} style={{ width:"100%", padding:8 }}>
          <option value="">Select free slot</option>
          {slots.filter(s => s.status === "free").map(s => <option key={s.id} value={s.id}>{s.slot_number}</option>)}
        </select>
      </div>
      <button style={{ marginTop:8, width:"100%", padding:8 }}>Book Slot</button>
    </form>
  );
}
