import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppStore } from '../../store/ProvContext';
import { TEST_CONTENT } from '../../data/testContentCatalog';

const licenseTypes = [
  'AM', 'A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'TAXI'
];

export function EgenskaperScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();

  const handleNext = () => {
    navigate('/korprov/inledning');
  };

  const updateField = (field: keyof typeof state.properties, value: string) => {
    updateState((prev) => {
      const newProps = { ...prev.properties, [field]: value };
      let newTestItems = prev.includedTestItems;
      
      // If we are changing the license type, clean up irrelevant test items immediately
      if (field === 'licenseType') {
        const allowedItems = TEST_CONTENT[value] || TEST_CONTENT['B'];
        newTestItems = (prev.includedTestItems || []).filter(item => allowedItems.includes(item));
      }
      
      return {
        ...prev,
        properties: newProps,
        includedTestItems: newTestItems
      };
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div className="mb-6 sm:mb-10 text-center">
        <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-3">Grunduppgifter</h2>
        <p className="text-text-muted text-lg">Ange grunduppgifter för kandidat och prov.</p>
      </div>

      <Card className="border rounded-none shadow-none bg-white">
        <CardContent className="p-5 sm:p-8 space-y-8 sm:space-y-10">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-semibold text-lg border-b border-border/60 pb-3">Identitet och kontakt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input 
                label="Kandidatens namn" 
                placeholder="Förnamn Efternamn"
                value={state.properties.studentName}
                onChange={(e) => updateField('studentName', e.target.value)}
              />
              <Input 
                label="Personnummer" 
                placeholder="ÅÅÅÅMMDD-XXXX"
                value={state.properties.personalNumber}
                onChange={(e) => updateField('personalNumber', e.target.value)}
              />
             <div className="md:col-span-2">
                <Input 
                  label="E-postadress" 
                  type="email"
                  placeholder="namn@exempel.se"
                  value={state.properties.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h3 className="font-semibold text-lg border-b border-border/60 pb-3">Information om provet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input 
                label="Provförrättare" 
                placeholder="Ditt namn"
                value={state.properties.examiner}
                onChange={(e) => updateField('examiner', e.target.value)}
              />
              <Input 
                label="Provdatum" 
                type="date"
                value={state.properties.testDate}
                onChange={(e) => updateField('testDate', e.target.value)}
              />
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-text-main">Provtyp</label>
                <div className="relative">
                  <select
                    className="flex h-14 w-full appearance-none rounded-none border border-border bg-white px-4 py-2 text-base text-text-main transition-none focus-visible:outline-none focus-visible:border-primary hover:border-gray-400"
                    value={state.properties.testType}
                    onChange={(e) => updateField('testType', e.target.value)}
                  >
                    <option value="" disabled hidden>Välj provtyp...</option>
                    <option value="Förstaprov">Förstaprov</option>
                    <option value="Omprov">Omprov</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-muted">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-lg border-b border-border/60 pb-3">Behörighet</h3>
            <div className="flex flex-wrap gap-3">
              {licenseTypes.map(type => (
                <button
                  key={type}
                  onClick={() => updateField('licenseType', type)}
                  className={`px-6 py-3 rounded-none font-bold transition-none ${
                    state.properties.licenseType === type
                      ? 'bg-primary border border-primary text-white'
                      : 'bg-white border border-border text-text-muted hover:bg-gray-50 hover:text-text-main'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} size="lg" className="px-8 transition-none rounded-none shadow-none border border-primary">
          <span className="text-lg">Fortsätt till Inledning</span>
        </Button>
      </div>
    </div>
  );
}
