import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home.jsx';
import GameContainer from './components/GameContainer.jsx';
import ContactPage from './components/ContactPage.jsx';
import ResumePage from './components/ResumePage.jsx';
import { applySeoForRoute } from './seo.js';

function SeoRouteEffects() {
  const location = useLocation();

  useEffect(() => {
    applySeoForRoute(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <SeoRouteEffects />
      <Routes>
        <Route path="/" element={<GameContainer />} />
        <Route path="/home" element={<Home />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
