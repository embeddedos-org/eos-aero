import { beforeEach, describe, expect, it, vi } from "vitest";

// A minimal hook runtime, so TelemetryProvider can be called as a plain
// function. Hooks are matched by call order, as React does. Effects are not
// run: these tests only send commands, so the simulation timer is not needed.
const hooks = vi.hoisted(() => ({ slots: [] as unknown[], index: 0 }));

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
  const api = {
    useState,
    useEffect: () => {},
    useRef: (current: unknown) => ({ current }),
    useContext: () => undefined,
    createContext: () => ({ Provider: "TelemetryContext.Provider" }),
  };
  return { ...api, default: api };
});

import { TelemetryProvider } from "./TelemetryContext";

type Telemetry = {
  vehicles: Record<string, { cabin_temp: number }>;
  logMessages: string[];
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
  return element.props.value;
}

describe("CLIMATE command", () => {
  beforeEach(() => {
    hooks.slots = [];
  });

  it("sets the cabin temperature", () => {
    render().sendControlCommand("CLIMATE", { temp: 18 });
    expect(render().vehicles["AS-1/2"].cabin_temp).toBe(18);
  });

  it("sets the cabin temperature to 0 °C", () => {
    render().sendControlCommand("CLIMATE", { temp: 1 });
    render().sendControlCommand("CLIMATE", { temp: 0 });
    const t = render();
    expect(t.vehicles["AS-1/2"].cabin_temp).toBe(0);
    expect(t.logMessages[0]).toContain("Cabin climate set to 0°C.");
  });

  it("ignores a CLIMATE command without a temperature", () => {
    render().sendControlCommand("CLIMATE", { temp: 18 });
    render().sendControlCommand("CLIMATE");
    render().sendControlCommand("CLIMATE", {});
    expect(render().vehicles["AS-1/2"].cabin_temp).toBe(18);
  });
});
