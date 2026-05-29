/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider } from './store/ProvContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TopAppBar } from './components/layout/TopAppBar';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { KorprovLayout } from './screens/Korprov/KorprovLayout';
import { DagensProvScreen } from './screens/Korprov/DagensProvScreen';
import { StartScreen } from './screens/Korprov/StartScreen';
import { EgenskaperScreen } from './screens/Korprov/EgenskaperScreen';
import { InledningScreen } from './screens/Korprov/InledningScreen';
import { KorningScreen } from './screens/Korprov/KorningScreen';
import { ResultatScreen } from './screens/Korprov/ResultatScreen';
import { ProtokollScreen } from './screens/Korprov/ProtokollScreen';
import { ProfilScreen } from './screens/ProfilScreen';
import { LoginScreen } from './screens/LoginScreen';

function GenericScreen({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-full flex flex-col">
      <h1 className="text-2xl font-display font-bold text-text-main mb-4">{title}</h1>
      <div className="flex-1 rounded-2xl bg-white border border-border p-6 shadow-sm flex items-center justify-center text-text-muted">
        Denna sektion är under utveckling
      </div>
    </div>
  );
}

function PageTransitions() {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/korprov" replace />} />
      <Route path="/korprov" element={<KorprovLayout />}>
        <Route path="dagens-prov" element={<DagensProvScreen />} />
        <Route path="start" element={<StartScreen />} />
        <Route path="egenskaper" element={<EgenskaperScreen />} />
        <Route path="inledning" element={<InledningScreen />} />
        <Route path="korning" element={<KorningScreen />} />
        <Route path="resultat" element={<ResultatScreen />} />
        <Route path="protokoll" element={<ProtokollScreen />} />
      </Route>
      <Route path="/korlektion" element={<GenericScreen title="Körlektion" />} />
      <Route path="/bedomningsprov" element={<GenericScreen title="Bedömningsprov" />} />
      <Route path="/profil" element={<ProfilScreen />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('provprotokoll-is-logged-in') === 'true';
  });

  const location = useLocation();
  const isProtokoll = location.pathname.includes('protokoll');

  if (!isLoggedIn) {
    return (
      <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
    );
  }

  return (
    <div className="h-full w-full bg-background flex flex-col relative overflow-hidden max-w-[100vw] print:overflow-visible print:h-auto">
      <div className="relative z-10 flex flex-col h-full overflow-hidden print:overflow-visible print:h-auto">
        {!isProtokoll && <TopAppBar />}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth flex flex-col h-full print:overflow-visible print:h-auto">
          <PageTransitions />
        </main>
        {/* BottomNavBar removed for cleaner look */}
      </div>
    </div>
  );
}
