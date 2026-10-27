import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ImageProvider } from './contexts/ImageContext';
import { ReminderProvider } from './contexts/ReminderContext';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import Home from './pages/Home';
import StationDetails from './pages/StationDetails';
import RoutePlanning from './pages/RoutePlanning';
import FareQuery from './pages/FareQuery';
import StationList from './pages/StationList';
import My from './pages/My';

function App() {
  useTheme();
  return (
    <LanguageProvider>
      <ImageProvider>
        <ReminderProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="station" element={<StationList />} />
              <Route path="station/:id" element={<StationDetails />} />
              <Route path="route" element={<RoutePlanning />} />
              <Route path="fare" element={<FareQuery />} />
              <Route path="my" element={<My />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </ReminderProvider>
      </ImageProvider>
    </LanguageProvider>
  );
}

export default App;

