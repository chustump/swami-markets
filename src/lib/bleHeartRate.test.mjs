import test from "node:test";
import assert from "node:assert/strict";
import { parseHeartRate } from "./bleHeartRate.mjs";

test("parses 8-bit heart rate measurement", () => {
  const bytes = new Uint8Array([0x00, 72]);
  const reading = parseHeartRate(new DataView(bytes.buffer));
  assert.equal(reading.bpm, 72);
  assert.equal(reading.rrIntervals.length, 0);
});

test("parses 16-bit heart rate with RR intervals", () => {
  // flags: 16-bit HR + RR present => 0x11
  const bpm = 140;
  const rr = Math.round((600 / 1000) * 1024); // 600ms
  const buffer = new ArrayBuffer(5);
  const view = new DataView(buffer);
  view.setUint8(0, 0x11);
  view.setUint16(1, bpm, true);
  view.setUint16(3, rr, true);
  const reading = parseHeartRate(view);
  assert.equal(reading.bpm, 140);
  assert.equal(reading.rrIntervals.length, 1);
  assert.ok(Math.abs(reading.rrIntervals[0] - 600) <= 1);
});
