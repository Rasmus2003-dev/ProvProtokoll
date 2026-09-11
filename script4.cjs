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
  
  // Navigate to /korprov/inledning/egenskaper
  await page.goto('http://localhost:3000/korprov/inledning/egenskaper', { waitUntil: 'networkidle0' });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => {
     const outlet = document.querySelector('.w-full');
     const properties = document.querySelector('.max-w-4xl');
     return {
        outletClass: outlet ? outlet.className : null,
        properties: !!properties,
        url: window.location.href,
        bodyHtml: document.body.innerHTML.substring(0, 1000)
     }
  });
  console.log('DOM State:', html);
  
  await browser.close();
})();
