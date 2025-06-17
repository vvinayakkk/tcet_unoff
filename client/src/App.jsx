import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Landing';
import GTranslate from './components/Gtranslate';
import Login from './pages/Login';
import Register from './pages/Signup';
import CommunicationAIDashboard from './pages/dashboard';
import VoiceInputPage from './pages/VoiceInput';
import CommunicationsPage from './pages/Communication';
// import AgentLearningDashboard from './pages/agentLearning';
import UserPreferencesPage from './pages/userPrefrences';
import SettingsPage from './pages/Settings';
import NewPage from './pages/NewPage';
import LandingPage from './pages/LandingPage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* Move GTranslate outside of Routes */}
      <GTranslate /> 

      <Routes>
        {/* <Route path='/' element={<Home />} /> */}
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<CommunicationAIDashboard />} />
        <Route path='/voice' element={<VoiceInputPage />} />
        <Route path='/communication' element={<CommunicationsPage />} />
        {/* <Route path='/learning' element={<AgentLearningDashboard />} /> */}
        <Route path='/preference' element={<UserPreferencesPage />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/new' element={<NewPage />} />

      </Routes>
    </>
  );
}

export default App;
