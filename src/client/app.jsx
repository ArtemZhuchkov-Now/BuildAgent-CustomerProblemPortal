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

  useEffect(() => {
    loadProblems();
  }, [service]);

  const loadProblems = async () => {
    setLoading(true);
    setSearchActive(false);
    try {
      const problemData = await service.getKnownProblems();
      setProblems(problemData);
    } catch (error) {
      console.error('Failed to load problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm) => {
    setLoading(true);
    setSearchActive(true);
    try {
      const searchResults = await service.searchProblems(searchTerm);
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
        {currentView === 'list' && (
          <div style={{ marginTop: '20px' }}>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px 16px', 
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              📊 {problems.length} active problems tracked
            </span>
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
              marginBottom: '20px' 
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
                background: '#e3f2fd', 
                padding: '15px 20px', 
                borderRadius: '8px',
                margin: '20px 0',
                border: '1px solid #2196f3'
              }}>
                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                  🔍 Search Results
                </span>
                <button 
                  onClick={loadProblems}
                  style={{
                    float: 'right',
                    background: 'transparent',
                    border: '1px solid #1976d2',
                    color: '#1976d2',
                    padding: '5px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Show All Problems
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