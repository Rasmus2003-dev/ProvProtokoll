import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './store/ProvContext';
import { LoginScreen } from './screens/LoginScreen';
import { ProfilScreen } from './screens/ProfilScreen';
import { HistorikScreen } from './screens/HistorikScreen';
import { LathundarScreen } from './screens/LathundarScreen';
import { TeoriprovScreen } from './screens/TeoriprovScreen';
import { ElevProvScreen } from './screens/ElevProvScreen';
import { KorprovLayout } from './screens/Korprov/KorprovLayout';
import { DagensProvScreen } from './screens/Korprov/DagensProvScreen';
import { StartScreen } from './screens/Korprov/StartScreen';
import { EgenskaperScreen } from './screens/Korprov/EgenskaperScreen';
import { InledningScreen } from './screens/Korprov/InledningScreen';
import { KorningScreen } from './screens/Korprov/KorningScreen';
import { ResultatScreen } from './screens/Korprov/ResultatScreen';
import { ProtokollScreen } from './screens/Korprov/ProtokollScreen';
import { TopAppBar } from './components/layout/TopAppBar';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();

  // Student/candidate screen should run standalone
  if (location.pathname === '/elevprov') {
    return (
      <>
        <OfflineIndicator />
        <ElevProvScreen />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f8f9fa] dark:bg-[#0b1120] text-gray-900 dark:text-gray-100">
      <OfflineIndicator />
      <TopAppBar />
      <div className="flex-1 overflow-y-auto">
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
          
          <Route path="/teoriprov" element={<TeoriprovScreen />} />
          <Route path="/lathundar" element={<LathundarScreen />} />
          <Route path="/historik" element={<HistorikScreen />} />
          <Route path="/profil" element={<ProfilScreen />} />
          <Route path="*" element={<Navigate to="/korprov/start" replace />} />
        </Routes>
      </div>
      <div className="md:hidden shrink-0">
        <BottomNavBar />
      </div>
      <PWAInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
