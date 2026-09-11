import fs from 'fs';

let content = fs.readFileSync('src/components/icons/AppLogo.tsx', 'utf-8');

content = content.replace("import { HTMLAttributes } from 'react';", "import { HTMLAttributes } from 'react';\nimport { FileText, Car, Bus, Truck } from 'lucide-react';");

// we can change renderEmblem to return a div with absolute positioned icons
content = content.replace(/  const renderEmblem = \(\) => \(\n    <svg viewBox="0 0 100 100"[^]*?<\/svg>\n  \);/m, `  const renderEmblem = () => (
    <div className="relative w-full h-full rounded-[28%] overflow-hidden bg-gradient-to-br from-[#002F6C] to-[#001838] shadow-inner flex items-center justify-center">
      <FileText className="absolute text-white/20 w-[65%] h-[65%]" strokeWidth={1.5} />
      <div className="absolute flex flex-col gap-[8%] left-[25%] top-[30%] h-[40%]">
        <Car className="text-[#38BDF8] w-full h-full" strokeWidth={3} />
      </div>
      <div className="absolute flex flex-col gap-[8%] left-[45%] top-[30%] h-[40%]">
        <Bus className="text-[#FBBF24] w-full h-full" strokeWidth={3} />
      </div>
      <div className="absolute flex flex-col gap-[8%] left-[65%] top-[30%] h-[40%]">
        <Truck className="text-[#34D399] w-full h-full" strokeWidth={3} />
      </div>
    </div>
  );`);

fs.writeFileSync('src/components/icons/AppLogo.tsx', content);
