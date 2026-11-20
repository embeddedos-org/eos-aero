"""
Regression tests for the AeroSwift-Transit (AS-10) energy optimizer.

The airframe figures below are the ones in AeroSwift-Transit/README.md
("Key Specifications"). The optimizer must use them, not the AS-1/2 ones.
"""

import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from energy_optimizer import AircraftState, EnergyOptimizer, EnergyState  # noqa: E402

AS10_MTOW_KG = 4200.0
AS10_WINGSPAN_M = 18.5
AS10_WING_AREA_M2 = 48.0
AS10_VTOL_MOTORS = 12


def _cruise_inputs():
    state = AircraftState(
        lat=37.70, lon=-122.40, alt_m=1500.0,
        speed_ms=62.0, heading_deg=215.0,
        roll_deg=0.0, pitch_deg=1.0,
        wind_speed_ms=4.0, wind_dir_deg=270.0,
    )
    energy = EnergyState(
        battery_soc_pct=62.0, battery_voltage_v=798.5,
        solar_power_w=12400.0, motor_power_w=48000.0,
        regen_power_w=0.0, estimated_range_km=240.0,
    )
    return state, energy


def test_one_vtol_rpm_target_per_lift_motor():
    state, energy = _cruise_inputs()
    cmd = EnergyOptimizer().optimize(state, energy, vertical_speed_ms=0.0, motors_active=True)
    assert len(cmd.vtol_rpm_targets) == AS10_VTOL_MOTORS


def test_airframe_constants_match_as10_spec():
    opt = EnergyOptimizer()
    assert opt.MTOW_KG == AS10_MTOW_KG
    assert opt.WING_AREA_M2 == AS10_WING_AREA_M2
    assert opt.ASPECT_RATIO == pytest.approx(AS10_WINGSPAN_M ** 2 / AS10_WING_AREA_M2)
