# AeroSwift App Architecture & UI/UX Design Specification
**Product Line:** AeroSwift Unified Control Platform  
**Target Platforms:** Web (React/Tailwind) & Mobile (React Native for iOS + Android)  
**Design Paradigm:** Tesla-Style Premium Dark UI, Cyberpunk Accents, Real-Time Low-Latency Telemetry

---

## 1. Core Concept & Design Language

The AeroSwift Unified Control Platform is designed to mirror the premium, high-tech, and minimal design language of the Tesla mobile and web applications. It provides owners and fleet managers with full control, live monitoring, flight planning, and telemetry tracking from anywhere in the world.

### 1.1 Color Palette & Typography

* **Background:** Deep Space Black (`#0B0F19`) and Charcoal Dark (`#161D30`)
* **Primary Accents:** Electric Cyan (`#00F2FE`) and Neon Blue (`#4FACFE`)
* **Success/Active State:** Emerald Green (`#10B981`)
* **Alerts/Critical State:** Crimson Red (`#EF4444`)
* **Typography:**
  * Headings: **Playfair Display** (Elegant, Premium) or **Inter** (Semi-Bold)
  * Body & Telemetry: **Inter** (Clean, highly legible)
  * Monospace Telemetry: **JetBrains Mono** (For raw logs and numeric feeds)

---

## 2. Web App (Fleet & Personal Control Center)

The Web App serves as the **Fleet Control & Operations Center**, optimized for desktop and tablet screens. It is built using **React + TypeScript + Tailwind CSS**.

### 2.1 Core Screens

1. **Dashboard (The Tesla 'Home' view):**
   * Large 3D render/visual of the selected vehicle (AS-1/2 or AS-10) with live status overlay.
   * State of Charge (SoC) indicator with remaining range (km) and solar harvesting power (W).
   * Primary Action buttons: **Power On**, **Arm System**, **Takeoff**, **Return to Home (RTH)**, **Emergency Land**.
2. **Live Map & Telemetry:**
   * Interactive 3D map (Mapbox GL/Leaflet) showing the vehicle's real-time position, flight path, and target waypoint.
   * Side panel with live flight telemetry: Airspeed (km/h), Altitude (m), Vertical Speed (m/s), Wind Speed (m/s), Motor Temperatures (°C), and Battery Voltage (V).
3. **Flight Planner:**
   * Waypoint-based route planner with automated obstacle avoidance and energy estimation.
   * "AI Optimize" button: Automatically adjusts flight path based on wind maps and solar irradiance forecasts.
4. **Fleet Management (For AS-10 Transit):**
   * Multi-vehicle grid view showing all active shuttles in the fleet.
   * Vertiport occupancy status and automated battery swap scheduling.

---

## 3. Mobile App (Owner Companion App)

The Mobile App is the **Personal Owner Companion**, built using **React Native + Expo** for iOS and Android. It focuses on single-vehicle remote control, security, and quick status checks.

### 3.1 Core Screens

1. **Vehicle Status (Tesla-style main screen):**
   * High-contrast dark UI showing a top-down view of the AeroSwift.
   * Status indicators: **Locked/Unlocked**, **Armed/Disarmed**, **Battery SoC %**, **Solar Power (W)**.
   * Swipe-up drawer for secondary controls (Climate, Lights, Wing Fold/Unfold, Cabin Temp).
2. **Remote Flight Control (The 'Summon' equivalent):**
   * **Virtual Joystick / Tele-Operation:** Low-latency remote control over 5G/V2X.
   * **Quick Waypoint:** Tap on a map to send the drone to a specific location autonomously.
   * **Return to Home (RTH):** One-tap recall button.
3. **Security & Sentry Mode:**
   * Live feed from the 8× 4K perimeter cameras.
   * Push notifications for proximity alerts or unauthorized movement.
4. **Digital Key & Account:**
   * Secure Bluetooth Low Energy (BLE) and NFC digital key pairing.
   * Biometric authentication (FaceID/Fingerprint) required before arming the propulsion system.

---

## 4. API & Communication Architecture

To ensure security, low latency, and reliability, all applications communicate through the **AmericanGroupLLC API Gateway** rather than directly with the vehicle.

```
[ Web Dashboard ] ──┐
                    ├──> [ AGL API Gateway ] ──> [ 5G / V2X Sidelink ] ──> [ AeroOS Flight Computer ]
[ Mobile App ]    ──┘
```

### 4.1 Live Telemetry Stream (WebSockets)

Real-time telemetry is streamed from the AeroOS flight computer over a secure WebSocket connection (`wss://api.americangroupllc.com/v1/aeroswift/telemetry`).

```json
{
  "timestamp": 1779926400000,
  "vehicle_id": "AGL-AS-001",
  "model": "AS-1/2",
  "status": "CRUISE",
  "gps": {
    "lat": 37.7749,
    "lon": -122.4194,
    "alt": 1200.5
  },
  "telemetry": {
    "airspeed_kmh": 180.2,
    "vertical_speed_ms": 0.1,
    "heading_deg": 90.0,
    "tilt_angle_deg": 0.0
  },
  "energy": {
    "battery_soc_pct": 72.5,
    "battery_voltage_v": 748.2,
    "solar_power_w": 2850.0,
    "motor_power_w": 18200.0,
    "regen_power_w": 0.0,
    "remaining_range_km": 182.4
  }
}
```

### 4.2 Control Commands (REST / WebSockets)

Commands are sent via secure POST requests to the API Gateway with OAuth2 bearer tokens.

* **Arm Propulsion:** `POST /v1/aeroswift/control/arm`
* **Takeoff Command:** `POST /v1/aeroswift/control/takeoff`
* **Update Waypoint:** `POST /v1/aeroswift/control/waypoint`
