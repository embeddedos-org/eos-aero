import React, { useState } from "react";
import { useTelemetry, FlightPhase } from "@/contexts/TelemetryContext";
import { AeroMap } from "@/components/AeroMap";
import {
  Shield,
  ShieldAlert,
  Zap,
  Battery,
  Compass,
  Navigation,
  Wind,
  Lock,
  Unlock,
  Power,
  Flame,
  Thermometer,
  Eye,
  Sliders,
  Radio,
  FileText,
  Activity,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Home() {
  const {
    vehicles,
    selectedModel,
    setSelectedModel,
    activeVehicle,
    sendControlCommand,
    logMessages
  } = useTelemetry();

  const [climateTemp, setCabinTemp] = useState(21);

  const handleClimateChange = (temp: number) => {
    setCabinTemp(temp);
    sendControlCommand("CLIMATE", { temp });
  };

  const getPhaseBadgeColor = (phase: FlightPhase) => {
    switch (phase) {
      case "SHUTDOWN":
        return "bg-muted text-muted-foreground border-muted-foreground/30";
      case "PREFLIGHT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "VTOL_TAKEOFF":
      case "VTOL_LAND":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse";
      case "TRANSITION_UP":
      case "TRANSITION_DOWN":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse";
      case "CRUISE":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "THERMAL_GLIDE":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse";
      case "EMERGENCY":
        return "bg-red-500/20 text-red-400 border-red-500/30 animate-bounce";
      default:
        return "bg-primary/20 text-primary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center glow-cyan">
              <span className="font-serif font-bold text-lg text-primary-foreground">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AeroSwift</h1>
              <p className="text-xs text-muted-foreground font-mono">AMERICAN GROUP LLC • FLIGHT CONTROL CENTER</p>
            </div>
          </div>

          {/* Model Selector */}
          <div className="flex gap-1 bg-secondary p-1 rounded-lg border border-border">
            <button
              onClick={() => setSelectedModel("AS-1/2")}
              className={`px-4 py-1.5 rounded-md text-xs font-mono transition-all-180 ${
                selectedModel === "AS-1/2"
                  ? "bg-primary text-primary-foreground font-bold glow-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AS-1/2 PERSONAL
            </button>
            <button
              onClick={() => setSelectedModel("AS-10")}
              className={`px-4 py-1.5 rounded-md text-xs font-mono transition-all-180 ${
                selectedModel === "AS-10"
                  ? "bg-primary text-primary-foreground font-bold glow-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AS-10 TRANSIT
            </button>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                API GATEWAY ONLINE
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">LATENCY: 12ms</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 container py-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Vehicle Visual & Status */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Main Visual */}
          <Card className="glass-panel overflow-hidden border-border/50">
            <div className="relative aspect-video w-full bg-black/40 flex items-center justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663397835904/iUGsM9jiQeWwfgF6pBu2iF/aeroswift_hero-3g92oijFbxcRD4FAKnKqeo.webp"
                alt="AeroSwift Drone"
                className="object-cover w-full h-full opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <span className={`px-2.5 py-1 rounded border text-[10px] font-mono font-bold ${getPhaseBadgeColor(activeVehicle.phase)}`}>
                  {activeVehicle.phase}
                </span>
              </div>
            </div>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-bold font-serif">{activeVehicle.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{activeVehicle.id}</p>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/40 text-xs font-mono">
                <div className="bg-secondary/40 p-2 rounded">
                  <span className="text-muted-foreground block text-[10px]">BATTERY TYPE</span>
                  <span className="font-bold text-foreground">
                    {activeVehicle.model === "AS-1/2" ? "Semi-Solid-State" : "Pure Solid-State"}
                  </span>
                </div>
                <div className="bg-secondary/40 p-2 rounded">
                  <span className="text-muted-foreground block text-[10px]">PROPULSION</span>
                  <span className="font-bold text-foreground">
                    {activeVehicle.model === "AS-1/2" ? "8x VTOL / 2x Cruise" : "12x VTOL / 4x Fans"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tesla-style Primary Controls */}
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground">PRIMARY FLIGHT COMMANDS</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {/* Arm / Lock Row */}
              <div className="grid grid-cols-2 gap-3">
                {activeVehicle.is_locked ? (
                  <Button
                    variant="outline"
                    onClick={() => sendControlCommand("UNLOCK")}
                    className="w-full border-primary/30 hover:border-primary/60 text-xs font-mono flex gap-2 items-center justify-center"
                  >
                    <Unlock className="w-4 h-4" /> UNLOCK CABIN
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => sendControlCommand("LOCK")}
                    className="w-full border-destructive/30 hover:border-destructive/60 text-xs font-mono flex gap-2 items-center justify-center text-destructive"
                  >
                    <Lock className="w-4 h-4" /> LOCK CABIN
                  </Button>
                )}

                {activeVehicle.is_armed ? (
                  <Button
                    variant="outline"
                    onClick={() => sendControlCommand("DISARM")}
                    className="w-full border-red-500/30 hover:border-red-500/60 text-xs font-mono flex gap-2 items-center justify-center text-red-400"
                  >
                    <Power className="w-4 h-4" /> DISARM PROP
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => sendControlCommand("ARM")}
                    className="w-full border-emerald-500/30 hover:border-emerald-500/60 text-xs font-mono flex gap-2 items-center justify-center text-emerald-400"
                  >
                    <Power className="w-4 h-4" /> ARM PROPULSION
                  </Button>
                )}
              </div>

              {/* Takeoff / Return Home */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => sendControlCommand("TAKEOFF")}
                  disabled={!activeVehicle.is_armed || activeVehicle.phase !== "PREFLIGHT"}
                  className="w-full text-xs font-mono flex gap-2 items-center justify-center"
                >
                  <ArrowUp className="w-4 h-4" /> AUTO TAKEOFF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => sendControlCommand("RTH")}
                  disabled={activeVehicle.phase !== "CRUISE"}
                  className="w-full text-xs font-mono flex gap-2 items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4" /> RECALL (RTH)
                </Button>
              </div>

              {/* Emergency Stop */}
              <Button
                variant="destructive"
                onClick={() => sendControlCommand("EMERGENCY_LAND")}
                disabled={activeVehicle.phase === "SHUTDOWN"}
                className="w-full text-xs font-mono font-bold flex gap-2 items-center justify-center glow-crimson"
              >
                <ShieldAlert className="w-4 h-4" /> EMERGENCY DESCENT
              </Button>
            </CardContent>
          </Card>

          {/* Cabin Climate */}
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground">CABIN CLIMATE CONTROL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-2xl font-bold font-mono">{activeVehicle.cabin_temp}°C</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">TARGET TEMPERATURE</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleClimateChange(climateTemp - 1)}
                    className="w-8 h-8 rounded-full"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleClimateChange(climateTemp + 1)}
                    className="w-8 h-8 rounded-full"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Columns: Interactive Map & Telemetry Dashboard */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Map */}
          <div className="flex-1 min-h-[400px]">
            <AeroMap />
          </div>

          {/* Telemetry Dashboard Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-panel border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Compass className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-mono block">AIRSPEED</span>
                  <span className="text-lg font-bold font-mono">{Math.round(activeVehicle.airspeed)} km/h</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-mono block">ALTITUDE</span>
                  <span className="text-lg font-bold font-mono">{Math.round(activeVehicle.altitude)} m</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Battery className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-mono block">BATTERY SoC</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{activeVehicle.battery_soc.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-mono block">SOLAR INPUT</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    {activeVehicle.solar_power > 1000
                      ? `${(activeVehicle.solar_power / 1000).toFixed(1)} kW`
                      : `${activeVehicle.solar_power} W`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Energy Flow & System Logs */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          {/* Energy Flow & Systems Monitor */}
          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground">ENERGY FLOW & SYSTEM MONITOR</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 font-mono text-xs">
              {/* Battery Voltage */}
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-muted-foreground">BATTERY BUS</span>
                <span className="font-bold text-foreground">{activeVehicle.battery_voltage} V</span>
              </div>

              {/* Motor Power */}
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-muted-foreground">PROPULSION LOAD</span>
                <span className="font-bold text-red-400">
                  {activeVehicle.motor_power > 1000
                    ? `${(activeVehicle.motor_power / 1000).toFixed(1)} kW`
                    : `${activeVehicle.motor_power} W`}
                </span>
              </div>

              {/* Wing Status */}
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-muted-foreground">WING CONFIGURATION</span>
                <span className={`font-bold ${activeVehicle.wing_folded ? "text-amber-400" : "text-emerald-400"}`}>
                  {activeVehicle.wing_folded ? "FOLDED (VTOL)" : "EXTENDED (GLIDE)"}
                </span>
              </div>

              {/* Triple Redundancy (AS-10 Transit Only) */}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">FLIGHT COMPUTER</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {activeVehicle.model === "AS-10" ? "TMR VOTING (3/3)" : "NOMINAL (2/2)"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Real-time System Log Feed */}
          <Card className="glass-panel flex-1 flex flex-col border-border/50 max-h-[350px] xl:max-h-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono tracking-wider text-muted-foreground flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                REAL-TIME AEROOS LOGS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto font-mono text-[10px] text-muted-foreground p-4 bg-black/30 rounded-b-lg flex flex-col gap-2.5 h-[200px] xl:h-auto">
              {logMessages.map((log, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-2 py-0.5 hover:bg-white/5 transition-colors">
                  {log}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
