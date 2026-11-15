# Fenix Monitor

Phone-first monitoring app for a **Garmin Fenix 7** on **Android**.

It connects over Bluetooth LE using the standard Heart Rate profile (the same broadcast your watch uses for gym equipment), shows live BPM, zone, session trend, and optional battery.

## Use on Android

1. Deploy or open the site in **Chrome** (Web Bluetooth requires Chrome; HTTPS or localhost).
2. On the Fenix 7: **Hold UP** → **Sensors & Accessories** → **Wrist Heart Rate** → **Status** → enable **Broadcast Heart Rate**.
3. Tap **Connect Fenix 7** and pick your watch.
4. Chrome menu → **Add to Home screen** / **Install app** for a standalone phone app.

If the watch does not appear, enable **Show all Bluetooth devices** and select it manually.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in Chrome. Use **Try demo mode** to exercise the UI without a watch.

## Notes

- Broadcast Heart Rate must stay on while monitoring; turn it off afterward to save watch battery.
- This uses the open BLE Heart Rate Profile. Garmin Connect IQ / Health SDK data (steps, SpO2, sleep, GPS tracks) is not available without Garmin partner APIs.
- Desktop browsers rarely expose Web Bluetooth the same way; Android Chrome is the target.
