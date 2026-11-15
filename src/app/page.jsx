"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  connectHeartRate,
  isBluetoothSupported,
  requestFenixDevice,
  startDemoStream,
} from "../lib/bleHeartRate.mjs";

const MAX_HISTORY = 90;
const DEFAULT_MAX_HR = 185;

const ZONES = [
  { id: "rest", label: "Rest", min: 0, max: 0.5, color: "var(--zone-rest)" },
  { id: "warm", label: "Warm-up", min: 0.5, max: 0.6, color: "var(--zone-warm)" },
  { id: "aero", label: "Aerobic", min: 0.6, max: 0.7, color: "var(--zone-aero)" },
  { id: "thresh", label: "Threshold", min: 0.7, max: 0.85, color: "var(--zone-thresh)" },
  { id: "max", label: "Max", min: 0.85, max: 1.2, color: "var(--zone-max)" },
];

function zoneFor(bpm, maxHr) {
  const ratio = bpm / maxHr;
  return ZONES.find((z) => ratio >= z.min && ratio < z.max) || ZONES[ZONES.length - 1];
}

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Sparkline({ points, color }) {
  if (!points.length) {
    return (
      <svg viewBox="0 0 320 96" className="sparkline" width="100%" height="96" aria-hidden>
        <path
          d="M8 70 C60 68, 90 40, 140 48 S220 78, 312 42"
          fill="none"
          stroke="rgba(26,36,32,0.12)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const values = points.map((p) => p.bpm);
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const range = Math.max(1, max - min);
  const w = 320;
  const h = 96;
  const pad = 8;
  const coords = values.map((v, i) => {
    const x = pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const d = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${d} L${coords[coords.length - 1][0]} ${h} L${coords[0][0]} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline" width="100%" height="96" aria-hidden>
      <defs>
        <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#hrFill)" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="240"
      />
    </svg>
  );
}

function MountainBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.35,
        pointerEvents: "none",
      }}
    >
      <path
        d="M0 360 L180 220 L320 300 L480 140 L640 260 L820 120 L980 240 L1180 90 L1440 280 L1440 520 L0 520 Z"
        fill="rgba(31,92,69,0.18)"
      />
      <path
        d="M0 420 L220 300 L400 380 L560 250 L760 360 L980 230 L1200 340 L1440 260 L1440 520 L0 520 Z"
        fill="rgba(20,61,46,0.22)"
      />
    </svg>
  );
}

export default function FenixMonitorPage() {
  const [supported, setSupported] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | live | demo | error
  const [deviceName, setDeviceName] = useState("");
  const [sensorLocation, setSensorLocation] = useState("");
  const [battery, setBattery] = useState(null);
  const [bpm, setBpm] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [acceptAll, setAcceptAll] = useState(false);
  const [maxHr, setMaxHr] = useState(DEFAULT_MAX_HR);
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showSetup, setShowSetup] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const sessionRef = useRef(null);
  const stopDemoRef = useRef(null);

  useEffect(() => {
    setSupported(isBluetoothSupported());
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  useEffect(() => {
    if (status !== "live" && status !== "demo") return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  const zone = useMemo(() => (bpm ? zoneFor(bpm, maxHr) : null), [bpm, maxHr]);

  const stats = useMemo(() => {
    if (!history.length) return { avg: null, min: null, max: null };
    const values = history.map((h) => h.bpm);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [history]);

  const pushReading = useCallback((reading) => {
    setBpm(reading.bpm);
    setHistory((prev) => {
      const next = [...prev, { bpm: reading.bpm, t: reading.timestamp }];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
  }, []);

  const cleanup = useCallback(async () => {
    if (stopDemoRef.current) {
      stopDemoRef.current();
      stopDemoRef.current = null;
    }
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
      sessionRef.current = null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await cleanup();
    setStatus("idle");
    setDeviceName("");
    setSensorLocation("");
    setBattery(null);
    setBpm(null);
    setHistory([]);
    setStartedAt(null);
    setError("");
  }, [cleanup]);

  const connect = useCallback(async () => {
    setError("");
    setStatus("connecting");
    try {
      await cleanup();
      const device = await requestFenixDevice({ acceptAll });
      setDeviceName(device.name || "Fenix 7");
      const session = await connectHeartRate(device, {
        onHeartRate: pushReading,
        onDisconnect: () => {
          setStatus("idle");
          setError("Watch disconnected. Reconnect when ready.");
          sessionRef.current = null;
        },
      });
      sessionRef.current = session;
      setSensorLocation(session.sensorLocation || "Wrist");
      setBattery(session.battery);
      setHistory([]);
      setBpm(null);
      setStartedAt(Date.now());
      setStatus("live");
    } catch (err) {
      const message =
        err?.name === "NotFoundError"
          ? "No device selected. Enable Broadcast Heart Rate on your Fenix 7, then try again."
          : err?.message || "Could not connect to the watch.";
      setError(message);
      setStatus("idle");
    }
  }, [acceptAll, cleanup, pushReading]);

  const startDemo = useCallback(async () => {
    await cleanup();
    setError("");
    setDeviceName("Fenix 7 (Demo)");
    setSensorLocation("Wrist");
    setBattery(82);
    setHistory([]);
    setBpm(null);
    setStartedAt(Date.now());
    setStatus("demo");
    stopDemoRef.current = startDemoStream(pushReading);
  }, [cleanup, pushReading]);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt]);

  useEffect(() => () => {
    cleanup();
  }, [cleanup]);

  const durationMs = startedAt && (status === "live" || status === "demo") ? now - startedAt : 0;
  const accent = zone?.color || "var(--pine)";

  return (
    <main style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      <section
        style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          padding: "clamp(18px, 4vw, 28px) clamp(16px, 4vw, 28px) 28px",
        }}
      >
        <MountainBackdrop />

        <header
          className="anim-rise"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(2rem, 8vw, 3.4rem)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                color: "var(--pine-deep)",
              }}
            >
              Fenix
              <br />
              Monitor
            </div>
            <p
              style={{
                margin: "10px 0 0",
                maxWidth: 320,
                color: "var(--ink-soft)",
                fontSize: 15,
                lineHeight: 1.45,
              }}
            >
              Live wrist telemetry from your Garmin Fenix 7 on Android.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            {installPrompt && (
              <button
                type="button"
                onClick={installApp}
                style={chipButtonStyle}
              >
                Install app
              </button>
            )}
            <button type="button" onClick={() => setShowSetup(true)} style={chipButtonStyle}>
              Watch setup
            </button>
          </div>
        </header>

        <div
          className="anim-rise-delay"
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "grid",
            placeItems: "center",
            padding: "28px 0 18px",
          }}
        >
          <div
            className={bpm ? "breathe" : undefined}
            style={{
              width: "min(78vw, 320px)",
              aspectRatio: "1",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85), rgba(232,239,233,0.72) 45%, rgba(213,227,216,0.9))",
              boxShadow: "var(--shadow)",
              border: "1px solid rgba(255,255,255,0.55)",
              display: "grid",
              placeItems: "center",
              position: "relative",
            }}
          >
            {bpm && (
              <div
                className="pulse-ring"
                style={{
                  position: "absolute",
                  inset: 10,
                  borderRadius: "50%",
                  border: `2px solid ${accent}`,
                }}
              />
            )}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  fontWeight: 600,
                }}
              >
                {status === "live" || status === "demo" ? "Heart rate" : "Ready"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(4.4rem, 18vw, 5.8rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                  color: accent,
                  marginTop: 4,
                }}
              >
                {bpm ?? "--"}
              </div>
              <div style={{ fontSize: 18, color: "var(--ink-soft)", marginTop: 2 }}>bpm</div>
              {zone && (
                <div
                  style={{
                    marginTop: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(26,36,32,0.06)",
                    color: "var(--ink)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: zone.color,
                      display: "inline-block",
                    }}
                  />
                  {zone.label} zone
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="anim-rise-delay"
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gap: 14,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.7)",
              borderRadius: 22,
              padding: "16px 16px 10px",
              boxShadow: "0 10px 30px rgba(20,40,30,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>
                Session trend
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>
                {formatDuration(durationMs)}
              </span>
            </div>
            <Sparkline points={history} color={accent} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginTop: 4,
              }}
            >
              {[
                ["Avg", stats.avg],
                ["Min", stats.min],
                ["Max", stats.max],
              ].map(([label, value]) => (
                <div key={label} style={{ textAlign: "center", padding: "8px 0 4px" }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>
                    {label.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 20,
                      color: "var(--ink)",
                    }}
                  >
                    {value ?? "--"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 10,
            }}
          >
            <InfoTile
              label="Device"
              value={deviceName || "Not connected"}
              detail={
                status === "live"
                  ? `Connected · ${sensorLocation || "Wrist"}`
                  : status === "demo"
                    ? "Demo stream"
                    : status === "connecting"
                      ? "Pairing…"
                      : supported === false
                        ? "Chrome on Android required"
                        : "Broadcast HR to pair"
              }
            />
            <InfoTile
              label="Battery"
              value={battery != null ? `${battery}%` : "--"}
              detail={battery != null ? "Watch battery" : "Unavailable over BLE"}
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: "rgba(179,45,58,0.08)",
                border: "1px solid rgba(179,45,58,0.2)",
                color: "var(--danger)",
                borderRadius: 14,
                padding: "12px 14px",
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            {status === "live" || status === "demo" ? (
              <button type="button" onClick={disconnect} style={secondaryButtonStyle}>
                Disconnect
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={connect}
                  disabled={supported === false || status === "connecting"}
                  style={{
                    ...primaryButtonStyle,
                    opacity: supported === false || status === "connecting" ? 0.55 : 1,
                  }}
                >
                  {status === "connecting" ? "Connecting…" : "Connect Fenix 7"}
                </button>
                <button type="button" onClick={startDemo} style={secondaryButtonStyle}>
                  Try demo mode
                </button>
              </>
            )}
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--ink-soft)",
              padding: "0 2px",
            }}
          >
            <input
              type="checkbox"
              checked={acceptAll}
              onChange={(e) => setAcceptAll(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Show all Bluetooth devices (if Fenix is hidden)
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 13,
              color: "var(--ink-soft)",
              padding: "0 2px",
            }}
          >
            <span>Max HR for zones</span>
            <input
              type="number"
              min={120}
              max={220}
              value={maxHr}
              onChange={(e) => setMaxHr(Number(e.target.value) || DEFAULT_MAX_HR)}
              style={{
                width: 72,
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,0.7)",
                padding: "8px 10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}
            />
          </label>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.45,
              textAlign: "center",
            }}
          >
            Works best in Chrome on Android. Add to Home Screen for an app-like experience.
          </p>
        </div>
      </section>

      {showSetup && <SetupSheet onClose={() => setShowSetup(false)} />}
    </main>
  );
}

function InfoTile({ label, value, detail }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.68)",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: 18,
        padding: "14px 14px 12px",
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 600 }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "-0.02em",
          color: "var(--pine-deep)",
          lineHeight: 1.15,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: "var(--ink-soft)" }}>{detail}</div>
    </div>
  );
}

function SetupSheet({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(18, 28, 24, 0.45)",
        display: "grid",
        alignItems: "end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #f8fbf9, #e8f0ea)",
          borderRadius: "24px 24px 0 0",
          padding: "18px 20px 28px",
          maxHeight: "85dvh",
          overflow: "auto",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: 42,
            height: 4,
            borderRadius: 999,
            background: "rgba(26,36,32,0.15)",
            margin: "0 auto 16px",
          }}
        />
        <h2
          id="setup-title"
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 28,
            letterSpacing: "-0.03em",
            color: "var(--pine-deep)",
          }}
        >
          Pair your Fenix 7
        </h2>
        <ol
          style={{
            margin: "16px 0 0",
            paddingLeft: 18,
            color: "var(--ink-soft)",
            lineHeight: 1.55,
            fontSize: 15,
            display: "grid",
            gap: 10,
          }}
        >
          <li>
            On the watch: <strong>Hold UP</strong> → <strong>Sensors &amp; Accessories</strong> →{" "}
            <strong>Wrist Heart Rate</strong> → <strong>Status</strong> → turn on{" "}
            <strong>Broadcast Heart Rate</strong>.
          </li>
          <li>
            Keep the watch nearby with Bluetooth on. The Fenix should appear as a heart-rate sensor
            (often named like <em>Garmin Fenix 7</em>).
          </li>
          <li>
            Open this page in <strong>Chrome on Android</strong>, tap <strong>Connect Fenix 7</strong>,
            and choose your watch. Grant Bluetooth permission if asked.
          </li>
          <li>
            Optional: Chrome menu → <strong>Add to Home screen</strong> / Install for a full-screen
            phone app.
          </li>
        </ol>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.45, marginTop: 16 }}>
          Broadcast Heart Rate uses the standard Bluetooth LE Heart Rate profile. It works while the
          watch is broadcasting; stop broadcasting on the watch when you are done to save battery.
        </p>
        <button type="button" onClick={onClose} style={{ ...primaryButtonStyle, marginTop: 18 }}>
          Got it
        </button>
      </div>
    </div>
  );
}

const primaryButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: 16,
  padding: "16px 18px",
  background: "linear-gradient(135deg, var(--pine) 0%, var(--pine-deep) 100%)",
  color: "#f4faf6",
  fontWeight: 700,
  fontSize: 16,
  letterSpacing: "-0.01em",
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(20, 61, 46, 0.28)",
};

const secondaryButtonStyle = {
  width: "100%",
  border: "1px solid var(--line)",
  borderRadius: 16,
  padding: "14px 18px",
  background: "rgba(255,255,255,0.7)",
  color: "var(--pine-deep)",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
};

const chipButtonStyle = {
  border: "1px solid var(--line)",
  borderRadius: 999,
  padding: "8px 12px",
  background: "rgba(255,255,255,0.72)",
  color: "var(--pine-deep)",
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
