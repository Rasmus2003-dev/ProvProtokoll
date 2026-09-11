import fs from 'fs';
let content = fs.readFileSync('src/components/icons/AppLogo.tsx', 'utf-8');

content = content.replace(
  /  const renderEmblem = \(\) => \([^]*?  \);/m,
  `  const renderEmblem = () => (
    <div className="relative w-full h-full rounded-[28%] overflow-hidden bg-gradient-to-br from-[#002F6C] to-[#001838] shadow-inner flex items-center justify-center border-[1.5px] border-blue-400/20">
      <FileText className="absolute text-white/20 w-[70%] h-[70%]" strokeWidth={1.5} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-[10%]">
         <div className="flex items-center gap-[6%] w-[70%] justify-center">
           <Car className="text-[#38BDF8] w-[28%] h-auto drop-shadow-md" strokeWidth={2.5} />
           <Bus className="text-[#FBBF24] w-[28%] h-auto drop-shadow-md" strokeWidth={2.5} />
           <Truck className="text-[#34D399] w-[30%] h-auto drop-shadow-md" strokeWidth={2.5} />
         </div>
      </div>
    </div>
  );`
);

content = content.replace(
  /          KÖRPROV/g,
  "          DIGITALT"
);

content = content.replace(
  /          BEDÖMNINGSPLATTFORM/g,
  "          PROVPROTOKOLL"
);

fs.writeFileSync('src/components/icons/AppLogo.tsx', content);
