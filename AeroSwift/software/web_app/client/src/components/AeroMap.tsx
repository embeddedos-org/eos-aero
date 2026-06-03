import React, { useEffect, useRef } from "react";
import { useTelemetry } from "@/contexts/TelemetryContext";

export const AeroMap: React.FC = () => {
  const { activeVehicle } = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    // San Francisco downtown & SFO bounds mapping
    const bounds = {
      minLat: 37.60,
      maxLat: 37.80,
      minLng: -122.45,
      maxLng: -122.35,
    };

    const toCanvasCoords = (lat: number, lng: number) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * canvas.width;
      const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * canvas.height;
      return { x, y };
    };

    const drawMap = () => {
      // Clear with deep navy gradient
      ctx.fillStyle = "#0B0F19";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw futuristic grid lines
      ctx.strokeStyle = "rgba(0, 242, 254, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Bay Area coastlines (simplified vector representation)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // SF Peninsula
      const pt1 = toCanvasCoords(37.80, -122.45);
      const pt2 = toCanvasCoords(37.80, -122.40);
      const pt3 = toCanvasCoords(37.75, -122.38);
      const pt4 = toCanvasCoords(37.60, -122.36);
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.lineTo(pt3.x, pt3.y);
      ctx.lineTo(pt4.x, pt4.y);
      ctx.stroke();

      // Draw SF Downtown Hub
      const downtown = toCanvasCoords(37.7749, -122.4194);
      ctx.fillStyle = "rgba(0, 242, 254, 0.1)";
      ctx.beginPath();
      ctx.arc(downtown.x, downtown.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00F2FE";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(downtown.x, downtown.y, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#00F2FE";
      ctx.font = "10px JetBrains Mono";
      ctx.fillText("HQ Vertiport SF", downtown.x + 35, downtown.y + 4);

      // Draw SFO Hub
      const sfo = toCanvasCoords(37.6213, -122.3790);
      ctx.fillStyle = "rgba(79, 172, 254, 0.1)";
      ctx.beginPath();
      ctx.arc(sfo.x, sfo.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4FACFE";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sfo.x, sfo.y, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#4FACFE";
      ctx.fillText("SFO Transit Hub", sfo.x + 35, sfo.y + 4);

      // Draw flight path from current position to target
      const current = toCanvasCoords(activeVehicle.lat, activeVehicle.lng);
      const target = toCanvasCoords(activeVehicle.target_lat, activeVehicle.target_lng);

      if (activeVehicle.phase !== "SHUTDOWN") {
        ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw vehicle icon
      ctx.save();
      ctx.translate(current.x, current.y);
      ctx.rotate((activeVehicle.heading * Math.PI) / 180);

      // Pulse ring
      const pulse = (Date.now() % 1500) / 1500;
      ctx.strokeStyle = `rgba(0, 242, 254, ${1 - pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10 + pulse * 20, 0, Math.PI * 2);
      ctx.stroke();

      // Vehicle body
      ctx.fillStyle = "#00F2FE";
      ctx.beginPath();
      ctx.moveTo(0, -12); // nose
      ctx.lineTo(8, 8);   // wing right
      ctx.lineTo(0, 4);   // tail
      ctx.lineTo(-8, 8);  // wing left
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Label vehicle
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 11px Inter";
      ctx.fillText(activeVehicle.model, current.x + 15, current.y - 10);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "10px JetBrains Mono";
      ctx.fillText(`${Math.round(activeVehicle.altitude)}m | ${Math.round(activeVehicle.airspeed)}km/h`, current.x + 15, current.y + 4);

      animationId = requestAnimationFrame(drawMap);
    };

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    drawMap();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activeVehicle]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-lg overflow-hidden border border-border">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded border border-border text-xs font-mono text-primary flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        LIVE TELEMETRY MAP (SF BAY AREA)
      </div>
    </div>
  );
};
