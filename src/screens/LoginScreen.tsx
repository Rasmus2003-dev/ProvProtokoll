import React, { useState } from 'react';
import { AppLogo } from '../components/icons/AppLogo';
import { useAppStore } from '../store/ProvContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { profile } = useAppStore();
  const [inspectorId, setInspectorId] = useState(profile.inspectorId || 'INSP-2045');
  const [pinCode, setPinCode] = useState('2045');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!inspectorId.trim()) {
      setError('Inspektörs-ID saknas.');
      return;
    }
    if (!pinCode.trim()) {
      setError('Säkerhetskod krävs.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (pinCode.length >= 4) {
        localStorage.setItem('provprotokoll-is-logged-in', 'true');
        onLoginSuccess();
      } else {
        setError('Ogiltig säkerhetskod.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-[#0b1120] flex items-center justify-center p-4 sm:p-8 select-none animate-fade-in font-sans">
      <div className="w-full max-w-[1000px] min-h-[560px] bg-white dark:bg-[#111827] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden border border-gray-200/50 dark:border-gray-800">
        
        {/* Left Side: Brand presentation (hidden on mobile, visible on sm and up) */}
        <div className="hidden md:flex md:w-[45%] lg:w-1/2 flex-col justify-between bg-[#111827] text-white p-12 relative overflow-hidden">
          {/* Subtle background graphic/gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#1e293b]"></div>
          <div className="absolute top-0 right-0 p-32 -mr-16 -mt-16 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 p-32 -ml-16 -mb-16 bg-[#008099]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-[#008099] shadow-[0_0_15px_rgba(0,128,153,0.3)] flex items-center justify-center">
                 <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
             </div>
             <span className="font-bold tracking-widest text-xs uppercase text-gray-300">Trafiksektionen</span>
          </div>

          <div className="relative z-10 space-y-6 max-w-sm mt-12 mb-auto">
            <AppLogo variant="full" className="scale-110 origin-left -ml-2" />
            <h1 className="text-3xl font-light tracking-tight leading-tight mt-8">
              Välkommen till <span className="font-bold text-white block mt-1">mottagningsklienten</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Det moderniserade systemet för hantering och kvalitetssäkring av körprovsprotokoll. Säker åtkomst endast för auktoriserade inspektörer.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-xs font-mono text-gray-500">
             <span>v1.4.0</span>
             <span className="w-1 h-1 rounded-full bg-gray-600"></span>
             <span className="flex items-center gap-1.5 text-[#00E5FF]">
               <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
               System Online
             </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-[55%] lg:w-1/2 p-8 sm:p-14 flex flex-col justify-center relative bg-white dark:bg-[#0f141e]">
          
          <div className="max-w-[340px] w-full mx-auto space-y-8">
            <div className="md:hidden flex justify-center mb-4">
               <AppLogo variant="horizontal" className="scale-125" />
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Logga in</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mata in dina uppgifter för säker åtkomst.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* ID Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide block uppercase">Inspektörs-ID</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#008099] transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={inspectorId}
                      onChange={(e) => setInspectorId(e.target.value)}
                      placeholder="INSP-2045"
                      className="w-full h-12 pl-10 pr-4 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008099]/20 focus:border-[#008099] text-gray-900 dark:text-white transition-all font-medium shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* PIN Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide block uppercase">Säkerhetskod</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#008099] transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="••••"
                      className="w-full h-12 pl-10 pr-4 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008099]/20 focus:border-[#008099] text-gray-900 dark:text-white transition-all font-medium tracking-[0.2em] shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                      disabled={isLoading}
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="w-full h-12 bg-[#008099] hover:bg-[#006e85] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed overflow-hidden relative"
                >
                   {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifierar...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10 transition-transform duration-200 flex items-center gap-1.5" style={{ transform: isHovered ? 'translateX(-4px)' : 'translateX(0)' }}>
                        Logga in i systemet
                      </span>
                      <svg 
                        className="w-4 h-4 relative z-10 transition-all duration-200 opacity-0 -ml-4"
                        style={{ 
                          opacity: isHovered ? 1 : 0, 
                          transform: isHovered ? 'translateX(4px)' : 'translateX(-10px)',
                          marginLeft: isHovered ? '0px' : '-16px'
                        }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="pt-4 text-center">
              <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 max-w-[260px] mx-auto leading-relaxed">
                Behörighetsbegränsat system underställt Trafiksektionen. Din aktivitet loggas och övervakas.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

