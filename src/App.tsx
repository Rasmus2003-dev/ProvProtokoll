import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './store/ProvContext';
import { LoginScreen } from './screens/LoginScreen';
import { KorprovLayout } from './screens/Korprov/KorprovLayout';
import { TopAppBar } from './components/layout/TopAppBar';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteLoading } from './components/RouteLoading';
import { ToastProvider } from './components/Toast';

import { PullToRefresh } from './components/layout/PullToRefresh';
import { isTestStepPath } from './lib/activeTest';
import { useAuthGate } from './hooks/useAuthGate';

// Efter en ny deploy finns gamla chunk-filer inte kvar på servern, och en
// lazy-import misslyckas då. Ladda om sidan en gång för att hämta nya filer
// (provdatan ligger kvar i localStorage) istället för att visa en kraschskärm.
function lazy<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return React.lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem('provprotokoll-chunk-reload');
      return mod;
    } catch (err) {
      if (!sessionStorage.getItem('provprotokoll-chunk-reload')) {
        sessionStorage.setItem('provprotokoll-chunk-reload', '1');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}

// Varje skärm laddas som en egen chunk först när den faktiskt besöks,
// istället för att alla ~17 skärmar + PDF/HTML-bibliotek bundlas i en
// enda fil som måste laddas innan appen ens visar startskärmen.
const ProfilScreen = lazy(() => import('./screens/ProfilScreen').then(m => ({ default: m.ProfilScreen })));
const HistorikScreen = lazy(() => import('./screens/HistorikScreen').then(m => ({ default: m.HistorikScreen })));
const LathundarScreen = lazy(() => import('./screens/LathundarScreen').then(m => ({ default: m.LathundarScreen })));
const TeoriprovScreen = lazy(() => import('./screens/TeoriprovScreen').then(m => ({ default: m.TeoriprovScreen })));
const ElevProvScreen = lazy(() => import('./screens/ElevProvScreen').then(m => ({ default: m.ElevProvScreen })));
const TrafikskolaScreen = lazy(() => import('./screens/TrafikskolaScreen').then(m => ({ default: m.TrafikskolaScreen })));
const ElevregisterScreen = lazy(() => import('./screens/ElevregisterScreen').then(m => ({ default: m.ElevregisterScreen })));
const DagensProvScreen = lazy(() => import('./screens/Korprov/DagensProvScreen').then(m => ({ default: m.DagensProvScreen })));
const StartScreen = lazy(() => import('./screens/Korprov/StartScreen').then(m => ({ default: m.StartScreen })));
const EgenskaperScreen = lazy(() => import('./screens/Korprov/EgenskaperScreen').then(m => ({ default: m.EgenskaperScreen })));
const InledningScreen = lazy(() => import('./screens/Korprov/InledningScreen').then(m => ({ default: m.InledningScreen })));
const KorningScreen = lazy(() => import('./screens/Korprov/KorningScreen').then(m => ({ default: m.KorningScreen })));
const ResultatScreen = lazy(() => import('./screens/Korprov/ResultatScreen').then(m => ({ default: m.ResultatScreen })));
const ProtokollScreen = lazy(() => import('./screens/Korprov/ProtokollScreen').then(m => ({ default: m.ProtokollScreen })));
const InspektorerScreen = lazy(() => import('./screens/InspektorerScreen').then(m => ({ default: m.InspektorerScreen })));

function AppContent() {
  const location = useLocation();
  const auth = useAuthGate();

  // Student/candidate screen should run standalone without login
  if (location.pathname === '/elevprov') {
    return (
      <ErrorBoundary key={location.pathname}>
        <OfflineIndicator />
        <Suspense fallback={<RouteLoading />}>
          <ElevProvScreen />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f8f9fa] dark:bg-[#0b1120] text-gray-900 dark:text-gray-100 relative">
      <OfflineIndicator />
      <TopAppBar />
      {/* Ingen dra-för-att-uppdatera mitt i ett prov – en oavsiktlig dragning ska inte ladda om appen */}
      <PullToRefresh disabled={isTestStepPath(location.pathname)}>
        {/* Nyckel på sökvägen: ett fel på en skärm låser inte appen, byte av skärm återställer */}
        <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/korprov/start" replace />} />
            {/* Note the use of relative nested routes under KorprovLayout */}
            <Route path="/korprov" element={<KorprovLayout />}>
              <Route index element={<Navigate to="start" replace />} />
              <Route path="start" element={<StartScreen />} />
              <Route path="dagens" element={<DagensProvScreen />} />
              <Route path="egenskaper" element={<EgenskaperScreen />} />
              <Route path="inledning" element={<InledningScreen />} />
              <Route path="korning" element={<KorningScreen />} />
              <Route path="resultat" element={<ResultatScreen />} />
              <Route path="protokoll" element={<ProtokollScreen />} />
            </Route>

            <Route path="/elevregister" element={<ElevregisterScreen />} />
            <Route path="/teoriprov" element={<TeoriprovScreen />} />
            <Route path="/trafikskola" element={<TrafikskolaScreen />} />
            <Route path="/lathundar" element={<LathundarScreen />} />
            <Route path="/historik" element={<HistorikScreen />} />
            <Route path="/profil" element={<ProfilScreen />} />
            <Route path="/inspektorer" element={<InspektorerScreen />} />
            <Route path="*" element={<Navigate to="/korprov/start" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </PullToRefresh>
      <div className="md:hidden shrink-0">
        <BottomNavBar />
      </div>
      <PWAInstallBanner />

      {/* Inloggningen täcker hela appen tills sessionen är verifierad */}
      {auth.status === 'checking' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-8 h-8 border-[3px] border-slate-200 dark:border-slate-700 border-t-[#002f6c] dark:border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      {auth.status === 'signed-out' && (
        <LoginScreen onLoginSuccess={auth.onLoginSuccess} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
