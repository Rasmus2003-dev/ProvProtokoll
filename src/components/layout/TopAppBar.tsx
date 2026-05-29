import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/ProvContext';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../icons/AppLogo';

export function TopAppBar() {
  const { profile } = useAppStore();
  const navigate = useNavigate();
  const [time, setTime] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 h-16 md:h-24 shrink-0 border-b border-[#e5e7eb] dark:border-white/5">
      <div className="flex items-center justify-between w-full h-full px-4 md:px-6 max-w-[1400px] mx-auto relative p-0">
        <div className="flex items-center gap-3 md:gap-4 w-28 md:w-48 text-xs md:text-[15px] font-medium text-black dark:text-gray-200">
          <span className="hidden sm:inline font-mono">{time}</span>
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 py-1 px-2.5 rounded-full sm:bg-transparent sm:p-0">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            <span className="text-gray-600 dark:text-gray-400 font-bold text-[10.5px] md:text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Logo hanging top center - ProvProtokoll official look */}
        <div 
          onClick={() => navigate('/')}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] md:w-[220px] h-16 md:h-24 flex flex-col items-center justify-center z-[50] px-2 md:px-3 cursor-pointer group transition-all select-none"
        >
          <AppLogo variant="horizontal" size={window.innerWidth < 640 ? 'sm' : 'md'} className="scale-[0.8] md:scale-95 group-hover:scale-100 transition-transform duration-100" />
        </div>

        <div 
          onClick={() => navigate('/profil')}
          className="flex items-center justify-end gap-2 md:gap-3 w-28 md:w-48 cursor-pointer group hover:opacity-80 transition-opacity"
        >
          <div className="text-right">
            <div className="text-xs md:text-[15px] font-black text-gray-950 dark:text-gray-200 leading-none group-hover:text-primary transition-colors truncate max-w-[70px] sm:max-w-none">{profile.name || 'Saknas'}</div>
            <div className="text-[9.5px] md:text-[12px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5 truncate font-medium">Inspektör</div>
          </div>
          <div className="w-7.5 h-7.5 md:w-9.5 md:h-9.5 bg-[#002F6C] text-white font-black text-xs md:text-sm rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
            {profile.name ? profile.name[0].toUpperCase() : 'I'}
          </div>
        </div>
      </div>
    </header>
  );
}
