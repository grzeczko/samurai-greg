import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import GameContainer from './components/GameContainer.jsx';
import ContactPage from './components/ContactPage.jsx';
import ResumePage from './components/ResumePage.jsx';

function App() {
  return (
    <Router>
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
