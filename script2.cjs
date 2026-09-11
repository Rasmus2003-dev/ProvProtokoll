const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/korprov/egenskaper', { waitUntil: 'networkidle0' });
  
  // Wait a bit for animations
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => {
     const outlet = document.querySelector('.w-full');
     const egenskaper = document.querySelector('.max-w-4xl');
     return {
        outletClass: outlet ? outlet.className : null,
        outletStyle: outlet ? outlet.getAttribute('style') : null,
        egenskaper: !!egenskaper,
        egenskaperDisplay: egenskaper ? window.getComputedStyle(egenskaper).display : null,
        egenskaperOpacity: egenskaper ? window.getComputedStyle(egenskaper).opacity : null,
        bodyHtml: document.body.innerHTML.substring(0, 500)
     }
  });
  console.log('DOM State:', html);
  
  await browser.close();
})();
