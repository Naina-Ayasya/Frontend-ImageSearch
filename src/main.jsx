import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Results from './Pages/Results';
import Analyzing from "./Pages/Analyzing";
import './index.css';
import { ImageProvider } from './Context/ImageContext';
import KajariaSearch from './Components/KajariaSearch';



ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/image-search">
  <ImageProvider>
    <KajariaSearch/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/analyzing" element={<Analyzing />} />
    </Routes>
  </ImageProvider>
</BrowserRouter>
);
