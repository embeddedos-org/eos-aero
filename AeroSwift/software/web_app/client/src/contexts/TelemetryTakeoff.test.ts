import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A minimal hook runtime, so TelemetryProvider can be called as a plain
// function and its 1 s simulation interval driven with fake timers. Hooks
// are matched by call order, as React does; effects run once, on "mount".
const hooks = vi.hoisted(() => ({
  slots: [] as unknown[],
  index: 0,
  mounted: false,
  effects: [] as Array<() => unknown>,
}));

vi.mock("react", () => {
  const useState = (init: unknown) => {
    const i = hooks.index++;
    if (!(i in hooks.slots)) {
      hooks.slots[i] =
        typeof init === "function" ? (init as () => unknown)() : init;
    }
    const set = (next: unknown) => {
      hooks.slots[i] =
        typeof next === "function"
          ? (next as (v: unknown) => unknown)(hooks.slots[i])
          : next;
    };
    return [hooks.slots[i], set];
  };
  const useEffect = (fn: () => unknown) => {
    if (!hooks.mounted) hooks.effects.push(fn);
  };
  const api = {
    useState,
    useEffect,
    useRef: (current: unknown) => ({ current }),
    useContext: () => undefined,
    createContext: () => ({ Provider: "TelemetryContext.Provider" }),
  };
  return { ...api, default: api };
});

import { TelemetryProvider } from "./TelemetryContext";

type Vehicle = {
  phase: string;
  lat: number;
  lng: number;
  target_lat: number;
  target_lng: number;
};

type Telemetry = {
  vehicles: Record<string, Vehicle>;
  setSelectedModel: (model: string) => void;
  sendControlCommand: (
    command: string,
    params?: Record<string, unknown>,
  ) => void;
};

function render(): Telemetry {
  hooks.index = 0;
  const element = TelemetryProvider({ children: null }) as unknown as {
    props: { value: Telemetry };
  };
  if (!hooks.mounted) {
    hooks.mounted = true;
    hooks.effects.forEach((fn) => fn());
  }
  return element.props.value;
}

const SF = { lat: 37.7749, lng: -122.4194 };
const SFO = { lat: 37.6213, lng: -122.379 };

const distance = (v: Vehicle, p: { lat: number; lng: number }) =>
  Math.hypot(v.lat - p.lat, v.lng - p.lng);

// Arm, take off and step the simulation 1 s at a time until the vehicle
// has landed again (SHUTDOWN), or give up after an hour.
function fly(model: string): Vehicle {
  render().sendControlCommand("ARM");
  render().sendControlCommand("TAKEOFF");
  expect(render().vehicles[model].phase).toBe("VTOL_TAKEOFF");
  for (let s = 0; s < 3600; s++) {
    vi.advanceTimersByTime(1000);
    if (render().vehicles[model].phase === "SHUTDOWN") break;
  }
  const v = render().vehicles[model];
  expect(v.phase).toBe("SHUTDOWN");
  return v;
}

describe("TAKEOFF destination", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    hooks.slots = [];
    hooks.mounted = false;
    hooks.effects = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("flies AS-1/2 from SF to SFO and back to SF", () => {
    render().setSelectedModel("AS-1/2");
    render().sendControlCommand("UNLOCK");

    const outbound = fly("AS-1/2");
    expect(distance(outbound, SFO)).toBeLessThanOrEqual(0.001);

    const back = fly("AS-1/2");
    expect([back.target_lat, back.target_lng]).toEqual([SF.lat, SF.lng]);
    expect(distance(back, SF)).toBeLessThanOrEqual(0.001);
  });

  it("still sends a vehicle that is not at SFO to SFO", () => {
    render().setSelectedModel("AS-1/2");
    render().sendControlCommand("UNLOCK");
    render().sendControlCommand("ARM");
    render().sendControlCommand("TAKEOFF");
    const v = render().vehicles["AS-1/2"];
    expect([v.target_lat, v.target_lng]).toEqual([SFO.lat, SFO.lng]);
  });
});
