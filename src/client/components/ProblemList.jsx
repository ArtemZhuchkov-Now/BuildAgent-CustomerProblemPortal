import React from 'react';
import { display, value } from '../utils/fields.js';
import './ProblemList.css';

export default function ProblemList({ problems, onSelectProblem, onSearch }) {
  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value.trim();
    if (searchTerm) {
      onSearch(searchTerm);
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityNum = display(priority);
    switch (priorityNum) {
      case '1': return { class: 'priority-critical', text: 'Critical' };
      case '2': return { class: 'priority-high', text: 'High' };
      case '3': return { class: 'priority-moderate', text: 'Moderate' };
      case '4': return { class: 'priority-low', text: 'Low' };
      default: return { class: 'priority-unknown', text: 'Unknown' };
    }
  };

  const getStateBadge = (state) => {
    const stateNum = display(state);
    switch (stateNum) {
      case '1': return { class: 'state-new', text: 'New' };
      case '2': return { class: 'state-progress', text: 'In Progress' };
      case '3': return { class: 'state-analysis', text: 'Analysis' };
      case '4': return { class: 'state-resolved', text: 'Resolved' };
      case '5': return { class: 'state-closed', text: 'Closed' };
      default: return { class: 'state-unknown', text: 'Unknown' };
    }
  };

  return (
    <div className="problem-list">
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            name="search" 
            type="text" 
            placeholder="Search problems by description..." 
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      <div className="problems-grid">
        {problems.length === 0 ? (
          <div className="no-problems">
            <p>No known problems found. Great news!</p>
          </div>
        ) : (
          problems.map(problem => {
            const priority = getPriorityBadge(problem.priority);
            const state = getStateBadge(problem.state);
            
            return (
              <div 
                key={value(problem.sys_id)} 
                className="problem-card"
                onClick={() => onSelectProblem(problem)}
              >
                <div className="problem-header">
                  <span className={`priority-badge ${priority.class}`}>
                    {priority.text}
                  </span>
                  <span className={`state-badge ${state.class}`}>
                    {state.text}
                  </span>
                </div>
                
                <h3 className="problem-title">
                  {display(problem.short_description)}
                </h3>
                
                <p className="problem-description">
                  {display(problem.description).substring(0, 150)}...
                </p>
                
                <div className="problem-meta">
                  <span className="problem-number">
                    {display(problem.number)}
                  </span>
                  <span className="problem-updated">
                    Updated: {new Date(display(problem.sys_updated_on)).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}