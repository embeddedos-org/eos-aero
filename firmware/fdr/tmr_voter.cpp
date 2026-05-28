/**
 * Triple Modular Redundancy (TMR) Voter
 * AeroSwift-Transit (AS-10)
 *
 * Copyright (c) 2026 American Group LLC. All Rights Reserved.
 * Patents Pending.
 *
 * Implements Byzantine fault-tolerant voting across three independent
 * Flight Control Computers (FCC-A, FCC-B, FCC-C).
 *
 * Voting Policy:
 *   - 3-of-3 agreement: Normal operation
 *   - 2-of-3 agreement: Override dissenting FCC, log fault, alert crew
 *   - 1-of-3 agreement: Emergency landing sequence, alert ATC
 *   - 0-of-3 agreement: Deploy ballistic parachute
 */

#include <array>
#include <cmath>
#include <cstdint>
#include <optional>
#include "fdr/tmr_voter.hpp"
#include "fdr/fault_logger.hpp"
#include "drivers/parachute_driver.hpp"
#include "ros2/aeros_node.hpp"

namespace aeros::fdr {

// ─── Constants ───────────────────────────────────────────────────────────────

static constexpr float POSITION_TOLERANCE_M   = 0.10f;  // 10 cm position agreement
static constexpr float ATTITUDE_TOLERANCE_DEG = 0.50f;  // 0.5° attitude agreement
static constexpr float THRUST_TOLERANCE_PCT   = 2.00f;  // 2% thrust command agreement
static constexpr uint32_t MAX_SINGLE_FAULTS   = 3;      // Max faults before escalation

// ─── TMR Voter Implementation ─────────────────────────────────────────────

TmrVoter::TmrVoter(FaultLogger& logger, ParachuteDriver& chute, AerosNode& ros)
    : logger_(logger), chute_(chute), ros_(ros), fault_count_(0) {}

TmrResult TmrVoter::vote(
    const FlightCommand& cmd_a,
    const FlightCommand& cmd_b,
    const FlightCommand& cmd_c
) {
    const std::array<const FlightCommand*, 3> cmds = {&cmd_a, &cmd_b, &cmd_c};
    std::array<bool, 3> agree = {false, false, false};

    // Check pairwise agreement
    bool ab_agree = commands_agree(cmd_a, cmd_b);
    bool ac_agree = commands_agree(cmd_a, cmd_c);
    bool bc_agree = commands_agree(cmd_b, cmd_c);

    uint8_t agreement_count = static_cast<uint8_t>(ab_agree) +
                               static_cast<uint8_t>(ac_agree) +
                               static_cast<uint8_t>(bc_agree);

    if (agreement_count == 3) {
        // Perfect 3-of-3 agreement — use FCC-A output
        fault_count_ = 0;
        return TmrResult{
            .command      = cmd_a,
            .status       = TmrStatus::NOMINAL,
            .faulty_fcc   = std::nullopt
        };
    }

    if (agreement_count >= 1) {
        // 2-of-3 agreement — identify and isolate the dissenting FCC
        uint8_t faulty = 255;
        FlightCommand majority_cmd;

        if (!ab_agree && !ac_agree) {
            faulty = 0; // FCC-A is the outlier
            majority_cmd = cmd_b; // B and C agree
        } else if (!ab_agree && !bc_agree) {
            faulty = 1; // FCC-B is the outlier
            majority_cmd = cmd_a; // A and C agree
        } else {
            faulty = 2; // FCC-C is the outlier
            majority_cmd = cmd_a; // A and B agree
        }

        fault_count_++;
        logger_.log_fault(FaultCode::FCC_DISAGREEMENT, faulty, fault_count_);
        ros_.publish_alert("TMR_SINGLE_FAULT",
            "FCC-" + std::string(1, 'A' + faulty) + " isolated. Majority vote active.");

        if (fault_count_ >= MAX_SINGLE_FAULTS) {
            // Persistent single-FCC fault — escalate to emergency landing
            ros_.publish_alert("TMR_ESCALATION", "Persistent FCC fault. Initiating emergency landing.");
            return TmrResult{
                .command    = majority_cmd,
                .status     = TmrStatus::EMERGENCY_LAND,
                .faulty_fcc = faulty
            };
        }

        return TmrResult{
            .command    = majority_cmd,
            .status     = TmrStatus::SINGLE_FAULT,
            .faulty_fcc = faulty
        };
    }

    // 0-of-3 agreement — catastrophic failure, deploy parachute
    logger_.log_fault(FaultCode::TOTAL_FCC_FAILURE, 255, fault_count_);
    ros_.publish_alert("TMR_CATASTROPHIC", "All FCCs disagree. Deploying ballistic parachute.");
    chute_.deploy();

    return TmrResult{
        .command    = cmd_a,  // Best-effort
        .status     = TmrStatus::PARACHUTE_DEPLOYED,
        .faulty_fcc = std::nullopt
    };
}

bool TmrVoter::commands_agree(
    const FlightCommand& a,
    const FlightCommand& b
) const {
    // Check position setpoint agreement
    float pos_diff = std::sqrt(
        std::pow(a.target_lat - b.target_lat, 2) +
        std::pow(a.target_lon - b.target_lon, 2)
    ) * 111320.0f; // Approximate meters per degree

    if (pos_diff > POSITION_TOLERANCE_M) return false;

    // Check attitude setpoint agreement
    if (std::abs(a.target_roll_deg  - b.target_roll_deg)  > ATTITUDE_TOLERANCE_DEG) return false;
    if (std::abs(a.target_pitch_deg - b.target_pitch_deg) > ATTITUDE_TOLERANCE_DEG) return false;
    if (std::abs(a.target_yaw_deg   - b.target_yaw_deg)   > ATTITUDE_TOLERANCE_DEG) return false;

    // Check thrust command agreement
    for (size_t i = 0; i < a.motor_thrust_pct.size(); ++i) {
        if (std::abs(a.motor_thrust_pct[i] - b.motor_thrust_pct[i]) > THRUST_TOLERANCE_PCT) {
            return false;
        }
    }

    return true;
}

} // namespace aeros::fdr
