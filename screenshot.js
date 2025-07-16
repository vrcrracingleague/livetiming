const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.goto('https://vrcrracingleague.github.io/livetiming/', {
    waitUntil: 'networkidle2',
    timeout: 0,
  });

  await page.setViewport({ width: 1280, height: 720 });

  // Aspetta 5 secondi per far caricare i dati live
  await page.waitForTimeout(5000);

  await page.screenshot({
    path: 'livetiming.jpg',
    type: 'jpeg',
    quality: 80,
    fullPage: true
  });

  await browser.close();
})();
