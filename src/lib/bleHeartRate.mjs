/** Standard BLE Heart Rate Profile helpers for Garmin Fenix 7 (and other HR sensors). */

export const HEART_RATE_SERVICE = "heart_rate";
export const HEART_RATE_MEASUREMENT = "heart_rate_measurement";
export const BODY_SENSOR_LOCATION = "body_sensor_location";
export const BATTERY_SERVICE = "battery_service";
export const BATTERY_LEVEL = "battery_level";
export const DEVICE_INFO_SERVICE = "device_information";

export const SENSOR_LOCATIONS = {
  0: "Other",
  1: "Chest",
  2: "Wrist",
  3: "Finger",
  4: "Hand",
  5: "Ear lobe",
  6: "Foot",
};

export function isBluetoothSupported() {
  return typeof navigator !== "undefined" && !!navigator.bluetooth;
}

/**
 * Parse Heart Rate Measurement characteristic value (Bluetooth SIG).
 * Flags byte bit0: 0 = UINT8 bpm, 1 = UINT16 bpm
 */
export function parseHeartRate(dataView) {
  const flags = dataView.getUint8(0);
  const rrPresent = (flags & 0x10) !== 0;
  const energyPresent = (flags & 0x08) !== 0;
  const contactSupported = (flags & 0x04) !== 0;
  const contactDetected = (flags & 0x02) !== 0;
  const is16Bit = (flags & 0x01) !== 0;

  let offset = 1;
  const bpm = is16Bit ? dataView.getUint16(offset, true) : dataView.getUint8(offset);
  offset += is16Bit ? 2 : 1;

  let energyExpended;
  if (energyPresent) {
    energyExpended = dataView.getUint16(offset, true);
    offset += 2;
  }

  const rrIntervals = [];
  if (rrPresent) {
    while (offset + 1 < dataView.byteLength) {
      // RR interval units are 1/1024 seconds
      const raw = dataView.getUint16(offset, true);
      rrIntervals.push(Math.round((raw / 1024) * 1000));
      offset += 2;
    }
  }

  return {
    bpm,
    contactSupported,
    contactDetected,
    energyExpended,
    rrIntervals,
    timestamp: Date.now(),
  };
}

export async function requestFenixDevice({ acceptAll = false } = {}) {
  if (!isBluetoothSupported()) {
    throw new Error("Web Bluetooth is not available. Open this app in Chrome on Android.");
  }

  const optionalServices = [
    HEART_RATE_SERVICE,
    BATTERY_SERVICE,
    DEVICE_INFO_SERVICE,
  ];

  if (acceptAll) {
    return navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices,
    });
  }

  return navigator.bluetooth.requestDevice({
    filters: [
      { services: [HEART_RATE_SERVICE] },
      { namePrefix: "Fenix" },
      { namePrefix: "Garmin" },
      { namePrefix: "fenix" },
    ],
    optionalServices,
  });
}

export async function connectHeartRate(device, { onHeartRate, onDisconnect } = {}) {
  const onDisconnected = () => {
    if (onDisconnect) onDisconnect();
  };
  device.addEventListener("gattserverdisconnected", onDisconnected);

  const server = await device.gatt.connect();
  const hrService = await server.getPrimaryService(HEART_RATE_SERVICE);
  const hrChar = await hrService.getCharacteristic(HEART_RATE_MEASUREMENT);

  let sensorLocation = null;
  try {
    const locChar = await hrService.getCharacteristic(BODY_SENSOR_LOCATION);
    const locValue = await locChar.readValue();
    sensorLocation = SENSOR_LOCATIONS[locValue.getUint8(0)] || "Unknown";
  } catch {
    sensorLocation = "Wrist";
  }

  let battery = null;
  try {
    const battService = await server.getPrimaryService(BATTERY_SERVICE);
    const battChar = await battService.getCharacteristic(BATTERY_LEVEL);
    const battValue = await battChar.readValue();
    battery = battValue.getUint8(0);
  } catch {
    battery = null;
  }

  const handleNotification = (event) => {
    const value = event.target.value;
    const reading = parseHeartRate(value);
    if (onHeartRate) onHeartRate(reading);
  };

  await hrChar.startNotifications();
  hrChar.addEventListener("characteristicvaluechanged", handleNotification);

  return {
    device,
    server,
    sensorLocation,
    battery,
    async disconnect() {
      try {
        hrChar.removeEventListener("characteristicvaluechanged", handleNotification);
        await hrChar.stopNotifications();
      } catch {
        /* already disconnected */
      }
      device.removeEventListener("gattserverdisconnected", onDisconnected);
      if (device.gatt?.connected) device.gatt.disconnect();
    },
  };
}

/** Demo stream for UI testing without a watch. */
export function startDemoStream(onHeartRate) {
  let bpm = 72;
  let direction = 1;
  const id = setInterval(() => {
    bpm += direction * (1 + Math.floor(Math.random() * 3));
    if (bpm > 155) direction = -1;
    if (bpm < 58) direction = 1;
    onHeartRate({
      bpm,
      contactSupported: true,
      contactDetected: true,
      rrIntervals: [Math.round(60000 / bpm)],
      timestamp: Date.now(),
      demo: true,
    });
  }, 1000);
  return () => clearInterval(id);
}
