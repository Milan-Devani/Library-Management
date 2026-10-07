import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.resolve(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Find Chrome or Edge executable
let chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!fs.existsSync(chromePath)) {
  chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
}
if (!fs.existsSync(chromePath)) {
  chromePath = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
}

console.log('Using browser executable:', chromePath);

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1366, height: 768, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test port 5173 then 5174
  let baseUrl = 'http://localhost:5173';
  try {
    const res = await page.goto(baseUrl + '/login', { waitUntil: 'networkidle2', timeout: 5000 });
    if (!res || res.status() >= 400) throw new Error('Not 5173');
  } catch (e) {
    baseUrl = 'http://localhost:5174';
    await page.goto(baseUrl + '/login', { waitUntil: 'networkidle2' });
  }
  console.log('Base URL identified:', baseUrl);

  // 1. Screenshot Login Page
  await page.goto(baseUrl + '/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const loginPath = path.join(screenshotsDir, '01_login.png');
  await page.screenshot({ path: loginPath });
  console.log('Saved:', loginPath);

  // Perform Login
  console.log('Logging in with admin credentials...');
  await page.type('input[type="email"], input[name="email"]', 'admin@library.com');
  await page.type('input[type="password"], input[name="password"]', 'admin123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
  ]);
  await new Promise(r => setTimeout(r, 2000));

  // 2. Screenshot Dashboard
  await page.goto(baseUrl + '/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const dashPath = path.join(screenshotsDir, '02_dashboard.png');
  await page.screenshot({ path: dashPath });
  console.log('Saved:', dashPath);

  // 3. Screenshot Books Catalog
  await page.goto(baseUrl + '/books', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const booksPath = path.join(screenshotsDir, '03_books.png');
  await page.screenshot({ path: booksPath });
  console.log('Saved:', booksPath);

  // 4. Screenshot Circulation / Issues
  await page.goto(baseUrl + '/issues', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const issuesPath = path.join(screenshotsDir, '04_issues.png');
  await page.screenshot({ path: issuesPath });
  console.log('Saved:', issuesPath);

  // 5. Screenshot Fines Management
  await page.goto(baseUrl + '/fines', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const finesPath = path.join(screenshotsDir, '05_fines.png');
  await page.screenshot({ path: finesPath });
  console.log('Saved:', finesPath);

  // 6. Screenshot Members / Students Directory
  await page.goto(baseUrl + '/members', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const membersPath = path.join(screenshotsDir, '06_members.png');
  await page.screenshot({ path: membersPath });
  console.log('Saved:', membersPath);

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch(err => {
  console.error('CAPTURE_ERROR:', err);
  process.exit(1);
});
