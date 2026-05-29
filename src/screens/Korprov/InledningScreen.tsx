import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/ProvContext';

export function InledningScreen() {
  const navigate = useNavigate();
  const { state, updateState } = useAppStore();

  const handleNext = () => {
    navigate('/korprov/korning');
  };

  const handleReset = () => {
    updateState((prev) => ({
      ...prev,
      checklist: {
        identityChecked: false,
        studentInformed: false,
        licenseTypeCorrect: false,
        vehicleCorrect: false,
        questionsAnswered: false
      }
    }));
  };

  const handleSign = () => {
    updateState((prev) => ({
      ...prev,
      checklist: {
        identityChecked: true,
        studentInformed: true,
        licenseTypeCorrect: true,
        vehicleCorrect: true,
        questionsAnswered: true
      }
    }));
  };

  const toggleCheck = (field: keyof typeof state.checklist) => {
    updateState((prev) => ({
      ...prev,
      checklist: { ...prev.checklist, [field]: !prev.checklist[field] }
    }));
  };

  const checks = [
    { id: 'identityChecked', label: 'Kandidatens identitet är styrkt' },
    { id: 'studentInformed', label: 'Kandidaten har informerats om provets genomförande och bedömningsgrunder' },
    { id: 'licenseTypeCorrect', label: 'Behörighet och provtyp överensstämmer med ansökan' },
    { id: 'vehicleCorrect', label: 'Fordonet uppfyller kraven för aktuell behörighet' },
    { id: 'questionsAnswered', label: 'Eventuella frågor är besvarade' }
  ] as const;

  const allChecked = checks.every(c => state.checklist[c.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 px-4 sm:px-6">
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-3">Identitetskontroll och inledning</h2>
        <p className="text-text-muted text-lg">Säkerställ identitet och informera kandidaten om provets syfte och genomförande.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 sm:gap-8">
        <div className="md:col-span-5">
          <Card className="bg-white border-border rounded-none shadow-none sticky top-24">
            <CardContent className="p-5 sm:p-8 space-y-4 sm:space-y-6">
              <div className="bg-[#D42220] hover:bg-[#b01b1a] text-white font-mono text-[10px] font-black tracking-widest px-2.5 py-1.5 uppercase select-none inline-block leading-none">
                INSTRUKTION
              </div>
              <h3 className="font-display font-bold text-2xl flex items-center gap-2 pt-2">
                Om körprovet
              </h3>
              <p className="text-text-muted text-base leading-relaxed">
                Som provförrättare behöver du informera kandidaten om provets upplägg innan ni startar.
              </p>
              <ul className="space-y-4 text-base font-medium text-text-main">
                <li className="flex gap-3 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                  Provets upplägg diskuteras
                </li>
                <li className="flex gap-3 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                  Bedömningens grunder gås igenom
                </li>
                <li className="flex gap-3 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                  Tidsåtgången förklaras
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="border shadow-none rounded-none bg-white">
            <CardContent className="p-5 sm:p-8 space-y-4 sm:space-y-6">
              <h3 className="font-display font-bold text-xl sm:text-2xl mb-2">Checklista inför prov</h3>
              <div className="space-y-3 sm:space-y-4">
                {checks.map(check => {
                  const isChecked = state.checklist[check.id];
                  return (
                    <label 
                      key={check.id} 
                      className={`flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-none cursor-pointer transition-none border ${
                        isChecked 
                          ? 'bg-gray-50 border-gray-400' 
                          : 'bg-white border-border hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <button 
                        onClick={(e) => { e.preventDefault(); toggleCheck(check.id); }}
                        className={`mt-0.5 sm:mt-0 flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-none border transition-none ${
                          isChecked
                            ? 'bg-white border-primary text-primary'
                            : 'bg-white text-transparent border-gray-300'
                        } focus:outline-none`}
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <span className={`text-sm sm:text-lg transition-none ${isChecked ? 'font-semibold text-text-main' : 'font-medium text-text-muted'}`}>
                        {check.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 mt-10">
        <Button variant="ghost" onClick={handleReset} className="text-text-muted hover:text-danger rounded-none px-6">
          Rensa val
        </Button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button variant="secondary" onClick={handleSign} disabled={allChecked} className="rounded-none px-8 whitespace-nowrap">
            Signera alla
          </Button>
          <Button onClick={handleNext} size="lg" className="rounded-none px-10 border border-primary transition-none shadow-none whitespace-nowrap" disabled={!allChecked}>
            <span className="text-lg">Fortsätt till Körning</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
