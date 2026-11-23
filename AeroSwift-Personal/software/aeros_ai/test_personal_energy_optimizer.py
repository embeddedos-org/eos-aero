"""
Regression tests for the AeroSwift-Personal (AS-1/2) energy optimizer.

The speed limit below is the one in AeroSwift-Personal/README.md
("Key Specifications": Max Cruise Speed 180 km/h).
"""

import importlib.util
import os
import sys

import pytest

# Load this directory's energy_optimizer.py under its own name, so these tests
# can run in one pytest session with the AeroSwift-Transit ones.
_spec = importlib.util.spec_from_file_location(
    "personal_energy_optimizer",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "energy_optimizer.py"),
)
_mod = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = _mod
_spec.loader.exec_module(_mod)
AircraftState = _mod.AircraftState
EnergyOptimizer = _mod.EnergyOptimizer
EnergyState = _mod.EnergyState

AS12_MAX_CRUISE_SPEED_MS = 180.0 / 3.6  # 50 m/s


def _cruise_inputs(alt_m):
    state = AircraftState(
        lat=37.7749, lon=-122.4194, alt_m=alt_m,
        speed_ms=45.0, heading_deg=90.0,
        roll_deg=0.5, pitch_deg=2.0,
        wind_speed_ms=5.0, wind_dir_deg=270.0,
    )
    energy = EnergyState(
        battery_soc_pct=72.0, battery_voltage_v=748.0,
        solar_power_w=2800.0, motor_power_w=18000.0,
        regen_power_w=0.0, estimated_range_km=180.0,
    )
    return state, energy


@pytest.mark.parametrize("alt_m", [0.0, 1200.0, 3000.0])
def test_best_range_speed_within_max_cruise_speed(alt_m):
    speed = EnergyOptimizer().compute_best_range_speed(alt_m)
    assert speed <= AS12_MAX_CRUISE_SPEED_MS


@pytest.mark.parametrize("alt_m", [0.0, 1200.0, 3000.0])
def test_recommended_speed_within_max_cruise_speed(alt_m):
    state, energy = _cruise_inputs(alt_m)
    cmd = EnergyOptimizer().optimize(state, energy, vertical_speed_ms=0.1, motors_active=True)
    assert cmd.recommended_speed_ms <= AS12_MAX_CRUISE_SPEED_MS
