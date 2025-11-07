import React, { useState, useEffect } from 'react';
import { display, value } from '../utils/fields.js';
import './ProblemDetail.css';

export default function ProblemDetail({ problem, service, onBack }) {
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [communityVotes, setCommunityVotes] = useState({});
  const [newSolution, setNewSolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingSolution, setSubmittingSolution] = useState(false);

  useEffect(() => {
    loadKnowledgeArticles();
  }, [problem]);

  const loadKnowledgeArticles = async () => {
    try {
      const articles = await service.getRelatedKnowledgeArticles(value(problem.sys_id));
      setKnowledgeArticles(articles);
      
      // Initialize vote counts (simulated for POC)
      const votes = {};
      articles.forEach(article => {
        votes[value(article.sys_id)] = {
          helpful: article.helpful_count || Math.floor(Math.random() * 20) + 5,
          notHelpful: article.not_helpful_count || Math.floor(Math.random() * 5)
        };
      });
      setCommunityVotes(votes);
    } catch (error) {
      console.error('Error loading knowledge articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (articleId, isHelpful) => {
    try {
      await service.voteFeedback(articleId, isHelpful);
      
      // Update local vote counts
      setCommunityVotes(prev => ({
        ...prev,
        [articleId]: {
          ...prev[articleId],
          helpful: prev[articleId]?.helpful + (isHelpful ? 1 : 0) || (isHelpful ? 1 : 0),
          notHelpful: prev[articleId]?.notHelpful + (isHelpful ? 0 : 1) || (isHelpful ? 0 : 1)
        }
      }));

      // Show feedback
      const feedbackEl = document.createElement('div');
      feedbackEl.textContent = isHelpful ? '✅ Thanks for your feedback!' : '📝 Feedback recorded!';
      feedbackEl.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: ${isHelpful ? '#4caf50' : '#2196f3'}; color: white;
        padding: 12px 20px; border-radius: 6px; font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      `;
      document.body.appendChild(feedbackEl);
      setTimeout(() => document.body.removeChild(feedbackEl), 3000);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!newSolution.trim()) return;

    setSubmittingSolution(true);
    try {
      await service.submitSolution(value(problem.sys_id), newSolution);
      setNewSolution('');
      
      // Show success message
      const successEl = document.createElement('div');
      successEl.textContent = '🎉 Thank you! Your solution has been submitted for review.';
      successEl.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #4caf50; color: white;
        padding: 16px 24px; border-radius: 8px; font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 3.7s forwards;
      `;
      document.body.appendChild(successEl);
      setTimeout(() => document.body.removeChild(successEl), 4000);
      
      loadKnowledgeArticles(); // Refresh the list
    } catch (error) {
      console.error('Error submitting solution:', error);
      
      // Show error message
      const errorEl = document.createElement('div');
      errorEl.textContent = '❌ Failed to submit solution. Please try again.';
      errorEl.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        background: #f44336; color: white;
        padding: 16px 24px; border-radius: 8px; font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 3.7s forwards;
      `;
      document.body.appendChild(errorEl);
      setTimeout(() => document.body.removeChild(errorEl), 4000);
    } finally {
      setSubmittingSolution(false);
    }
  };

  const getPriorityInfo = (priority) => {
    const priorityNum = display(priority);
    switch (priorityNum) {
      case '1': return { text: 'Critical', color: '#ff4444', icon: '🔴' };
      case '2': return { text: 'High', color: '#ff8800', icon: '🟠' };
      case '3': return { text: 'Moderate', color: '#ffcc00', icon: '🟡' };
      case '4': return { text: 'Low', color: '#44aa44', icon: '🟢' };
      case '5': return { text: 'Planning', color: '#2196f3', icon: '🔵' };
      default: return null;
    }
  };

  const getStateInfo = (state) => {
    const stateNum = display(state);
    switch (stateNum) {
      case '1': return { text: 'New', color: '#1976d2', icon: '🆕' };
      case '2': return { text: 'In Progress', color: '#f57c00', icon: '⚙️' };
      case '3': return { text: 'Analysis', color: '#7b1fa2', icon: '🔍' };
      case '4': return { text: 'Resolved', color: '#388e3c', icon: '✅' };
      case '5': return { text: 'Closed', color: '#616161', icon: '📁' };
      case '6': return { text: 'Cancelled', color: '#d32f2f', icon: '❌' };
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="problem-detail">
        <button onClick={onBack} className="back-button">
          ← Back to Problems
        </button>
        <div className="loading-container">
          <div className="loading-spinner">🔄</div>
          <div className="loading-text">Loading problem details and community solutions...</div>
        </div>
      </div>
    );
  }

  const priorityInfo = getPriorityInfo(problem.priority);
  const stateInfo = getStateInfo(problem.state);
  const category = display(problem.category) || 'General';

  return (
    <div className="problem-detail">
      <button onClick={onBack} className="back-button">
        ← Back to Problems
      </button>

      <div className="problem-header-card">
        <div className="problem-badges">
          {priorityInfo && (
            <span 
              className="priority-badge"
              style={{ backgroundColor: priorityInfo.color }}
              title={`Priority: ${priorityInfo.text}`}
            >
              {priorityInfo.icon} {priorityInfo.text}
            </span>
          )}
          {stateInfo && (
            <span 
              className="state-badge"
              style={{ backgroundColor: stateInfo.color }}
              title={`Status: ${stateInfo.text}`}
            >
              {stateInfo.icon} {stateInfo.text}
            </span>
          )}
          <span className="category-badge" title={`Category: ${category}`}>
            📂 {category}
          </span>
        </div>

        <h1 className="problem-title">{display(problem.short_description)}</h1>
        <p className="problem-number">🎫 Problem: <strong>{display(problem.number)}</strong></p>
        
        <div className="problem-description">
          <h3>📋 Description</h3>
          <p>{display(problem.description) || 'No detailed description available.'}</p>
        </div>

        <div className="problem-meta">
          <div className="meta-item">
            <span className="meta-label">🕒 Last Updated:</span>
            <span className="meta-value">{new Date(display(problem.sys_updated_on)).toLocaleString()}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">📅 Created:</span>
            <span className="meta-value">{new Date(display(problem.sys_created_on)).toLocaleDateString()}</span>
          </div>
          {display(problem.assigned_to) && (
            <div className="meta-item">
              <span className="meta-label">👤 Assigned to:</span>
              <span className="meta-value">{display(problem.assigned_to)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="solutions-section">
        <div className="section-header">
          <h2>💡 Available Solutions & Workarounds</h2>
          <p className="section-subtitle">Community-contributed solutions and official workarounds</p>
        </div>
        
        {knowledgeArticles.length === 0 ? (
          <div className="no-solutions">
            <div className="no-solutions-icon">🤔</div>
            <h3>No Solutions Available Yet</h3>
            <p>No solutions or workarounds are currently available for this problem.</p>
            <p><strong>Be the first to share a solution with the community!</strong></p>
          </div>
        ) : (
          <div className="solutions-list">
            {knowledgeArticles.map((article, index) => {
              const votes = communityVotes[value(article.sys_id)] || { helpful: 0, notHelpful: 0 };
              const totalVotes = votes.helpful + votes.notHelpful;
              const helpfulPercentage = totalVotes > 0 ? Math.round((votes.helpful / totalVotes) * 100) : 0;

              return (
                <div key={value(article.sys_id)} className="solution-card">
                  <div className="solution-header">
                    <div className="solution-title-area">
                      <span className="solution-number">#{index + 1}</span>
                      <h4>{display(article.short_description)}</h4>
                    </div>
                    <div className="vote-summary">
                      <div className="helpful-percentage" title={`${votes.helpful} helpful, ${votes.notHelpful} not helpful`}>
                        ⭐ {helpfulPercentage}% helpful
                      </div>
                      <div className="vote-count">({totalVotes} vote{totalVotes !== 1 ? 's' : ''})</div>
                    </div>
                  </div>

                  <div className="solution-content">
                    <div dangerouslySetInnerHTML={{ __html: display(article.text) || 'No content available.' }} />
                  </div>

                  <div className="solution-footer">
                    <div className="solution-meta">
                      <span className="author-info">
                        👤 <strong>{display(article.author) || 'Anonymous'}</strong>
                      </span>
                      <span className="publish-date">
                        📅 {new Date(display(article.sys_created_on)).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="voting-buttons">
                      <button 
                        className="vote-button helpful"
                        onClick={() => handleVote(value(article.sys_id), true)}
                        title="Mark this solution as helpful"
                      >
                        👍 Helpful <span className="vote-count-badge">{votes.helpful}</span>
                      </button>
                      <button 
                        className="vote-button not-helpful"
                        onClick={() => handleVote(value(article.sys_id), false)}
                        title="Mark this solution as not helpful"
                      >
                        👎 Not Helpful <span className="vote-count-badge">{votes.notHelpful}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="community-section">
        <div className="section-header">
          <h2>🤝 Share Your Solution</h2>
          <p className="section-subtitle">Found a workaround or solution? Help the community by sharing it!</p>
        </div>
        
        <form onSubmit={handleSubmitSolution} className="solution-form">
          <div className="form-group">
            <label htmlFor="solution-textarea" className="form-label">
              ✍️ Describe your solution or workaround in detail:
            </label>
            <textarea
              id="solution-textarea"
              value={newSolution}
              onChange={(e) => setNewSolution(e.target.value)}
              placeholder="Please provide:
• Step-by-step instructions
• What worked for you
• Any prerequisites or requirements
• Success rate or testing details
• Any warnings or limitations"
              className="solution-textarea"
              rows={8}
              disabled={submittingSolution}
            />
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-solution" 
              disabled={!newSolution.trim() || submittingSolution}
            >
              {submittingSolution ? (
                <>🔄 Submitting...</>
              ) : (
                <>📤 Submit Solution</>
              )}
            </button>
            <p className="form-note">
              💡 Your solution will be reviewed and published to help other users
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}