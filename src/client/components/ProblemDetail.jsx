import React, { useState, useEffect } from 'react';
import { display, value } from '../utils/fields.js';
import './ProblemDetail.css';

export default function ProblemDetail({ problem, service, onBack }) {
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [communityVotes, setCommunityVotes] = useState({});
  const [newSolution, setNewSolution] = useState('');
  const [loading, setLoading] = useState(true);

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
          helpful: Math.floor(Math.random() * 20),
          notHelpful: Math.floor(Math.random() * 5)
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
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!newSolution.trim()) return;

    try {
      await service.submitSolution(value(problem.sys_id), newSolution);
      setNewSolution('');
      alert('Thank you! Your solution has been submitted and will be reviewed.');
      loadKnowledgeArticles(); // Refresh the list
    } catch (error) {
      console.error('Error submitting solution:', error);
      alert('Failed to submit solution. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    const priorityNum = display(priority);
    switch (priorityNum) {
      case '1': return '#ff4444';
      case '2': return '#ff8800';
      case '3': return '#ffcc00';
      case '4': return '#44aa44';
      default: return '#999';
    }
  };

  const getStateInfo = (state) => {
    const stateNum = display(state);
    switch (stateNum) {
      case '1': return { text: 'New', color: '#1976d2' };
      case '2': return { text: 'In Progress', color: '#f57c00' };
      case '3': return { text: 'Analysis', color: '#7b1fa2' };
      case '4': return { text: 'Resolved', color: '#388e3c' };
      case '5': return { text: 'Closed', color: '#616161' };
      default: return { text: 'Unknown', color: '#616161' };
    }
  };

  if (loading) {
    return (
      <div className="problem-detail">
        <button onClick={onBack} className="back-button">
          ← Back to Problems
        </button>
        <div className="loading">Loading problem details...</div>
      </div>
    );
  }

  const stateInfo = getStateInfo(problem.state);

  return (
    <div className="problem-detail">
      <button onClick={onBack} className="back-button">
        ← Back to Problems
      </button>

      <div className="problem-header-card">
        <div className="problem-badges">
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(problem.priority) }}
          >
            Priority {display(problem.priority)}
          </span>
          <span 
            className="state-badge"
            style={{ backgroundColor: stateInfo.color }}
          >
            {stateInfo.text}
          </span>
        </div>

        <h1 className="problem-title">{display(problem.short_description)}</h1>
        <p className="problem-number">Problem: {display(problem.number)}</p>
        
        <div className="problem-description">
          <h3>Description</h3>
          <p>{display(problem.description) || 'No detailed description available.'}</p>
        </div>

        <div className="problem-meta">
          <span>Last Updated: {new Date(display(problem.sys_updated_on)).toLocaleString()}</span>
        </div>
      </div>

      <div className="solutions-section">
        <h2>Available Solutions $[AMP] Workarounds</h2>
        
        {knowledgeArticles.length === 0 ? (
          <div className="no-solutions">
            <p>No solutions or workarounds are currently available for this problem.</p>
            <p>Be the first to share a solution with the community!</p>
          </div>
        ) : (
          <div className="solutions-list">
            {knowledgeArticles.map(article => {
              const votes = communityVotes[value(article.sys_id)] || { helpful: 0, notHelpful: 0 };
              const totalVotes = votes.helpful + votes.notHelpful;
              const helpfulPercentage = totalVotes > 0 ? Math.round((votes.helpful / totalVotes) * 100) : 0;

              return (
                <div key={value(article.sys_id)} className="solution-card">
                  <div className="solution-header">
                    <h4>{display(article.short_description)}</h4>
                    <div className="vote-summary">
                      <span className="helpful-percentage">{helpfulPercentage}% helpful</span>
                      <span className="vote-count">({totalVotes} votes)</span>
                    </div>
                  </div>

                  <div className="solution-content">
                    <div dangerouslySetInnerHTML={{ __html: display(article.text) || 'No content available.' }} />
                  </div>

                  <div className="solution-footer">
                    <div className="solution-meta">
                      <span>By: {display(article.author) || 'Anonymous'}</span>
                      <span>Published: {new Date(display(article.sys_created_on)).toLocaleDateString()}</span>
                    </div>

                    <div className="voting-buttons">
                      <button 
                        className="vote-button helpful"
                        onClick={() => handleVote(value(article.sys_id), true)}
                      >
                        👍 Helpful ({votes.helpful})
                      </button>
                      <button 
                        className="vote-button not-helpful"
                        onClick={() => handleVote(value(article.sys_id), false)}
                      >
                        👎 Not Helpful ({votes.notHelpful})
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
        <h2>Share Your Solution</h2>
        <p>Have you found a workaround or solution? Share it with the community!</p>
        
        <form onSubmit={handleSubmitSolution} className="solution-form">
          <textarea
            value={newSolution}
            onChange={(e) => setNewSolution(e.target.value)}
            placeholder="Describe your solution or workaround in detail..."
            className="solution-textarea"
            rows={6}
          />
          <button type="submit" className="submit-solution" disabled={!newSolution.trim()}>
            Submit Solution
          </button>
        </form>
      </div>
    </div>
  );
}