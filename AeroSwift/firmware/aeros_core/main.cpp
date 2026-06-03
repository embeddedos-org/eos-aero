/**
 * AeroOS Core — Real-Time Flight Control Kernel
 * AeroSwift-Personal (AS-1/2)
 *
 * Copyright (c) 2026 American Group LLC. All Rights Reserved.
 * Patents Pending.
 *
 * Architecture:
 *   - Primary SoC: Rockchip RK3588S (AeroOS AI + mission planning)
 *   - Co-Processor: STM32H7B3 (hard real-time motor control @ 1kHz)
 *   - Middleware: ROS 2 Humble (inter-process communication)
 *   - RTOS: FreeRTOS on STM32H7B3 co-processor
 *
 * Flight Phases:
 *   PREFLIGHT -> VTOL_TAKEOFF -> TRANSITION -> CRUISE -> TRANSITION_LAND -> VTOL_LAND -> SHUTDOWN
 */

#include <cstdint>
#include <array>
#include <atomic>
#include "aeros_core/flight_state_machine.hpp"
#include "aeros_core/safety_monitor.hpp"
#include "gnc/guidance_controller.hpp"
#include "gnc/navigation_filter.hpp"
#include "ems/energy_manager.hpp"
#include "fdr/fault_detector.hpp"
#include "drivers/motor_controller.hpp"
#include "drivers/imu_driver.hpp"
#include "drivers/gps_driver.hpp"
#include "drivers/lidar_driver.hpp"
#include "ros2/aeros_node.hpp"

namespace aeros {

// ─── System Constants ────────────────────────────────────────────────────────

static constexpr uint32_t GNC_LOOP_HZ       = 1000;   // 1 kHz hard real-time GNC loop
static constexpr uint32_t AI_OPTIMIZER_HZ   = 10;     // 10 Hz AI energy optimization
static constexpr uint32_t TELEMETRY_HZ      = 50;     // 50 Hz telemetry broadcast
static constexpr uint8_t  NUM_VTOL_MOTORS   = 8;
static constexpr uint8_t  NUM_CRUISE_MOTORS = 2;
static constexpr float    MAX_TILT_ANGLE_DEG = 30.0f; // Max safe tilt during transition

// ─── Flight State Machine ────────────────────────────────────────────────────

enum class FlightPhase : uint8_t {
    PREFLIGHT       = 0,
    VTOL_TAKEOFF    = 1,
    TRANSITION_UP   = 2,
    CRUISE          = 3,
    THERMAL_GLIDE   = 4,   // AI-detected thermal updraft, motors off
    TRANSITION_DOWN = 5,
    VTOL_LAND       = 6,
    EMERGENCY       = 7,
    SHUTDOWN        = 8
};

// ─── Main Entry Point ────────────────────────────────────────────────────────

int main() {
    // Initialize hardware drivers
    ImuDriver imu(ImuDriver::Config{
        .device    = "/dev/spi0",
        .sample_hz = GNC_LOOP_HZ,
        .range_dps = 300.0f,
        .range_g   = 8.0f
    });

    GpsDriver gps(GpsDriver::Config{
        .port      = "/dev/uart2",
        .baud_rate = 460800,
        .rtk_mode  = true
    });

    LidarDriver lidar(LidarDriver::Config{
        .port        = "/dev/uart3",
        .range_m     = 200.0f,
        .fov_degrees = 360.0f
    });

    MotorController motors(MotorController::Config{
        .num_vtol_motors   = NUM_VTOL_MOTORS,
        .num_cruise_motors = NUM_CRUISE_MOTORS,
        .maglev_enabled    = true,
        .max_rpm_vtol      = 4200,
        .max_rpm_cruise    = 2800
    });

    // Initialize subsystems
    NavigationFilter nav_filter;
    GuidanceController guidance;
    EnergyManager ems;
    FaultDetector fdr;
    SafetyMonitor safety;

    // Initialize ROS 2 node for telemetry and ground station comms
    AerosNode ros_node("aeroswift_personal");

    // Run preflight checks
    if (!safety.run_preflight_checks(imu, gps, lidar, motors, ems)) {
        ros_node.publish_alert("PREFLIGHT_FAIL", safety.get_fault_report());
        return -1;
    }

    // ─── Main Control Loop ────────────────────────────────────────────────
    FlightPhase phase = FlightPhase::PREFLIGHT;
    std::atomic<bool> running{true};

    while (running.load()) {
        // 1. Read sensor data (1 kHz)
        auto imu_data   = imu.read();
        auto gps_data   = gps.read();
        auto lidar_data = lidar.read();

        // 2. Run navigation filter (EKF-based visual-inertial odometry)
        auto nav_state = nav_filter.update(imu_data, gps_data);

        // 3. Run fault detection
        auto faults = fdr.check(imu_data, gps_data, motors.get_status(), ems.get_status());
        if (faults.critical) {
            phase = FlightPhase::EMERGENCY;
            safety.deploy_emergency_parachute();
        }

        // 4. Run guidance controller based on current flight phase
        MotorCommands cmds;
        switch (phase) {
            case FlightPhase::VTOL_TAKEOFF:
                cmds = guidance.compute_vtol_hover(nav_state, lidar_data);
                break;
            case FlightPhase::TRANSITION_UP:
                cmds = guidance.compute_transition(nav_state, /*to_cruise=*/true);
                if (guidance.transition_complete()) phase = FlightPhase::CRUISE;
                break;
            case FlightPhase::CRUISE:
                cmds = guidance.compute_cruise(nav_state);
                // AI checks for thermal glide opportunity every 100ms
                if (ems.thermal_glide_available()) phase = FlightPhase::THERMAL_GLIDE;
                break;
            case FlightPhase::THERMAL_GLIDE:
                cmds = guidance.compute_thermal_glide(nav_state);
                motors.set_cruise_regen_mode(true);  // Regenerative braking
                if (!ems.thermal_glide_available()) {
                    motors.set_cruise_regen_mode(false);
                    phase = FlightPhase::CRUISE;
                }
                break;
            case FlightPhase::VTOL_LAND:
                cmds = guidance.compute_vtol_land(nav_state, lidar_data);
                if (guidance.landed()) phase = FlightPhase::SHUTDOWN;
                break;
            default:
                break;
        }

        // 5. Apply motor commands
        motors.apply(cmds);

        // 6. Publish telemetry at 50 Hz
        ros_node.publish_telemetry(nav_state, ems.get_status(), phase);
    }

    return 0;
}

} // namespace aeros
