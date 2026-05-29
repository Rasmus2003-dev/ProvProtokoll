import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/ProvContext';

export function DagensProvScreen() {
  const navigate = useNavigate();
  const { updateState } = useAppStore();
  
  const tests = [
    { time: '08:30', name: 'Elvira Strömqvist', id: '19700613-1234', auth: 'B', lang: 'Svenska', status: 'Pågående', statusColor: 'text-blue-600', inspector: 'Anna Svensson', active: true },
    { time: '09:15', name: 'Mikael Andersson', id: '19881020-4321', auth: 'CE', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', inspector: 'Anna Svensson', active: true },
    { time: '10:00', name: 'Fatima Al-Sayed', id: '19950314-5566', auth: 'D', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', inspector: 'Erik Karlsson', active: true },
    { time: '11:15', name: 'Johan Lundin', id: '19920512-7788', auth: 'TAXI', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', inspector: 'Anna Svensson', active: true },
    { time: '13:00', name: 'Sara Petrovic', id: '20010830-1122', auth: 'A', lang: 'Engelska', status: 'Väntar', statusColor: 'text-gray-500', inspector: 'Erik Karlsson', active: true },
    { time: '14:30', name: 'Lars Olofsson', id: '19751101-9900', auth: 'BE', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', inspector: 'Anna Svensson', active: true },
    { time: '15:15', name: 'Anna Bergström', id: '19991224-3344', auth: 'C', lang: 'Svenska', status: 'Väntar', statusColor: 'text-gray-500', inspector: 'Erik Karlsson', active: true },
  ];

  const handleSelectTest = (test: typeof tests[0]) => {
    // Generate clean email without Swedish special characters
    const cleanNameParts = test.name.toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .split(' ');
    const email = `${cleanNameParts[0]}.${cleanNameParts[1] || 'student'}@exempel.se`;

    updateState((prev) => ({
      ...prev,
      properties: {
        studentName: test.name,
        personalNumber: test.id,
        email: email,
        examiner: test.inspector,
        testDate: '2026-05-19',
        testType: 'Körprov',
        licenseType: test.auth
      },
      checklist: {
        identityChecked: false,
        studentInformed: false,
        licenseTypeCorrect: false,
        vehicleCorrect: false,
        questionsAnswered: false
      },
      includedTestItems: [],
      result: {
        drivingResult: null,
        safetyCheckResult: null,
        interventionOccurred: false,
        testAborted: false,
        drivingFailure: {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false
        },
        safetyCheckFailure: {
          primaryCause: { area: '', deficiencies: [] },
          consequences: [],
          situations: [],
          interventionOccurred: false,
          testAborted: false
        }
      }
    }));
    navigate('/korprov/start');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 w-full pt-4">
      <div className="flex items-center gap-12 mb-6">
        <h1 className="text-[22px] font-bold text-black font-sans tracking-tight">Dagens prov – 19 maj 2026</h1>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <button className="px-6 py-2 bg-[#fdf2f2] text-[#D42220] font-semibold text-sm border border-[#fbd5d5] rounded-none">
          Aktiva
        </button>
        <button className="px-6 py-2 bg-white text-gray-700 font-medium text-sm border border-gray-300 rounded-none">
          Avslutade
        </button>
        <button className="px-6 py-2 bg-white text-gray-700 font-medium text-sm border border-gray-300 rounded-none">
          Ej genomförda
        </button>
      </div>

      <div className="w-full border border-gray-200">
        <table className="w-full text-left bg-white text-[15px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-black">
              <th className="py-3 px-4 font-semibold w-24">Tid</th>
              <th className="py-3 px-4 font-semibold">Namn</th>
              <th className="py-3 px-4 font-semibold">Personnummer</th>
              <th className="py-3 px-4 font-semibold">Behörighet</th>
              <th className="py-3 px-4 font-semibold">Språk</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Inspektör</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, i) => (
              <tr 
                key={i} 
                className={`border-b border-gray-100 last:border-0 ${test.active ? 'bg-[#f4f8ff] cursor-pointer hover:bg-[#ebf2ff]' : 'hover:bg-gray-50'}`}
                onClick={() => test.active && handleSelectTest(test)}
              >
                <td className="py-4 px-4 text-black font-medium">{test.time}</td>
                <td className="py-4 px-4 text-black">{test.name}</td>
                <td className="py-4 px-4 text-black">{test.id}</td>
                <td className="py-4 px-4 text-black">{test.auth}</td>
                <td className="py-4 px-4 text-black">{test.lang}</td>
                <td className={`py-4 px-4 font-medium ${test.statusColor}`}>{test.status}</td>
                <td className="py-4 px-4 text-black">{test.inspector}</td>
                <td className="py-4 px-4 text-center">
                  {test.active && <span className="text-blue-600 font-bold">→</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <div>Prov-ID: 2026-05-19-0013</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          Autosparad 09:24
        </div>
      </div>
    </div>
  );
}
