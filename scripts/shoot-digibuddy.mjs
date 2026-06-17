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

// boot -> guest -> home
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 180000 });
for (let i = 0; i < 40; i++) { const { t } = await info(); if (t.includes("Log In") || t.includes("Choose Your Language")) break; await sleep(200); }
await tap("Log In"); await sleep(1200);
await tap("Continue as Guest");
for (let i = 0; i < 30; i++) { if (!(await info()).url.includes("login")) break; await sleep(700); }

// DigiBuddy chat with retry until a real reply lands
await tap("DigiBuddy"); await sleep(1200);
let ok = false;
for (let attempt = 0; attempt < 3 && !ok; attempt++) {
  await tap("What is a scam message?");
  // wait for typing to start then finish
  for (let i = 0; i < 6; i++) { if ((await info()).t.includes("thinking")) break; await sleep(500); }
  for (let i = 0; i < 40; i++) { if (!(await info()).t.includes("thinking")) break; await sleep(1000); }
  await sleep(800);
  const { t } = await info();
  if (!t.includes("could not reply") && !t.includes("cannot reach")) { ok = true; }
  else { console.log("retry", attempt + 1, "- got error fallback"); await sleep(1500); }
}
await sleep(600);
await page.screenshot({ path: path.join(OUT, "04-digibuddy-chat.png") });
console.log("📸 04-digibuddy-chat (reply ok:", ok + ")");

// Voice call screen (auth persists via localStorage across goto)
await page.goto(BASE + "/ai/talk", { waitUntil: "domcontentloaded" });
for (let i = 0; i < 25; i++) { const { t } = await info(); if (t.includes("Tap to ask") || t.includes("Start Demo") || t.includes("DigiBuddy")) break; await sleep(800); }
await sleep(1000);
await page.screenshot({ path: path.join(OUT, "09-voice.png") });
console.log("📸 09-voice ->", (await info()).url);

await browser.close();
