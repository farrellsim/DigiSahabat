import puppeteer from "puppeteer-core";
import os from "os";
import path from "path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:8091";
const OUT = path.join(os.homedir(), "Desktop", "digisahabat-shots");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGE CRASH:", String(e).slice(0, 200)));

const where = async () => page.evaluate(() => ({ url: location.pathname, len: document.body.innerText.trim().length }));

// tap the most specific element whose trimmed text === label (click bubbles to RNW Pressable)
async function tap(label, { last = false } = {}) {
  const h = await page.evaluateHandle((t, useLast) => {
    const els = [...document.querySelectorAll("div,span,a,button")].filter(
      (e) => e.innerText && e.innerText.trim() === t
    );
    els.sort((a, b) => a.innerText.length - b.innerText.length);
    return useLast ? els[els.length - 1] : els[0] || null;
  }, label, last);
  const el = h.asElement();
  if (!el) throw new Error("not found: " + label);
  await el.click();
}

async function shot(name) {
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT, name + ".png") });
  const w = await where();
  console.log("📸", name, "->", w.url, "len", w.len);
}

console.log("loading...");
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 180000 });
for (let i = 0; i < 40; i++) { if ((await where()).len > 0) break; await sleep(1500); }
await sleep(1500);
await shot("00-language");

// language -> login
await tap("Log In");
await sleep(1500);
await shot("01-login");

// fill credentials + submit
const inputs = await page.$$("input");
await inputs[0].click(); await page.keyboard.type("auntylela");
await inputs[1].click(); await page.keyboard.type("123456");
await sleep(400);
await tap("Log In", { last: true }); // green button
// wait until we leave /login
for (let i = 0; i < 30; i++) { if (!(await where()).url.includes("login")) break; await sleep(1000); }
await shot("02-home");

// DigiBuddy + start a conversation
await tap("DigiBuddy");
await shot("03-digibuddy");
try {
  await tap("What is a scam message?");
  for (let i = 0; i < 25; i++) { // wait for AI reply text to grow
    const len = (await where()).len; await sleep(1000);
    if (len > 0 && i > 4) break;
  }
  await sleep(3000);
  await shot("04-digibuddy-chat");
} catch (e) { console.log("chip tap failed:", e.message); }

// Learn
await tap("Learn");
await shot("05-learn");

// Friends
await tap("Friends");
await shot("06-friends");

// Profile
await tap("Profile");
await shot("07-profile");

// Leaderboard (from profile)
try { await tap("View Leaderboard"); await shot("08-leaderboard"); await page.goBack(); await sleep(1200); }
catch (e) { console.log("leaderboard failed:", e.message); }

// Voice screen — auth persists in localStorage across goto in this session
try { await page.goto(BASE + "/ai/talk", { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 20; i++) { if ((await where()).len > 0) break; await sleep(1000); }
  await shot("09-talk"); } catch (e) { console.log("talk failed:", e.message); }

// A lesson: Learn -> Start Module -> first lesson
try { await tap("Learn"); await sleep(1200); await tap("Start Module"); await sleep(1500); await shot("10-lesson");
} catch (e) { console.log("lesson failed:", e.message); }

console.log("done");
await browser.close();
