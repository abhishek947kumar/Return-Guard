const path = require('path');
const puppeteer = require(path.join(__dirname, 'frontend', 'node_modules', 'puppeteer-core'));
const fs = require('fs');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('Launching browser with', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920, deviceScaleFactor: 2 });

  console.log('Navigating to http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Run Scenario: TV with Multimodal Defect Escalation
  console.log('Running 65" OLED TV scenario...');
  const tvBtn = await page.$('#scenario-tv');
  if (tvBtn) {
    await tvBtn.click();
    await new Promise(r => setTimeout(r, 6000));
    await page.screenshot({ path: path.join(outDir, '01_multimodal_vision_react_trace.png') });
    console.log('Saved 01_multimodal_vision_react_trace.png');
  }

  // 2. Click Analytics Dashboard
  console.log('Navigating to Analytics...');
  const analyticsBtn = await page.$('#nav-analytics-btn');
  if (analyticsBtn) {
    await analyticsBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '02_executive_analytics_dashboard.png') });
    console.log('Saved 02_executive_analytics_dashboard.png');
  }

  // 3. Click HITL Escalations Review Desk
  console.log('Navigating to Escalations Queue...');
  const escBtn = await page.$('#nav-escalations-btn');
  if (escBtn) {
    await escBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '03_hitl_escalation_review_desk.png') });
    console.log('Saved 03_hitl_escalation_review_desk.png');
  }

  // 4. Click Policy Matrix
  console.log('Navigating to Policy Matrix...');
  const polBtn = await page.$('#nav-policies-btn');
  if (polBtn) {
    await polBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '04_dynamic_policy_engine.png') });
    console.log('Saved 04_dynamic_policy_engine.png');
  }

  // 5. Click AI Governance & Guardrails
  console.log('Navigating to AI Governance...');
  const govBtn = await page.$('#nav-governance-btn');
  if (govBtn) {
    await govBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '05_ai_governance_guardrails.png') });
    console.log('Saved 05_ai_governance_guardrails.png');
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
