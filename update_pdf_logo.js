import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/screens/Korprov/ProtokollScreen.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  `    doc.text('Digitalt', margin + 12, y + 18);
    
    const provWidth = doc.getTextWidth('Digitalt');
    doc.setTextColor(0, 128, 153);
    doc.text(' Prov', margin + 12 + provWidth, y + 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Inspirerad av Trafikverket', margin + 12, y + 29);`,
  `    doc.text('KÖRPROV', margin + 12, y + 18);
    
    const provWidth = doc.getTextWidth('KÖRPROV');
    doc.setTextColor(225, 29, 72); // Rose 600
    doc.text(' PLATFORM', margin + 12 + provWidth, y + 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Egen Produkt', margin + 12, y + 29);`
);

fs.writeFileSync(filePath, content, 'utf-8');
