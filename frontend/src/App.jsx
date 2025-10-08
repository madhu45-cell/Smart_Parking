import React, { useEffect, useState } from "react";
import { fetchSlots } from "./api";
import ParkingCamera from "./components/ParkingCamera";
import BookingForm from "./components/BookingForm";

export default function App(){
  const [slots, setSlots] = useState([]);

  const load = async () => {
    try {
      const res = await fetchSlots();
      setSlots(res.data);
    } catch(e){ console.error(e); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>SmartParking — Django + React Prototype</h1>
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div>
          <ParkingCamera slots={slots} setSlots={setSlots} />
        </div>
        <div style={{ width: 360 }}>
          <BookingForm slots={slots} onBooked={load} />
          <div style={{ marginTop: 16 }}>
            <h3>Slots</h3>
            <ul>
              {slots.map(s => (<li key={s.id}>{s.slot_number} — {s.status}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
