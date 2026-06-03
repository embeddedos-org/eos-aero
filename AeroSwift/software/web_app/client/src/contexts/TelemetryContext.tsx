import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type FlightPhase =
  | "PREFLIGHT"
  | "VTOL_TAKEOFF"
  | "TRANSITION_UP"
  | "CRUISE"
  | "THERMAL_GLIDE"
  | "TRANSITION_DOWN"
  | "VTOL_LAND"
  | "EMERGENCY"
  | "SHUTDOWN";

export type VehicleModel = "AS-1/2" | "AS-10";

export interface VehicleState {
  id: string;
  model: VehicleModel;
  name: string;
  phase: FlightPhase;
  battery_soc: number;
  battery_voltage: number;
  solar_power: number;
  motor_power: number;
  regen_power: number;
  airspeed: number;
  altitude: number;
  vertical_speed: number;
  heading: number;
  lat: number;
  lng: number;
  target_lat: number;
  target_lng: number;
  is_locked: boolean;
  is_armed: boolean;
  cabin_temp: number;
  wing_folded: boolean;
}

interface TelemetryContextType {
  vehicles: Record<VehicleModel, VehicleState>;
  selectedModel: VehicleModel;
  setSelectedModel: (model: VehicleModel) => void;
  activeVehicle: VehicleState;
  sendControlCommand: (command: string, params?: Record<string, any>) => void;
  logMessages: string[];
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

// San Francisco default coordinates
const SF_COORDS = { lat: 37.7749, lng: -122.4194 };
const SFO_COORDS = { lat: 37.6213, lng: -122.3790 };

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState<VehicleModel>("AS-1/2");
  const [logMessages, setLogMessages] = useState<string[]>(["[SYSTEM] AeroOS API Gateway connected.", "[SYSTEM] Authenticated as AmericanGroupLLC Owner."]);

  const [vehicles, setVehicles] = useState<Record<VehicleModel, VehicleState>>({
    "AS-1/2": {
      id: "AGL-AS-001",
      model: "AS-1/2",
      name: "AeroSwift Personal (Aegis One)",
      phase: "SHUTDOWN",
      battery_soc: 84.5,
      battery_voltage: 748.2,
      solar_power: 0,
      motor_power: 0,
      regen_power: 0,
      airspeed: 0,
      altitude: 0,
      vertical_speed: 0,
      heading: 90,
      lat: SF_COORDS.lat,
      lng: SF_COORDS.lng,
      target_lat: SF_COORDS.lat,
      target_lng: SF_COORDS.lng,
      is_locked: true,
      is_armed: false,
      cabin_temp: 21.5,
      wing_folded: true,
    },
    "AS-10": {
      id: "AGL-AS-010",
      model: "AS-10",
      name: "AeroSwift Transit (CityShuttle)",
      phase: "CRUISE",
      battery_soc: 62.1,
      battery_voltage: 798.5,
      solar_power: 12400,
      motor_power: 48000,
      regen_power: 0,
      airspeed: 224,
      altitude: 1500,
      vertical_speed: 0,
      heading: 215,
      lat: 37.7000,
      lng: -122.4000,
      target_lat: SFO_COORDS.lat,
      target_lng: SFO_COORDS.lng,
      is_locked: false,
      is_armed: true,
      cabin_temp: 22.0,
      wing_folded: false,
    },
  });

  const addLog = (msg: string) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Run real-time telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) => {
        const updated = { ...prev };

        // Simulate AS-1/2 (Personal) — can be in flight or shutdown
        const as1 = { ...updated["AS-1/2"] };
        if (as1.phase !== "SHUTDOWN" && as1.phase !== "PREFLIGHT") {
          // Dynamic simulation based on phase
          if (as1.phase === "VTOL_TAKEOFF") {
            as1.altitude += 2.5;
            as1.vertical_speed = 2.5;
            as1.motor_power = 240000; // 240 kW
            as1.battery_soc -= 0.05;
            if (as1.altitude >= 100) {
              as1.phase = "TRANSITION_UP";
              addLog("AS-1/2: Altitude target reached. Initiating TRANSITION_UP.");
            }
          } else if (as1.phase === "TRANSITION_UP") {
            as1.airspeed += 5;
            as1.motor_power = 180000;
            as1.battery_soc -= 0.03;
            if (as1.airspeed >= 120) {
              as1.phase = "CRUISE";
              as1.vertical_speed = 0;
              as1.wing_folded = false;
              addLog("AS-1/2: Transition complete. Wings fully extended. Entering CRUISE.");
            }
          } else if (as1.phase === "CRUISE") {
            as1.airspeed = 180 + Math.sin(Date.now() / 5000) * 2;
            as1.motor_power = 18000; // 18 kW cruise
            as1.solar_power = 2800 + Math.cos(Date.now() / 10000) * 200;
            as1.battery_soc -= 0.005;
            // Move slowly towards target
            const dLat = as1.target_lat - as1.lat;
            const dLng = as1.target_lng - as1.lng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist > 0.001) {
              as1.lat += (dLat / dist) * 0.0002;
              as1.lng += (dLng / dist) * 0.0002;
              as1.heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;
              if (as1.heading < 0) as1.heading += 360;
            } else {
              as1.phase = "TRANSITION_DOWN";
              addLog("AS-1/2: Destination waypoint reached. Initiating TRANSITION_DOWN.");
            }
          } else if (as1.phase === "TRANSITION_DOWN") {
            as1.airspeed -= 6;
            as1.motor_power = 80000;
            as1.battery_soc -= 0.02;
            if (as1.airspeed <= 40) {
              as1.phase = "VTOL_LAND";
              as1.wing_folded = true;
              addLog("AS-1/2: Cruise speed shed. Wings folded. Entering VTOL_LAND.");
            }
          } else if (as1.phase === "VTOL_LAND") {
            as1.altitude -= 1.5;
            as1.vertical_speed = -1.5;
            as1.motor_power = 220000;
            as1.battery_soc -= 0.04;
            if (as1.altitude <= 0) {
              as1.altitude = 0;
              as1.vertical_speed = 0;
              as1.airspeed = 0;
              as1.motor_power = 0;
              as1.solar_power = 0;
              as1.phase = "SHUTDOWN";
              as1.is_armed = false;
              addLog("AS-1/2: Safe landing confirmed. Propulsion systems disarmed.");
            }
          }
        }

        // Simulate AS-10 (Transit) — always cruising back and forth in our simulation
        const as10 = { ...updated["AS-10"] };
        if (as10.phase === "CRUISE") {
          as10.airspeed = 240 + Math.sin(Date.now() / 4000) * 3;
          as10.motor_power = 48000;
          as10.solar_power = 12600 + Math.cos(Date.now() / 8000) * 400;
          as10.battery_soc -= 0.003;

          const dLat = as10.target_lat - as10.lat;
          const dLng = as10.target_lng - as10.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist > 0.001) {
            as10.lat += (dLat / dist) * 0.0003;
            as10.lng += (dLng / dist) * 0.0003;
            as10.heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;
            if (as10.heading < 0) as10.heading += 360;
          } else {
            // Swap targets to loop back and forth
            const tempLat = as10.target_lat;
            const tempLng = as10.target_lng;
            if (tempLat === SFO_COORDS.lat) {
              as10.target_lat = SF_COORDS.lat;
              as10.target_lng = SF_COORDS.lng;
              addLog("AS-10: SFO Vertiport arrival. Commencing quick passenger swap & battery health check.");
            } else {
              as10.target_lat = SFO_COORDS.lat;
              as10.target_lng = SFO_COORDS.lng;
              addLog("AS-10: Downtown SF Vertiport arrival. Commencing return shuttle flight.");
            }
          }
        }

        updated["AS-1/2"] = as1;
        updated["AS-10"] = as10;
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendControlCommand = (command: string, params?: Record<string, any>) => {
    setVehicles((prev) => {
      const updated = { ...prev };
      const vehicle = { ...updated[selectedModel] };

      switch (command) {
        case "LOCK":
          vehicle.is_locked = true;
          addLog(`${selectedModel}: Cabin doors locked.`);
          break;
        case "UNLOCK":
          vehicle.is_locked = false;
          addLog(`${selectedModel}: Cabin doors unlocked.`);
          break;
        case "ARM":
          if (vehicle.is_locked) {
            addLog(`${selectedModel}: ERROR - Cannot arm while doors are locked.`);
          } else {
            vehicle.is_armed = true;
            vehicle.phase = "PREFLIGHT";
            addLog(`${selectedModel}: System ARMED. Running pre-flight diagnostic check...`);
            setTimeout(() => {
              addLog(`${selectedModel}: Pre-flight check OK. Ready for takeoff.`);
            }, 1500);
          }
          break;
        case "DISARM":
          vehicle.is_armed = false;
          vehicle.phase = "SHUTDOWN";
          vehicle.airspeed = 0;
          vehicle.altitude = 0;
          vehicle.motor_power = 0;
          addLog(`${selectedModel}: System DISARMED.`);
          break;
        case "TAKEOFF":
          if (!vehicle.is_armed) {
            addLog(`${selectedModel}: ERROR - Cannot takeoff. System must be armed first.`);
          } else {
            vehicle.phase = "VTOL_TAKEOFF";
            vehicle.wing_folded = true;
            // Set target SFO if starting SF
            vehicle.target_lat = SFO_COORDS.lat;
            vehicle.target_lng = SFO_COORDS.lng;
            addLog(`${selectedModel}: Takeoff initiated! VTOL Lift Motors engaged.`);
          }
          break;
        case "RTH":
          if (vehicle.phase === "CRUISE" || vehicle.phase === "THERMAL_GLIDE") {
            vehicle.target_lat = SF_COORDS.lat;
            vehicle.target_lng = SF_COORDS.lng;
            addLog(`${selectedModel}: Return to Home (RTH) initiated. Heading to home base.`);
          } else {
            addLog(`${selectedModel}: ERROR - RTH only available in cruise phase.`);
          }
          break;
        case "EMERGENCY_LAND":
          vehicle.phase = "VTOL_LAND";
          addLog(`${selectedModel}: EMERGENCY LANDING initiated. Descending immediately.`);
          break;
        case "CLIMATE":
          if (params?.temp) {
            vehicle.cabin_temp = params.temp;
            addLog(`${selectedModel}: Cabin climate set to ${params.temp}°C.`);
          }
          break;
        default:
          break;
      }

      updated[selectedModel] = vehicle;
      return updated;
    });
  };

  const activeVehicle = vehicles[selectedModel];

  return (
    <TelemetryContext.Provider
      value={{
        vehicles,
        selectedModel,
        setSelectedModel,
        activeVehicle,
        sendControlCommand,
        logMessages,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) throw new Error("useTelemetry must be used within TelemetryProvider");
  return context;
};
