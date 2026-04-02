import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import StationDetails from './pages/StationDetails';
import RoutePlanning from './pages/RoutePlanning';
import FareQuery from './pages/FareQuery';
import StationList from './pages/StationList';

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="station" element={<StationList />} />
            <Route path="station/:id" element={<StationDetails />} />
            <Route path="route" element={<RoutePlanning />} />
            <Route path="fare" element={<FareQuery />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
}

export default App;
