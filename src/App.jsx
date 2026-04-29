import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ImageProvider } from './contexts/ImageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import StationDetails from './pages/StationDetails';
import RoutePlanning from './pages/RoutePlanning';
import FareQuery from './pages/FareQuery';
import StationList from './pages/StationList';

function App() {
  return (
    <LanguageProvider>
      <ImageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
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
        </BrowserRouter>
      </ImageProvider>
    </LanguageProvider>
  );
}

export default App;
