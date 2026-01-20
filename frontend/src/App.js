import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TabBar from './components/common/TabBar';
import HomePage from './pages/HomePage';
import ScriptsPage from './pages/ScriptsPage';
import TeleprompterPage from './pages/TeleprompterPage';
import QAPage from './pages/QAPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  const [segments, setSegments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({ script: false, ppt: false });

  const handleScriptUploaded = (newSegments) => {
    setSegments(newSegments);
    setUploadStatus({ ...uploadStatus, script: true });
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/scripts" 
            element={<ScriptsPage onScriptUploaded={handleScriptUploaded} />} 
          />
          <Route 
            path="/teleprompter" 
            element={<TeleprompterPage segments={segments} />} 
          />
          <Route path="/qa" element={<QAPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <TabBar />
      </div>
    </Router>
  );
}

export default App;

