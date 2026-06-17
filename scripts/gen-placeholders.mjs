import puppeteer from "puppeteer-core";
import path from "path";
import os from "os";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/Users/okhida/Desktop/capstone/assets/images";

const pages = [
  // app logo placeholder: green rounded tile with a book glyph
  { name: "logo.png", html: `<div style="width:512px;height:512px;display:flex;align-items:center;justify-content:center;background:transparent">
      <div style="width:392px;height:392px;border-radius:108px;background:linear-gradient(160deg,#2F7D62,#1c5a45);display:flex;align-items:center;justify-content:center;box-shadow:0 24px 60px rgba(47,125,98,.4)">
        <span style="font-size:210px;line-height:1">📖</span>
      </div></div>` },
  // digibuddy character placeholder: mint circle with friendly bot
  { name: "digibuddy.png", html: `<div style="width:512px;height:512px;display:flex;align-items:center;justify-content:center;background:transparent">
      <div style="width:420px;height:420px;border-radius:50%;background:#EAF7F1;display:flex;align-items:center;justify-content:center;border:8px solid #fff;box-shadow:0 18px 50px rgba(47,125,98,.25)">
        <span style="font-size:230px;line-height:1">🤖</span>
      </div></div>` },
  // monochrome splash mark (white) for dark/animated splash use
  { name: "logo-mono.png", html: `<div style="width:512px;height:512px;display:flex;align-items:center;justify-content:center;background:transparent">
      <div style="width:392px;height:392px;border-radius:108px;background:rgba(255,255,255,.12);border:3px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center">
        <span style="font-size:210px;line-height:1;filter:grayscale(1) brightness(3)">📖</span>
      </div></div>` },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 });
for (const p of pages) {
  await page.setContent(`<body style="margin:0">${p.html}</body>`, { waitUntil: "load" });
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(OUT, p.name), omitBackground: true });
  console.log("wrote", p.name);
}
await browser.close();
