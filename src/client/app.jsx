import React, { useState, useEffect, useMemo } from 'react';
import { ProblemService } from './services/ProblemService.js';
import ProblemList from './components/ProblemList.jsx';
import ProblemDetail from './components/ProblemDetail.jsx';

export default function App() {
  const service = useMemo(() => new ProblemService(), []);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [searchActive, setSearchActive] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadProblems();
    loadStats();
  }, [service]);

  const loadProblems = async (filters = {}) => {
    setLoading(true);
    setSearchActive(false);
    try {
      const problemData = await service.getKnownProblems(filters);
      setProblems(problemData);
    } catch (error) {
      console.error('Failed to load problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await service.getProblemStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = async (searchTerm, filters = {}) => {
    setLoading(true);
    setSearchActive(true);
    try {
      const searchResults = await service.searchProblems(searchTerm, filters);
      setProblems(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProblem(null);
    // Reload problems if we were searching
    if (searchActive) {
      loadProblems();
    }
  };

  const renderHeader = () => (
    <header className="modern-header">
      <div className="header-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="header-content">
        <div className="header-main">
          <div className="brand-section">
            <div className="ai-icon">
              <div className="ai-pulse"></div>
              🤖
            </div>
            <div className="title-section">
              <h1 className="main-title">
                AI-Powered Problem Intelligence
              </h1>
              <p className="subtitle">
                Self-service problem prevention with intelligent insights and community solutions
              </p>
            </div>
          </div>
          
          {currentView === 'list' && stats && (
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Problems Tracked</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .modern-header {
          position: relative;
          background: linear-gradient(135deg, 
            #1a1a2e 0%, 
            #16213e 20%, 
            #0f3460 60%, 
            #533483 100%);
          color: white;
          padding: 40px 20px;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          align-items: center;
        }
        
        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
        }
        
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.3;
          animation: float 6s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(45deg, #a8e6cf, #dcedc8);
          top: 50%;
          right: -75px;
          animation-delay: 2s;
        }
        
        .orb-3 {
          width: 120px;
          height: 120px;
          background: linear-gradient(45deg, #ffd93d, #ff9ff3);
          bottom: -60px;
          left: 50%;
          animation-delay: 4s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        .header-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          z-index: 1;
        }
        
        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 30px;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }
        
        .ai-icon {
          position: relative;
          font-size: 48px;
          animation: pulse 2s infinite;
        }
        
        .ai-pulse {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: pulse-ring 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        
        .title-section {
          flex: 1;
        }
        
        .main-title {
          margin: 0;
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #a8e6cf 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          line-height: 1.2;
        }
        
        .subtitle {
          margin: 10px 0 0 0;
          font-size: 18px;
          opacity: 0.9;
          color: #e8f4f8;
          font-weight: 300;
          line-height: 1.4;
        }
        
        .stats-section {
          display: flex;
          gap: 20px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        
        .stat-icon {
          font-size: 32px;
          opacity: 0.8;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 13px;
          opacity: 0.8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        @media (max-width: 768px) {
          .modern-header {
            padding: 30px 20px;
            min-height: 160px;
          }
          
          .header-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          
          .brand-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .main-title {
            font-size: 28px;
          }
          
          .subtitle {
            font-size: 16px;
          }
          
          .ai-icon {
            font-size: 40px;
          }
          
          .stat-card {
            min-width: 150px;
            padding: 16px;
          }
          
          .stat-number {
            font-size: 24px;
          }
        }
        
        @media (max-width: 480px) {
          .brand-section {
            flex-direction: row;
            align-items: center;
          }
          
          .main-title {
            font-size: 24px;
          }
          
          .subtitle {
            font-size: 14px;
          }
        }
      `}</style>
    </header>
  );

  const renderFooter = () => (
    <footer style={{ 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white', 
      textAlign: 'center', 
      padding: '40px 20px',
      marginTop: '50px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>
          🤖 AI-Powered Problem Intelligence Portal
        </p>
        <p style={{ margin: '0', opacity: '0.8', fontSize: '14px' }}>
          Intelligent insights • Community solutions • Proactive prevention • Powered by ServiceNow
        </p>
        {stats && (
          <div style={{ 
            marginTop: '25px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '30px', 
            flexWrap: 'wrap',
            fontSize: '13px',
            opacity: '0.7'
          }}>
            <span>📈 {stats.total} Problems Tracked</span>
            <span>🎯 AI-Enhanced Analytics</span>
            <span>⭐ Community Powered</span>
          </div>
        )}
      </div>
    </footer>
  );

  if (loading && currentView === 'list') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {renderHeader()}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
          <div style={{ 
            textAlign: 'center',
            background: 'white',
            padding: '60px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px',
              animation: 'spin 2s linear infinite'
            }}>🤖</div>
            <div style={{ 
              fontSize: '20px', 
              color: '#4a5568',
              marginBottom: '10px',
              fontWeight: '600'
            }}>
              AI is analyzing problems...
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#718096'
            }}>
              Gathering intelligence from the ServiceNow problem database
            </div>
          </div>
        </main>
        {renderFooter()}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {renderHeader()}

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {currentView === 'list' && (
          <div>
            {searchActive && (
              <div style={{ 
                background: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)', 
                padding: '16px 24px', 
                borderRadius: '12px',
                margin: '24px 0',
                border: '1px solid #38b2ac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px rgba(56, 178, 172, 0.1)'
              }}>
                <span style={{ color: '#234e52', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🔍 <strong>AI Search Results</strong> - Found {problems.length} matching problems
                </span>
                <button 
                  onClick={loadProblems}
                  style={{
                    background: 'white',
                    border: '2px solid #38b2ac',
                    color: '#38b2ac',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#38b2ac';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#38b2ac';
                  }}
                >
                  📋 Show All Problems
                </button>
              </div>
            )}
            <ProblemList 
              problems={problems}
              onSelectProblem={handleSelectProblem}
              onSearch={handleSearch}
              problemService={service}
            />
          </div>
        )}

        {currentView === 'detail' && selectedProblem && (
          <ProblemDetail 
            problem={selectedProblem}
            service={service}
            onBack={handleBackToList}
          />
        )}
      </main>

      {renderFooter()}
    </div>
  );
}