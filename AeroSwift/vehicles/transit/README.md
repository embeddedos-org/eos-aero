# AeroSwift-Transit (AS-10)
### 10-Passenger Urban Air Mobility Shuttle — Solar-Hybrid VTOL

**Organization:** American Group LLC  
**Product Line:** AeroSwift Platform  
**Version:** 0.1.0-alpha  
**Status:** Pre-Prototype Design Phase  
**License:** Proprietary — American Group LLC

---

![AeroSwift Transit Concept Render](assets/concept_render.png)

---

## Overview

**AeroSwift-Transit (AS-10)** is a 10-passenger urban air mobility (UAM) shuttle designed for commercial air taxi networks and municipal mass transit. It scales the same proven AeroSwift hybrid VTOL + fixed-wing architecture to carry **10 passengers plus luggage** over a range of up to **460 km** on a single charge under solar-assisted conditions.

The AS-10 uses a **480 kWh pure solid-state silicon-anode battery** pack, **48 m² of perovskite solar film** across its high-aspect-ratio wings, and **12× 90 kW MagLev BLDC lift motors** arranged in a distributed boom configuration. The **AeroOS AI Flight Optimizer** manages the full energy lifecycle, from vertiport-to-vertiport route planning to real-time thermal harvesting and regenerative descent.

![System Architecture](assets/system_architecture.png)

---

## Key Specifications

| Parameter | Value |
| :--- | :--- |
| **Capacity** | 10 Passengers + Luggage (max payload 1,100 kg) |
| **Wingspan** | 18.5 m (Fixed high-aspect ratio) |
| **Overall Length** | 12.8 m |
| **Max Takeoff Weight (MTOW)** | 4,200 kg |
| **Battery Chemistry** | Pure Solid-State Silicon-Anode (450 Wh/kg) |
| **Battery Capacity** | 480 kWh |
| **VTOL Lift Motors** | 12× 90 kW MagLev Brushless DC Motors |
| **Cruise Propulsion** | 4× 120 kW Distributed Ducted Fans |
| **Solar Wing Area** | 48 m² (~13.6 kW peak generation) |
| **Max Cruise Speed** | 240 km/h (150 mph) |
| **Range (Battery Only)** | 380 km (236 miles) |
| **Range (Solar-Assisted)** | Up to 460 km (285 miles) |
| **Structural Materials** | Aerospace-Grade Prepreg Carbon-Fiber & Titanium |
| **Target Fleet Price** | $850,000 USD |
| **FAA Certification Path** | Part 135 Air Carrier Certificate |

---

## Repository Structure

```
AeroSwift-Transit/
├── hardware/
│   ├── pcb/                     # KiCad ECAD schematics & PCB layouts
│   │   ├── flight_computer/     # Triple-redundant AeroOS flight computer
│   │   ├── ems_board/           # High-voltage Energy Management System PCB
│   │   ├── motor_driver/        # 12-channel 90kW MagLev BLDC driver array
│   │   ├── sensor_hub/          # Sensor fusion hub (IMU, LiDAR, GPS, ADS-B)
│   │   └── cabin_systems/       # Passenger cabin IFE & safety systems
│   ├── cad/                     # Mechanical CAD (STEP, IGES, STL)
│   │   ├── fuselage/            # Wide-body fuselage & passenger cabin
│   │   ├── wings/               # Fixed high-aspect-ratio wing assembly
│   │   ├── boom_assembly/       # Dual-boom VTOL motor structures
│   │   ├── ducted_fans/         # Rear ducted fan nacelles
│   │   └── landing_gear/        # Retractable main & nose gear
│   ├── bom/                     # Bill of Materials
│   │   ├── bom_master.csv       # Master BOM (all assemblies)
│   │   ├── bom_pcb.csv          # PCB-level BOM
│   │   └── bom_mechanical.csv   # Mechanical BOM
│   └── antenna/                 # RF antenna designs (GPS, LTE, ADS-B, V2X)
├── firmware/
│   ├── aeros_core/              # AeroOS real-time kernel (C++20, TMR)
│   ├── gnc/                     # Guidance, Navigation & Control (dual-redundant)
│   ├── ems/                     # High-voltage Energy Management System
│   └── fdr/                     # Triple Modular Redundancy fault detection
├── software/
│   ├── aeros_ai/                # Python: AI route optimizer & thermal map
│   ├── ground_station/          # React: Air traffic & fleet management dashboard
│   └── fleet_manager/           # Node.js: Fleet scheduling & vertiport API
├── docs/
│   ├── specs/                   # Technical specifications & datasheets
│   ├── regulatory/              # FAA Part 135 certification documents
│   └── academic/                # White papers & journal submissions
├── assets/                      # Concept renders & marketing visuals
└── README.md
```

---

## Technology Stack

### Hardware
* **Flight Computer SoC:** Dual Rockchip RK3588S in TMR (Triple Modular Redundancy) voting configuration
* **Co-Processor:** 3× STM32H7B3 (ARM Cortex-M7 @ 280 MHz) — one per redundancy channel
* **VTOL Motors:** 12× Custom 90 kW Outrunner BLDC with Permanent-Magnet MagLev Bearings
* **Cruise Propulsion:** 4× 120 kW Carbon-Fiber Composite Ducted Fans
* **Battery:** 480 kWh Pure Solid-State Silicon-Anode (Modular 8× 60 kWh packs, hot-swappable)
* **Solar:** 48 m² Perovskite-on-Silicon Tandem Film (28.5% efficiency, 0.25 kg/m²)
* **IMU:** Dual Epson G362P (6-DOF, cross-validated)
* **LiDAR:** 360° Solid-State LiDAR Array (300m range)
* **GPS/GNSS:** Triple-frequency RTK GPS with ADS-B In/Out transponder
* **V2X Comms:** Autotalks TEKTON3 (DSRC + C-V2X) + 5G mmWave modem

### Software
* **AeroOS Core:** C++20 real-time flight control kernel, DO-178C Level A compliant design
* **TMR Voting Module:** Hardware-enforced triple modular redundancy with Byzantine fault tolerance
* **AI Route Optimizer:** PyTorch Lite model for city-wide route optimization and vertiport scheduling
* **Fleet Manager:** Node.js microservice for multi-aircraft fleet coordination and vertiport APIs
* **Ground Station:** React + TypeScript air traffic management dashboard

---

## Safety Architecture: Triple Modular Redundancy (TMR)

The AS-10 implements **Triple Modular Redundancy (TMR)** across all flight-critical systems, meeting the stringent requirements of FAA Part 135 commercial operations.

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  FCC-A       │   │  FCC-B       │   │  FCC-C       │
│ (Primary)    │   │ (Secondary)  │   │ (Tertiary)   │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                   [ TMR Voter Logic ]
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
      [ Motor Controllers ]   [ Control Surfaces ]
```

Any single flight computer failure is automatically detected and overridden by the remaining two computers. A second failure triggers an automatic emergency landing sequence.

---

## Fleet Operations

The AeroSwift-Transit is designed for **vertiport-to-vertiport** commercial operations.

* **Vertiport Integration:** Compatible with the Urban Air Mobility Consortium (UAMC) vertiport standard, supporting automated docking, battery hot-swap, and passenger boarding in under 8 minutes.
* **Fleet Manager API:** RESTful API for scheduling, route assignment, and real-time telemetry aggregation across a fleet of up to 200 aircraft.
* **Autonomous Operations:** Capable of fully autonomous operations under FAA BVLOS (Beyond Visual Line of Sight) waiver, with a remote pilot monitoring up to 10 aircraft simultaneously.

---

## Regulatory Compliance

| Regulation | Status | Notes |
| :--- | :--- | :--- |
| FAA Part 135 Air Carrier | In Design | Commercial air taxi certification |
| FAA Part 21 Type Certificate | In Design | Powered-lift type certificate |
| DO-178C Level A (Software) | Planned | Flight-critical software assurance |
| DO-254 Level A (Hardware) | Planned | Flight-critical hardware assurance |
| DO-160G (Environmental) | Planned | EMI, temperature, vibration testing |
| ASTM F3345 (eVTOL) | Planned | Consensus standard for UAM |
| EASA SC-VTOL | Planned | European market certification |

---

## Roadmap

| Milestone | Target Date | Description |
| :--- | :--- | :--- |
| Architecture Design | Q2 2026 | This document |
| PCB Prototype v0.1 | Q1 2027 | Flight computer & EMS boards |
| Structural Prototype | Q3 2027 | Full-scale carbon-fiber airframe |
| Ground Testing | Q1 2028 | Propulsion, EMS, and TMR validation |
| First Hover Test | Q3 2028 | Tethered VTOL hover with full payload |
| Full Flight Test | Q2 2029 | First untethered passenger flight |
| FAA Part 135 Cert | 2030–2031 | Commercial certification |
| Commercial Launch | 2032 | Fleet sales to air taxi operators |

---

## Contributing

This is a proprietary American Group LLC product. Internal contributors should follow the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines. Municipal and transit authority partnerships are welcome — contact partnerships@americangroupllc.com.

---

## License

Copyright © 2026 American Group LLC. All Rights Reserved.  
Patents Pending.
