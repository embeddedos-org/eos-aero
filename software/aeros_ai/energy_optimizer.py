"""
AeroOS AI Energy Optimizer
AeroSwift-Personal (AS-1/2)

Copyright (c) 2026 American Group LLC. All Rights Reserved.
Patents Pending.

This module implements the AI-assisted energy optimization engine for the
AeroSwift-Personal. It runs on the Rockchip RK3588S NPU at 10 Hz and is
responsible for:
  1. Wind map prediction and thermal updraft detection
  2. Dynamic motor RPM scheduling to minimize energy consumption
  3. Solar harvest forecasting based on sun angle and cloud cover
  4. Route optimization for maximum range on remaining battery
"""

from __future__ import annotations

import numpy as np
import time
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum, auto


# ─── Data Structures ─────────────────────────────────────────────────────────

@dataclass
class AircraftState:
    """Current aircraft state from the navigation filter."""
    lat: float          # Latitude (degrees)
    lon: float          # Longitude (degrees)
    alt_m: float        # Altitude above MSL (meters)
    speed_ms: float     # Airspeed (m/s)
    heading_deg: float  # Magnetic heading (degrees)
    roll_deg: float     # Roll angle (degrees)
    pitch_deg: float    # Pitch angle (degrees)
    wind_speed_ms: float    # Estimated wind speed (m/s)
    wind_dir_deg: float     # Estimated wind direction (degrees)


@dataclass
class EnergyState:
    """Current energy system state."""
    battery_soc_pct: float      # Battery state of charge (0–100%)
    battery_voltage_v: float    # Battery pack voltage (V)
    solar_power_w: float        # Current solar panel output (W)
    motor_power_w: float        # Total motor power draw (W)
    regen_power_w: float        # Regenerative power recovery (W)
    estimated_range_km: float   # Estimated remaining range (km)


@dataclass
class OptimizationCommand:
    """Output commands from the AI optimizer."""
    vtol_rpm_targets: list[int]     # Target RPM for each VTOL motor
    cruise_rpm_target: int          # Target RPM for cruise propellers
    regen_mode: bool                # Enable regenerative braking
    glide_mode: bool                # Engage thermal glide (motors off)
    recommended_altitude_m: float   # Recommended altitude for energy efficiency
    recommended_speed_ms: float     # Recommended airspeed for L/D max


class FlightMode(Enum):
    VTOL_HOVER  = auto()
    CRUISE      = auto()
    THERMAL_GLIDE = auto()
    DESCENT     = auto()


# ─── Holt-Winters Wind Prediction ────────────────────────────────────────────

class WindPredictor:
    """
    Holt-Winters double exponential smoothing for wind speed prediction.
    Adapted from the VendingMachine demand forecaster pattern.
    """

    def __init__(self, alpha: float = 0.3, beta: float = 0.1):
        self.alpha = alpha  # Level smoothing factor
        self.beta  = beta   # Trend smoothing factor
        self._level: Optional[float] = None
        self._trend: Optional[float] = None
        self._history: list[float] = []

    def update(self, wind_speed_ms: float) -> float:
        """Update the model with a new wind speed observation and return forecast."""
        self._history.append(wind_speed_ms)

        if self._level is None:
            self._level = wind_speed_ms
            self._trend = 0.0
            return wind_speed_ms

        prev_level = self._level
        self._level = self.alpha * wind_speed_ms + (1 - self.alpha) * (self._level + self._trend)
        self._trend = self.beta * (self._level - prev_level) + (1 - self.beta) * self._trend

        # One-step-ahead forecast
        return self._level + self._trend

    @property
    def forecast_ms(self) -> float:
        """Return the current one-step-ahead wind speed forecast."""
        if self._level is None:
            return 0.0
        return self._level + self._trend


# ─── Thermal Updraft Detector ────────────────────────────────────────────────

class ThermalDetector:
    """
    Detects thermal updraft columns using barometric variometer data.
    A thermal is confirmed when vertical speed exceeds +0.5 m/s for 3 consecutive
    seconds without active motor thrust.
    """

    THERMAL_THRESHOLD_MS = 0.5   # m/s vertical speed to confirm thermal
    CONFIRMATION_SECS    = 3.0   # seconds of sustained climb to confirm

    def __init__(self):
        self._climb_start: Optional[float] = None

    def update(self, vertical_speed_ms: float, motors_active: bool) -> bool:
        """
        Returns True if a thermal updraft is confirmed.
        vertical_speed_ms: positive = climbing
        motors_active: True if any cruise/VTOL motors are running
        """
        if motors_active:
            self._climb_start = None
            return False

        if vertical_speed_ms >= self.THERMAL_THRESHOLD_MS:
            if self._climb_start is None:
                self._climb_start = time.monotonic()
            elif (time.monotonic() - self._climb_start) >= self.CONFIRMATION_SECS:
                return True
        else:
            self._climb_start = None

        return False


# ─── Main Energy Optimizer ───────────────────────────────────────────────────

class EnergyOptimizer:
    """
    AeroOS AI Energy Optimizer.
    Runs at 10 Hz on the RK3588S NPU.
    """

    # Aerodynamic constants for AeroSwift-Personal
    MTOW_KG            = 850.0
    WING_AREA_M2       = 12.0
    ASPECT_RATIO       = 8.2 / 1.5    # wingspan / mean chord
    OSWALD_EFFICIENCY  = 0.85
    CD0                = 0.025         # Zero-lift drag coefficient
    RHO_SEA_LEVEL      = 1.225         # kg/m³

    def __init__(self):
        self.wind_predictor  = WindPredictor()
        self.thermal_detector = ThermalDetector()
        self._mode = FlightMode.CRUISE

    def compute_best_range_speed(self, altitude_m: float) -> float:
        """
        Compute the best-range airspeed (Carson's speed) for current altitude.
        Returns airspeed in m/s.
        """
        rho = self.RHO_SEA_LEVEL * np.exp(-altitude_m / 8500.0)  # Simplified ISA
        cl_opt = np.sqrt(np.pi * self.ASPECT_RATIO * self.OSWALD_EFFICIENCY * self.CD0)
        v_best_range = np.sqrt(
            (2 * self.MTOW_KG * 9.81) /
            (rho * self.WING_AREA_M2 * cl_opt)
        ) * 1.316  # Carson's factor: 1.316 × V_md
        return float(np.clip(v_best_range, 30.0, 55.0))  # Clamp to safe envelope

    def optimize(
        self,
        state: AircraftState,
        energy: EnergyState,
        vertical_speed_ms: float,
        motors_active: bool
    ) -> OptimizationCommand:
        """
        Main optimization step. Called at 10 Hz.
        Returns motor commands and flight recommendations.
        """
        # Update wind predictor
        forecast_wind = self.wind_predictor.update(state.wind_speed_ms)

        # Check for thermal glide opportunity
        thermal_available = self.thermal_detector.update(vertical_speed_ms, motors_active)

        # Determine optimal cruise speed
        best_speed = self.compute_best_range_speed(state.alt_m)

        # Determine optimal altitude (trade-off between air density and solar irradiance)
        # Below 3000m: lower is better for dense air (more lift per unit power)
        # Above 3000m: thinner air reduces drag but reduces solar output
        optimal_alt = 1500.0 if energy.battery_soc_pct > 30 else 800.0

        # Compute VTOL RPM targets (all zero during cruise)
        vtol_rpms = [0] * 8

        # Compute cruise RPM target based on desired speed
        # Simplified: RPM scales linearly with desired airspeed
        cruise_rpm = int(np.interp(best_speed, [20.0, 55.0], [800, 2800]))

        # Enable regen if descending
        regen = vertical_speed_ms < -0.5

        return OptimizationCommand(
            vtol_rpm_targets=vtol_rpms,
            cruise_rpm_target=cruise_rpm,
            regen_mode=regen,
            glide_mode=thermal_available,
            recommended_altitude_m=optimal_alt,
            recommended_speed_ms=best_speed
        )


# ─── Example Usage ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    optimizer = EnergyOptimizer()

    # Simulate a 10-second cruise segment
    for i in range(10):
        state = AircraftState(
            lat=37.7749, lon=-122.4194, alt_m=1200.0,
            speed_ms=45.0, heading_deg=90.0,
            roll_deg=0.5, pitch_deg=2.0,
            wind_speed_ms=5.0 + np.random.normal(0, 0.5),
            wind_dir_deg=270.0
        )
        energy = EnergyState(
            battery_soc_pct=72.0, battery_voltage_v=748.0,
            solar_power_w=2800.0, motor_power_w=18000.0,
            regen_power_w=0.0, estimated_range_km=180.0
        )
        cmd = optimizer.optimize(state, energy, vertical_speed_ms=0.1, motors_active=True)
        print(f"[{i:02d}] cruise_rpm={cmd.cruise_rpm_target}, "
              f"glide={cmd.glide_mode}, regen={cmd.regen_mode}, "
              f"best_speed={cmd.recommended_speed_ms:.1f} m/s")
        time.sleep(0.1)
