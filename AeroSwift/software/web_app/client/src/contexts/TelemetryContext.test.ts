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

type Telemetry = {
  vehicles: Record<
    string,
    { phase: string; altitude: number; is_armed: boolean }
  >;
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

describe("TelemetryProvider simulation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    hooks.slots = [];
    hooks.mounted = false;
    hooks.effects = [];
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lands AS-1/2 after an emergency landing", () => {
    select("AS-1/2").sendControlCommand("UNLOCK");
    render().sendControlCommand("ARM");
    render().sendControlCommand("TAKEOFF");
    ticks(10);
    render().sendControlCommand("EMERGENCY_LAND");
    ticks(60);
    const as1 = render().vehicles["AS-1/2"];
    expect(as1.phase).toBe("SHUTDOWN");
    expect(as1.altitude).toBe(0);
  });

  it("lands AS-10 after an emergency landing", () => {
    select("AS-10").sendControlCommand("EMERGENCY_LAND");
    expect(render().vehicles["AS-10"].phase).toBe("VTOL_LAND");
    ticks(10);
    expect(render().vehicles["AS-10"].altitude).toBeLessThan(1500);
    ticks(1100); // 1500 m at 1.5 m/s
    const as10 = render().vehicles["AS-10"];
    expect(as10.phase).toBe("SHUTDOWN");
    expect(as10.altitude).toBe(0);
    expect(as10.is_armed).toBe(false);
  });

  it("climbs AS-10 after a takeoff from the ground", () => {
    select("AS-10").sendControlCommand("EMERGENCY_LAND");
    ticks(1100);
    render().sendControlCommand("ARM");
    render().sendControlCommand("TAKEOFF");
    const before = render().vehicles["AS-10"];
    expect(before.phase).toBe("VTOL_TAKEOFF");
    expect(before.altitude).toBe(0);
    ticks(10);
    expect(render().vehicles["AS-10"].altitude).toBeGreaterThan(
      before.altitude,
    );
  });
});
