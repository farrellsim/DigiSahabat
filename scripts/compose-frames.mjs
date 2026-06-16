import puppeteer from "puppeteer-core";
import fs from "fs";
import os from "os";
import path from "path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOTS = path.join(os.homedir(), "Desktop", "digisahabat-shots");
const OUT = "/tmp/promo-frames";
fs.mkdirSync(OUT, { recursive: true });

const scenes = [
  { file: "04-digibuddy-chat", title: "Meet DigiBuddy", sub: "Your friendly AI guide" },
  { file: "02-home", title: "Learning, simplified", sub: "Track progress at a glance" },
  { file: "05-learn", title: "Bite-sized lessons", sub: "Digital skills, step by step" },
  { file: "11-module", title: "Guided modules", sub: "Learn, quiz, earn badges" },
  { file: "08-leaderboard", title: "Learn together", sub: "Climb the leaderboard" },
  { file: "09-talk", title: "Just ask out loud", sub: "Voice support for everyone" },
];

const html = (b64, title, sub) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;font-family:-apple-system,"Segoe UI",Roboto,sans-serif}
.stage{position:relative;width:1080px;height:1920px;
  background:linear-gradient(165deg,#0a3d27 0%,#12713f 50%,#0a3d27 100%);}
.glow{position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);
  width:760px;height:1280px;border-radius:50%;
  background:radial-gradient(circle,rgba(74,222,128,.35),rgba(74,222,128,0) 70%);filter:blur(40px);}
.cap{position:absolute;top:150px;left:0;right:0;text-align:center;z-index:5}
.cap h1{color:#fff;font-size:62px;font-weight:800;letter-spacing:-1px;
  text-shadow:0 4px 24px rgba(0,0,0,.35)}
.cap p{color:rgba(255,255,255,.82);font-size:32px;font-weight:500;margin-top:14px}
.phone{position:absolute;left:222px;top:404px;width:636px;height:1340px;
  background:#0b0b0c;border-radius:84px;padding:18px;
  box-shadow:0 50px 120px rgba(0,0,0,.55),0 0 0 2px rgba(255,255,255,.07),inset 0 0 0 3px #2a2a2c;}
.screen{position:relative;width:600px;height:1304px;border-radius:66px;overflow:hidden;background:#000}
.bar{height:34px;background:#000}
.view{height:1270px;overflow:hidden;background:#fff}
.view img{width:600px;height:1270px;display:block}
.island{position:absolute;top:9px;left:50%;transform:translateX(-50%);
  width:122px;height:34px;background:#000;border-radius:18px;z-index:3}
.brand{position:absolute;bottom:96px;left:0;right:0;text-align:center;z-index:5;
  color:rgba(255,255,255,.92);font-size:30px;font-weight:700;letter-spacing:3px}
</style></head><body>
<div class="stage">
  <div class="glow"></div>
  <div class="cap"><h1>${title}</h1><p>${sub}</p></div>
  <div class="phone"><div class="screen"><div class="bar"></div><div class="view"><img src="data:image/png;base64,${b64}"/></div><div class="island"></div></div></div>
  <div class="brand">DIGISAHABAT</div>
</div></body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });

let i = 0;
for (const s of scenes) {
  const b64 = fs.readFileSync(path.join(SHOTS, s.file + ".png")).toString("base64");
  await page.setContent(html(b64, s.title, s.sub), { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const img = document.querySelector("img");
    return img && img.complete ? true : new Promise((res) => { img.onload = res; img.onerror = res; });
  });
  await new Promise((r) => setTimeout(r, 200));
  const out = path.join(OUT, `scene-${String(i).padStart(2, "0")}.png`);
  await page.screenshot({ path: out });
  console.log("composed", out);
  i++;
}
await browser.close();
console.log("done:", i, "scenes");
