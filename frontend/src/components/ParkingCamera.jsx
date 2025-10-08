import React, { useEffect, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { setSlotStatus } from "../api";

const FPS = 8;
const STABLE_FRAMES = 3;

export default function ParkingCamera({ slots, setSlots }){
  const videoRef = useRef();
  const canvasRef = useRef();
  const modelRef = useRef();
  const smoothingRef = useRef({});
  const lastUpdateRef = useRef({});

  useEffect(() => {
    smoothingRef.current = {};
    slots.forEach(s => smoothingRef.current[s.id] = { occ:0, free:0, lastState: s.status });

    let mounted = true;
    async function start(){
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 800, height: 600 }});
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        modelRef.current = await cocoSsd.load();
        runLoop();
      } catch (err) {
        console.error("Camera/TF error:", err);
        alert("Camera or model failed to load. See console.");
      }
    }

    async function runLoop(){
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth || 800;
      canvas.height = videoRef.current.videoHeight || 600;

      const loop = async () => {
        if (!mounted) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        let preds = [];
        try { preds = await modelRef.current.detect(videoRef.current); } catch(e){}

        preds.forEach(p => {
          const [x,y,w,h] = p.bbox;
          ctx.strokeStyle = "#0ff";
          ctx.lineWidth = 2;
          ctx.strokeRect(x,y,w,h);
          ctx.fillStyle = "#0ff";
          ctx.fillText(`${p.class} ${(p.score*100).toFixed(0)}%`, x, y>10? y-4: y+12);
        });

        const veh = preds.filter(p => ["car","truck","bus"].includes(p.class));
        let updatedSlots = false;
        const newSlots = slots.map(s => ({ ...s }));
        newSlots.forEach((slot, idx) => {
          const id = slot.id;
          const sx = slot.x || 0, sy = slot.y || 0, sw = slot.w || 120, sh = slot.h || 80;
          ctx.lineWidth = 3;
          ctx.strokeStyle = slot.status === "free" ? "green" : (slot.status === "occupied" ? "red" : "orange");
          ctx.strokeRect(sx, sy, sw, sh);
          ctx.fillStyle = "white";
          ctx.fillText(slot.status, sx + 4, sy + 14);

          const intersects = veh.some(pred => {
            const [px,py,pw,ph] = pred.bbox;
            const interW = Math.max(0, Math.min(px+pw, sx+sw) - Math.max(px, sx));
            const interH = Math.max(0, Math.min(py+ph, sy+sh) - Math.max(py, sy));
            const interArea = interW * interH;
            const slotArea = sw * sh || 1;
            if (interArea <= 0) return false;
            if (interArea / slotArea > 0.10) return true;
            if (interArea / (pw*ph) > 0.5) return true;
            return false;
          });

          const sRef = smoothingRef.current[id] || { occ:0, free:0, lastState: slot.status };
          if (intersects) { sRef.occ += 1; sRef.free = 0; } else { sRef.free += 1; sRef.occ = 0; }

          if (sRef.occ >= STABLE_FRAMES && sRef.lastState !== "occupied") {
            newSlots[idx].status = "occupied";
            sRef.lastState = "occupied";
            updatedSlots = true;
          } else if (sRef.free >= STABLE_FRAMES && sRef.lastState !== "free") {
            newSlots[idx].status = "free";
            sRef.lastState = "free";
            updatedSlots = true;
          } else {
            newSlots[idx].status = sRef.lastState;
          }
          smoothingRef.current[id] = sRef;
        });

        if (updatedSlots) {
          setSlots(newSlots);
          newSlots.forEach(s => {
            const last = lastUpdateRef.current[s.id] || 0;
            const now = Date.now();
            if (now - last > 800) {
              lastUpdateRef.current[s.id] = now;
              setSlotStatus(s.id, s.status).catch(e => console.warn("setSlotStatus err", e));
            }
          });
        }

        setTimeout(() => requestAnimationFrame(loop), 1000 / FPS);
      };

      loop();
    }

    start();
    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [slots, setSlots]);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ border: "2px solid #333", maxWidth: "800px" }} />
      <p style={{ marginTop: 8 }}>Camera: live — COCO-SSD detection in browser</p>
    </div>
  );
}
