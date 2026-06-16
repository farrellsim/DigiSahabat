import puppeteer from "puppeteer-core";
import os from "os";
import path from "path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:8091";
const OUT = path.join(os.homedir(), "Desktop", "digisahabat-shots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const where = async () => page.evaluate(() => ({ url: location.pathname, len: document.body.innerText.trim().length }));
async function tap(label, { last = false } = {}) {
  const h = await page.evaluateHandle((t, useLast) => {
    const els = [...document.querySelectorAll("div,span,a,button")].filter((e) => e.innerText && e.innerText.trim() === t);
    els.sort((a, b) => a.innerText.length - b.innerText.length);
    return useLast ? els[els.length - 1] : els[0] || null;
  }, label, last);
  const el = h.asElement(); if (!el) throw new Error("not found: " + label); await el.click();
}

await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 180000 });
for (let i = 0; i < 40; i++) { if ((await where()).len > 0) break; await sleep(1500); }
await sleep(1500);
await tap("Log In"); await sleep(1500);
const inputs = await page.$$("input");
await inputs[0].click(); await page.keyboard.type("auntylela");
await inputs[1].click(); await page.keyboard.type("123456");
await sleep(400); await tap("Log In", { last: true });
for (let i = 0; i < 30; i++) { if (!(await where()).url.includes("login")) break; await sleep(1000); }

await tap("DigiBuddy"); await sleep(1500);
await tap("What is a scam message?");
await sleep(7000); // wait for AI reply
await page.screenshot({ path: path.join(OUT, "04-digibuddy-chat.png") });
console.log("📸 04-digibuddy-chat ->", (await where()).url);
await browser.close();
