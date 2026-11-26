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
  altitude: number;
  airspeed: number;
  is_armed: boolean;
  lat: number;
  lng: number;
};

type Telemetry = {
  vehicles: Record<string, Vehicle>;
  logMessages: string[];
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

function select(model: string): Telemetry {
  render().setSelectedModel(model);
  return render();
}

const ticks = (seconds: number) => vi.advanceTimersByTime(seconds * 1000);

describe("DISARM", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    hooks.slots = [];
    hooks.mounted = false;
    hooks.effects = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is refused while AS-10 cruises at 1500 m", () => {
    select("AS-10").sendControlCommand("DISARM");
    const t = render();
    const as10 = t.vehicles["AS-10"];
    expect(as10.phase).toBe("CRUISE");
    expect(as10.is_armed).toBe(true);
    expect(as10.altitude).toBe(1500);
    expect(as10.airspeed).toBeGreaterThan(0);
    expect(t.logMessages[0]).toContain("Cannot disarm in flight");

    // The shuttle keeps flying.
    const before = { lat: as10.lat, lng: as10.lng };
    ticks(5);
    const after = render().vehicles["AS-10"];
    expect(after.phase).toBe("CRUISE");
    expect([after.lat, after.lng]).not.toEqual([before.lat, before.lng]);
  });

  it("is refused while AS-1/2 climbs after takeoff", () => {
    select("AS-1/2").sendControlCommand("UNLOCK");
    render().sendControlCommand("ARM");
    render().sendControlCommand("TAKEOFF");
    ticks(10);
    render().sendControlCommand("DISARM");
    const as1 = render().vehicles["AS-1/2"];
    expect(as1.phase).toBe("VTOL_TAKEOFF");
    expect(as1.is_armed).toBe(true);
    expect(as1.altitude).toBe(25);
  });

  it("still disarms a vehicle on the ground", () => {
    select("AS-1/2").sendControlCommand("UNLOCK");
    render().sendControlCommand("ARM");
    expect(render().vehicles["AS-1/2"].phase).toBe("PREFLIGHT");
    render().sendControlCommand("DISARM");
    const t = render();
    expect(t.vehicles["AS-1/2"].phase).toBe("SHUTDOWN");
    expect(t.vehicles["AS-1/2"].is_armed).toBe(false);
    expect(t.logMessages[0]).toContain("System DISARMED.");
  });

  it("disarms AS-10 once an emergency descent has landed it", () => {
    select("AS-10").sendControlCommand("EMERGENCY_LAND");
    ticks(1100); // 1500 m at 1.5 m/s
    render().sendControlCommand("UNLOCK");
    render().sendControlCommand("ARM");
    render().sendControlCommand("DISARM");
    const as10 = render().vehicles["AS-10"];
    expect(as10.altitude).toBe(0);
    expect(as10.phase).toBe("SHUTDOWN");
    expect(as10.is_armed).toBe(false);
  });
});
