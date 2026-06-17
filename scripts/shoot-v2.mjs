import puppeteer from "puppeteer-core";
import os from "os";
import path from "path";
import fs from "fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:8091";
const OUT = path.join(os.homedir(), "Desktop", "digisahabat-shots-v2");
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on("pageerror", (e) => console.log("CRASH:", String(e).slice(0, 200)));
const info = async () => page.evaluate(() => ({ url: location.pathname, t: document.body.innerText }));
async function tap(label, { last = false } = {}) {
  const h = await page.evaluateHandle((t, useLast) => {
    const els = [...document.querySelectorAll("div,span,a,button")].filter((e) => e.innerText && e.innerText.trim() === t);
    els.sort((a, b) => a.innerText.length - b.innerText.length);
    return useLast ? els[els.length - 1] : els[0] || null;
  }, label, last);
  const el = h.asElement(); if (!el) throw new Error("not found: " + label); await el.click();
}
async function shot(name) { await sleep(900); await page.screenshot({ path: path.join(OUT, name + ".png") }); console.log("📸", name, "->", (await info()).url); }

await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 180000 });
// catch the splash (unique marker: tagline)
let gotSplash = false;
for (let i = 0; i < 40; i++) {
  const { t } = await info();
  if (t.includes("Belajar digital")) { await sleep(700); await page.screenshot({ path: path.join(OUT, "00-splash.png") }); console.log("📸 00-splash"); gotSplash = true; break; }
  if (t.includes("Choose Your Language") || t.includes("Log In")) break;
  await sleep(150);
}
// wait for language screen
for (let i = 0; i < 40; i++) { const { t } = await info(); if (t.includes("Log In") || t.includes("Choose Your Language")) break; await sleep(200); }
await shot("01-language");

await tap("Log In"); await sleep(1200);
await shot("02-login");
// Guest mode = no DB dependency (Postgres is down); server still serves Gemini chat.
await tap("Continue as Guest");
for (let i = 0; i < 30; i++) { if (!(await info()).url.includes("login")) break; await sleep(700); }
await shot("03-home");

await tap("DigiBuddy"); await sleep(1200);
try { await tap("What is a scam message?"); await sleep(7000); } catch (e) { console.log("chip:", e.message); }
await shot("04-digibuddy");

await tap("Learn"); await shot("05-learn");
await tap("Profile"); await shot("06-profile");
try { await tap("View Leaderboard"); await shot("07-leaderboard"); } catch (e) { console.log("lb:", e.message); }

console.log("gotSplash:", gotSplash, "done");
await browser.close();
