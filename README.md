# AeroSwift Platform Monorepo
### Unified Solar-Hybrid VTOL Drone Platform & Control Software Ecosystem

**Organization:** American Group LLC  
**Status:** Active Design & Development  
**License:** Proprietary — American Group LLC

---

![AeroSwift Platform Hero](assets/personal_concept.png)

---

## 1. Monorepo Overview

This is the central monorepo for the **AeroSwift Platform**, an ultra-efficient family of solar-hybrid vertical takeoff and landing (VTOL) aircraft designed by American Group LLC. 

By utilizing a unified hardware architecture, a single real-time operating system (**AeroOS**), and a common Tesla-style control and monitoring ecosystem, AeroSwift scales seamlessly from personal transport to commercial mass transit.

### 1.1 Core Vehicle Models

1. **AeroSwift-Personal (AS-1/2):** A 1-to-2 passenger personal air vehicle (PAV) designed for daily consumer commutes, featuring foldable wings for garage storage and a 90 kWh battery.
2. **AeroSwift-Transit (AS-10):** A 10-passenger urban air mobility (UAM) shuttle for commercial air taxi networks, featuring a wide-body cabin, a 480 kWh solid-state battery, and triple-redundant safety systems.

---

## 2. Monorepo Directory Structure

```
AeroSwift/
├── vehicles/
│   ├── personal/             # AeroSwift-Personal specs & configs
│   └── transit/              # AeroSwift-Transit specs & configs
├── hardware/
│   ├── pcb/                  # KiCad ECAD design files
│   │   ├── flight_computer/  # 8-layer & 12-layer TMR flight computers
│   │   ├── ems_board/        # High-voltage Energy Management System
│   │   └── motor_driver/     # MagLev BLDC motor controllers
│   ├── cad/                  # Mechanical CAD (STEP/STL placeholders)
│   ├── bom/                  # Master Bills of Materials (Personal & Transit)
│   └── antenna/              # RF antenna designs (GPS, LTE, V2X, ADS-B)
├── firmware/
│   ├── aeros_core/           # AeroOS C++20 real-time flight control kernel
│   └── fdr/                  # Triple Modular Redundancy (TMR) voter
├── software/
│   ├── aeros_ai/             # Python: AI flight optimizer & thermal glide engine
│   ├── web_app/              # React: Tesla-style fleet & personal web control dashboard
│   └── mobile_app/           # React Native: iOS & Android owner companion app
├── docs/
│   ├── specs/                # Unified specifications & design guidelines
│   ├── regulatory/           # FAA Part 21.17(b) & Part 135 roadmaps
│   └── academic/             # IEEE TechRxiv & T-IV white paper drafts
└── assets/                   # 3D concept renders & architecture diagrams
```

---

## 3. Technology Stack

### 3.1 Embedded & Avionics (Firmware)
* **Real-Time Kernel:** C++20 with ROS 2 Humble middleware running on FreeRTOS.
* **TMR Voter:** Hardware-enforced triple modular redundancy voting with Byzantine fault tolerance.
* **Flight Computer:** Dual/Triple Rockchip RK3588S (32-TOPS NPU) paired with STM32H7B3 co-processors.

### 3.2 AI Flight Optimizer (Software)
* **Wind Predictor:** Holt-Winters double exponential smoothing model running at 10 Hz.
* **Thermal Detector:** Barometric variometer-based dynamic updraft tracking.
* **Aerodynamics:** Automated Carson's speed calculation for best-range cruise velocity.

### 3.3 Control Apps (Web & Mobile)
* **AeroSwift Web Dashboard:** Built with React, TypeScript, and Tailwind CSS. Provides live telemetry maps, fleet status grids, and primary action overrides.
* **AeroSwift Mobile App:** Built with React Native. Provides Tesla-style status cards, digital key pairing (BLE/NFC), sentry camera feeds, and climate scheduling.

---

## 4. Getting Started

### 4.1 Running the Web Control Dashboard
To launch the React web control panel locally:
```bash
cd software/web_app
pnpm install
pnpm dev
```

### 4.2 Running the Mobile App
To run the React Native mobile app via Expo:
```bash
cd software/mobile_app
pnpm install
npx expo start
```

---

## 5. Academic & Research Publications

We are actively compiling our designs for peer-reviewed academic publications. Drafts are located in `docs/academic/` and are prepared for:
* **IEEE Transactions on Intelligent Vehicles (T-IV)**
* **IEEE Transactions on Robotics (T-RO)**
* **TechRxiv (IEEE pre-print)**
* **Zenodo (CERN open-science repository)**

---

## License

Copyright © 2026 American Group LLC. All Rights Reserved.  
Patents Pending.
