import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TabBar.css';

const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { 
      path: '/', 
      icon: '🏠', 
      label: '首页',
      activeIcon: '🏠'
    },
    { 
      path: '/scripts', 
      icon: '📝', 
      label: '演讲稿',
      activeIcon: '📝'
    },
    { 
      path: '/teleprompter', 
      icon: '🎤', 
      label: '提词器',
      activeIcon: '🎤'
    },
    { 
      path: '/qa', 
      icon: '💬', 
      label: 'Q&A',
      activeIcon: '💬'
    },
    { 
      path: '/settings', 
      icon: '⚙️', 
      label: '设置',
      activeIcon: '⚙️'
    }
  ];

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tab-icon">
              {isActive ? tab.activeIcon : tab.icon}
            </span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;

