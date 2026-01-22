import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TabBar from './components/common/TabBar';
import HomePage from './pages/HomePage';
import ScriptsPage from './pages/ScriptsPage';
import TeleprompterPage from './pages/TeleprompterPage';
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
          <Route 
            path="/qa" 
            element={
              <div className="page-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">💬</div>
                  <h2>Q&A 功能</h2>
                  <p>此功能正在开发中...</p>
                  <p>敬请期待！</p>
                </div>
              </div>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <div className="page-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">⚙️</div>
                  <h2>设置</h2>
                  <p>此功能正在开发中...</p>
                  <p>敬请期待！</p>
                </div>
              </div>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <TabBar />
      </div>
    </Router>
  );
}

export default App;




