import argon2 from "argon2";

export function assertSixDigitPin(pin) {
  return typeof pin === "string" && /^\d{6}$/.test(pin);
}

export function hashPin(pin) {
  return argon2.hash(pin);
}

export function verifyPin(pinHash, pin) {
  return argon2.verify(pinHash, pin);
}
