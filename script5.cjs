const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Set localStorage
  await page.evaluate(() => {
    localStorage.setItem('provprotokoll-is-logged-in', 'true');
  });
  
  await page.goto('http://localhost:3000/korprov/inledning', { waitUntil: 'networkidle0' });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  // Click the 'Egenskaper' tab
  const clicked = await page.evaluate(() => {
     const links = Array.from(document.querySelectorAll('a'));
     const egLink = links.find(a => a.textContent.trim() === 'Egenskaper');
     if (egLink) {
        egLink.click();
        return true;
     }
     return false;
  });
  
  console.log('Clicked Egenskaper:', clicked);
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => {
     const egenskaper = document.querySelector('.max-w-4xl');
     return {
        url: window.location.href,
        egenskaper: !!egenskaper
     }
  });
  console.log('DOM State:', html);
  
  await browser.close();
})();
