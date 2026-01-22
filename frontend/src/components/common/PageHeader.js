import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

const PageHeader = ({ 
  title, 
  showBack = true, 
  rightAction = null,
  onBack = null 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="page-header-bar">
      <div className="header-left">
        {showBack && (
          <button className="back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      <div className="header-center">
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        {rightAction}
      </div>
    </header>
  );
};

export default PageHeader;




