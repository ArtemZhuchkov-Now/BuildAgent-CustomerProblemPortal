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
    <header style={{ 
      background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)', 
      color: 'white', 
      padding: '30px 20px',
      marginBottom: '0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          margin: '0', 
          fontSize: '32px', 
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🚨 Self-Service Problem Prevention Portal
        </h1>
        <p style={{ 
          margin: '15px 0 0 0', 
          opacity: '0.95',
          fontSize: '18px',
          maxWidth: '600px'
        }}>
          Stay informed about known issues, find community solutions, and share your workarounds
        </p>
        {currentView === 'list' && stats && (
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            gap: '20px', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📊 <strong>{stats.total}</strong> active problems tracked
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🔴 <strong>{stats.byPriority['1'] || 0}</strong> critical
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚙️ <strong>{stats.byState['2'] || 0}</strong> in progress
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ✅ <strong>{stats.byState['4'] || 0}</strong> resolved today
            </div>
          </div>
        )}
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer style={{ 
      background: '#333', 
      color: 'white', 
      textAlign: 'center', 
      padding: '30px 20px',
      marginTop: '50px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
          🤝 Self-Service Problem Prevention Portal
        </p>
        <p style={{ margin: '0', opacity: '0.7', fontSize: '14px' }}>
          Community-driven solutions • Proactive notifications • Real-time updates
        </p>
        {stats && (
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '30px', 
            flexWrap: 'wrap',
            fontSize: '14px',
            opacity: '0.8'
          }}>
            <span>📈 {stats.total} Problems Tracked</span>
            <span>🎯 {Object.keys(stats.byCategory).length} Categories</span>
            <span>⭐ Community Powered</span>
          </div>
        )}
      </div>
    </footer>
  );

  if (loading && currentView === 'list') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {renderHeader()}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
          <div style={{ 
            textAlign: 'center',
            background: 'white',
            padding: '60px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px',
              animation: 'spin 2s linear infinite'
            }}>🔄</div>
            <div style={{ 
              fontSize: '20px', 
              color: '#666',
              marginBottom: '10px'
            }}>
              Loading known problems...
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#999'
            }}>
              Fetching the latest problem reports and community solutions
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {renderHeader()}

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {currentView === 'list' && (
          <div>
            {searchActive && (
              <div style={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                padding: '15px 20px', 
                borderRadius: '8px',
                margin: '20px 0',
                border: '1px solid #2196f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#1976d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔍 <strong>Search Results</strong> - Found {problems.length} matching problems
                </span>
                <button 
                  onClick={loadProblems}
                  style={{
                    background: 'white',
                    border: '1px solid #1976d2',
                    color: '#1976d2',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1976d2';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#1976d2';
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