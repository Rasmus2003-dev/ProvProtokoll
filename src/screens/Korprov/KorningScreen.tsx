import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/ProvContext';
import { cn } from '../../lib/utils';
import { TEST_CONTENT, HEAVY_SAFETY_ITEMS } from '../../data/testContentCatalog';

const column1 = [
  'Start från vägkant',
  'Start i lutning',
  'Backning',
  'Körställning',
  'Effektiv bromsning',
  'Parkering',
  'Vändning med manövrering',
  'Motorväg/motortrafikled',
  'Körning mot mål',
  'Signalreglerad korsning'
];

const column2 = [
  'Vändning',
  'Järnväg/Spårvägskorsning',
  'Nedsatt sikt eller mörker',
  'Körfältsbyte',
  'Stillastående fordon/hinder',
  'Användande av reglage',
  'Säkerhetskontroll',
  'Oskyddade trafikanter',
  'Infart på landsväg',
  'Gatukorsning'
];

const column3 = [
  'Vägarbetsområde',
  'Omkörning',
  'Riskfyllt väglag',
  'Smal/krokig väg',
  'Sväng från landsväg',
  'Landsväg',
  'Cirkulationsplats',
  'Körfält',
  'Möte'
];

const safetyCol1 = ['Vätskor', 'Rutor', 'Varningssystem', 'Vindrutetorkare och spolare', 'Styrsystem'];
const safetyCol2 = ['Bromsar', 'Däck, fälg och hjulbultar', 'Backspeglar', 'Färdskrivare', 'Belysning, blinkers och signal'];
const safetyCol3 = ['Systematisk kontroll', 'Registreringsbevis', 'Stänkskydd', 'Last'];

export function KorningScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();

  const licenseType = state.properties.licenseType || 'B';
  const rawAvailableItems = TEST_CONTENT[licenseType] || TEST_CONTENT['B'];
  const isHeavy = ['C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE', 'BE', 'B96'].includes(licenseType);

  // Clean up selected items when license type changes
  useEffect(() => {
    updateState((prev) => ({
      ...prev,
      includedTestItems: (prev.includedTestItems || []).filter(item => 
        rawAvailableItems.includes(item)
      )
    }));
  }, [licenseType, rawAvailableItems, updateState]);

  const handleNext = () => {
    navigate('/korprov/resultat');
  };

  const toggleItem = (item: string) => {
    updateState((prev) => {
      const items = prev.includedTestItems || [];
      const isCurrentlySelected = items.includes(item);
      
      return { 
        ...prev, 
        includedTestItems: isCurrentlySelected 
          ? items.filter(id => id !== item)
          : [...items, item]
      };
    });
  };

  const selectAll = () => {
    updateState((prev) => ({
      ...prev,
      includedTestItems: [...rawAvailableItems]
    }));
  };

  const clearAll = () => {
    updateState((prev) => ({
      ...prev,
      includedTestItems: []
    }));
  };

  const renderItemButton = (item: string) => {
    const isSelected = state.includedTestItems?.includes(item);
    return (
      <button 
        key={item} 
        onClick={() => toggleItem(item)}
        type="button"
        className={cn(
          "flex items-center gap-4 py-3.5 px-4 text-left cursor-pointer transition-all duration-125 border w-full outline-none focus:outline-none focus:ring-2 focus:ring-red-500/10 select-none shadow-sm rounded-xl active:scale-[0.98]",
          isSelected 
            ? "bg-red-50/40 dark:bg-red-950/20 border-[#c40000] text-red-900 dark:text-red-300 font-bold" 
            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50/50"
        )}
        style={{ minHeight: '48px' }}
      >
        <div className={cn(
          "w-5 h-5 flex flex-shrink-0 items-center justify-center transition-all border rounded-md shadow-inner",
          isSelected 
            ? "bg-[#c40000] border-[#c40000] text-white" 
            : "bg-white dark:bg-slate-850 border-gray-300 dark:border-white/10"
        )}>
          {isSelected && (
            <svg className="w-3.5 h-3.5 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-[14px] font-semibold tracking-tight leading-snug">
          {item}
        </span>
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 sm:pb-0 px-2 lg:px-4 space-y-12">
      
      {/* Dynamic Title if Heavy to distinguish sections */}
      {isHeavy && (
        <div className="border-b border-gray-200 dark:border-white/5 pb-2 mb-4">
          <h3 className="text-xl font-bold text-gray-950 dark:text-white uppercase tracking-tight">Körningsmoment</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Välj de ingående moment inom körningen som prövats.</p>
        </div>
      )}

      {/* 3 Columns Match Vertical Ordering Perfectly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-[10px]">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-[10px]">
          {column1.map(item => renderItemButton(item))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-[10px]">
          {column2.map(item => renderItemButton(item))}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-[10px]">
          {column3.map(item => renderItemButton(item))}
        </div>

      </div>

      {/* Heavy Safety CheckPoints Section */}
      {isHeavy && (
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 mt-10 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-950 dark:text-white uppercase tracking-tight">Säkerhetskontroll</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Välj de ingående moment inom säkerhetskontrollen som ingått i provet.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-[10px]">
            {/* Column 1 */}
            <div className="flex flex-col gap-[10px]">
              {safetyCol1.map(item => renderItemButton(item))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-[10px]">
              {safetyCol2.map(item => renderItemButton(item))}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-[10px]">
              {safetyCol3.map(item => renderItemButton(item))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Controls footer matches the clean Swedish myndighets style */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-200 dark:border-white/10 mt-10 print:hidden">
        <div className="flex gap-4 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            onClick={clearAll} 
            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-xl px-6 font-bold"
          >
            Nollställ alla
          </Button>
          <Button 
            variant="secondary" 
            onClick={selectAll} 
            className="rounded-xl px-6 font-bold text-gray-700 dark:text-gray-350 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
          >
            Markera alla
          </Button>
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <Button 
            onClick={handleNext} 
            size="lg" 
            className="rounded-xl px-10 border border-[#c40000] bg-[#c40000] hover:bg-[#a30000] text-white font-bold text-sm tracking-wide shadow-md whitespace-nowrap cursor-pointer transition-colors"
          >
            <span>Fortsätt till Resultat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
