# AeroSwift: A Solar-Hybrid VTOL Personal Air Vehicle with AI-Assisted Energy Optimization

**Authors:** American Group LLC Engineering Team  
**Affiliation:** American Group LLC, United States  
**Status:** Pre-print Draft — TechRxiv / IEEE T-IV Submission Target  
**Date:** May 2026

---

## Abstract

This paper presents the design, architecture, and preliminary analysis of **AeroSwift**, a family of solar-hybrid vertical takeoff and landing (VTOL) personal air vehicles targeting middle-class consumer and commercial transit markets. The AeroSwift platform combines a high-aspect-ratio fixed-wing glider body with eight distributed VTOL lift motors featuring magnetic levitation (MagLev) bearings, a 90 kWh semi-solid-state lithium-metal battery, and 12 m² of flexible perovskite-on-silicon tandem solar film. An onboard **AeroOS AI Flight Optimizer** running on a 32-TOPS neural processing unit manages dynamic gliding, thermal updraft harvesting, and variable-speed cruise to achieve an estimated **10× energy efficiency improvement** over conventional quadrotor designs at equivalent payload. We present the system architecture, propulsion analysis, energy budget, and a preliminary regulatory compliance roadmap targeting FAA Part 21.17(b) Special Class certification.

**Keywords:** eVTOL, Urban Air Mobility, Solar Aviation, Hybrid Propulsion, AI Flight Control, MagLev Motors, Perovskite Solar

---

## 1. Introduction

The global urban air mobility (UAM) market is projected to grow at a compound annual growth rate of 12.3% through 2035, driven by increasing urban congestion and advances in electric propulsion. However, existing eVTOL designs predominantly employ multirotor configurations that suffer from fundamental aerodynamic inefficiency: a pure quadrotor must continuously expend energy to counteract gravity, consuming approximately 200–400 Wh/km at passenger-carrying payloads.

The AeroSwift platform addresses this limitation through a hybrid VTOL + fixed-wing architecture that transitions from vertical hover to aerodynamic cruise, reducing cruise power consumption by an estimated 85% compared to a pure multirotor. Combined with solar energy harvesting, dynamic gliding, and AI-assisted energy management, the system targets a practical consumer range of 220–310 km on a single charge.

---

## 2. System Architecture

The AeroSwift-Personal (AS-1/2) employs a tandem-boom configuration with a central fuselage, foldable high-aspect-ratio wings (AR = 5.5), and eight vertically-oriented VTOL lift motors embedded in dual aerodynamic booms. Two rear push-pull propellers provide cruise thrust. The transition from VTOL to cruise is managed by the AeroOS GNC subsystem, which gradually throttles the VTOL motors as wing-generated lift exceeds aircraft weight.

### 2.1 Propulsion System

The VTOL motors are custom-designed 35 kW outrunner BLDC motors with permanent-magnet magnetic levitation bearings. The MagLev bearing design eliminates the mechanical contact friction of conventional steel ball bearings, reducing rotational losses by an estimated 4.8% and extending motor service life to over 20,000 flight hours.

### 2.2 Energy System

The primary energy source is a 90 kWh semi-solid-state lithium-metal battery with an energy density of 380 Wh/kg. The battery is organized into four modular 22.5 kWh packs that can be individually hot-swapped at vertiports, enabling rapid turnaround. The secondary energy source is a 12 m² perovskite-on-silicon tandem solar array laminated onto the wing upper surface, providing up to 3.4 kW of supplemental power under peak solar irradiance.

### 2.3 AeroOS AI Flight Optimizer

The AeroOS AI Flight Optimizer runs on the Rockchip RK3588S NPU at 10 Hz. It implements a Holt-Winters double exponential smoothing model for wind speed prediction and a barometric variometer algorithm for thermal updraft detection. When a sustained thermal column (vertical speed > 0.5 m/s for > 3 seconds without motor thrust) is detected, the optimizer commands a motor-off glide phase, during which the rear propellers operate in regenerative mode to recover kinetic energy.

---

## 3. Energy Budget Analysis

| Flight Phase | Duration (min) | Power Draw (kW) | Energy Used (kWh) |
| :--- | :--- | :--- | :--- |
| VTOL Takeoff (0–50m) | 2 | 280 | 9.3 |
| Transition (50m → cruise alt) | 3 | 180 | 9.0 |
| Cruise (120 km at 180 km/h) | 40 | 18 | 12.0 |
| Thermal Glide (est. 40 km) | 13 | 0 (regen: −2) | −0.4 |
| Transition (descent) | 3 | 80 | 4.0 |
| VTOL Landing | 2 | 240 | 8.0 |
| **Total** | **63** | — | **41.9** |

With a 90 kWh battery, this provides a theoretical range of approximately **220 km** under conservative conditions. Solar supplementation adds an estimated 3.4 kWh/hour of cruise, extending range to **310 km** under optimal conditions.

---

## 4. Regulatory Compliance Strategy

The AeroSwift-Personal targets certification under **FAA Part 21.17(b)** as a "Special Class" powered-lift aircraft. This pathway requires the applicant to demonstrate airworthiness through a combination of FAA-approved consensus standards (ASTM F3345 for eVTOL airworthiness) and DO-178C Level A software assurance for the AeroOS flight control software.

---

## 5. Conclusion

The AeroSwift platform represents a technically credible pathway toward affordable, ultra-efficient personal air mobility. By combining hybrid VTOL + fixed-wing aerodynamics, perovskite solar harvesting, MagLev motor efficiency, and AI-assisted energy management, the system targets a 10× energy efficiency improvement over conventional multirotor designs. Future work will focus on prototype construction, wind tunnel validation of the transition flight regime, and formal FAA certification engagement.

---

## References

[1] J. Zhang, "Overall eVTOL aircraft design for urban air mobility," *ScienceDirect*, 2024.  
[2] Embention, "The future of Urban Air Mobility," *Embention White Papers*, 2026.  
[3] GSL Energy, "Semi-Solid State Battery Technology for UAV," 2026.  
[4] Federal Aviation Administration, "Advanced Air Mobility and Powered-Lift Regulations," 2024.  
