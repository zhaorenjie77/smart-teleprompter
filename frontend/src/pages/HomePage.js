import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalScripts: 0,
    totalSessions: 0,
    totalTime: 0
  });

  return (
    <div className="home-page">
      <PageHeader title="Smart Teleprompter" showBack={false} />
      
      <div className="home-greeting">
        <h2>你好 👋</h2>
        <p>准备开始今天的演讲了吗？</p>
      </div>

      <div className="quick-actions">
        <h2 className="section-title">快速开始</h2>
        <div className="action-grid">
          <button 
            className="action-card primary"
            onClick={() => navigate('/scripts')}
          >
            <div className="action-icon">📝</div>
            <div className="action-content">
              <h3>上传演讲稿</h3>
              <p>开始新的演讲准备</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/teleprompter')}
          >
            <div className="action-icon">🎤</div>
            <div className="action-content">
              <h3>开始演讲</h3>
              <p>实时追踪提词</p>
            </div>
          </button>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">功能特点</h2>
        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div className="feature-text">
              <h4>智能追踪</h4>
              <p>语义匹配，精准定位</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🌏</div>
            <div className="feature-text">
              <h4>中英混合</h4>
              <p>支持多语言演讲</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <div className="feature-text">
              <h4>AI 问答</h4>
              <p>智能回答建议</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <div className="feature-text">
              <h4>进度跟踪</h4>
              <p>实时演讲状态</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tips-section">
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h4>使用提示</h4>
            <p>建议在演讲前30分钟上传演讲稿，让系统有充分时间进行预处理。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

