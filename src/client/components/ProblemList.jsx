import React, { useState, useEffect, useMemo } from 'react';
import { display, value } from '../utils/fields.js';
import './ProblemList.css';

export default function ProblemList({ problems, onSelectProblem, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    severity: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [hideDuplicates, setHideDuplicates] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = new Set();
    const severities = new Set();
    const statuses = new Set();

    problems.forEach(problem => {
      // Get category from category field or derive from short_description
      const category = display(problem.category) || 'General';
      categories.add(category);
      
      // Get severity/priority
      const severity = display(problem.priority);
      if (severity) severities.add(severity);
      
      // Get status
      const status = display(problem.state);
      if (status) statuses.add(status);
    });

    return {
      categories: Array.from(categories).sort(),
      severities: Array.from(severities).sort(),
      statuses: Array.from(statuses).sort()
    };
  }, [problems]);

  // Remove duplicates based on short_description
  const deduplicatedProblems = useMemo(() => {
    if (!hideDuplicates) return problems;
    
    const seen = new Set();
    const uniqueProblems = [];
    
    problems.forEach(problem => {
      const title = display(problem.short_description).toLowerCase().trim();
      if (!seen.has(title)) {
        seen.add(title);
        uniqueProblems.push(problem);
      }
    });
    
    return uniqueProblems;
  }, [problems, hideDuplicates]);

  // Filter problems based on current filters and search
  const filteredProblems = useMemo(() => {
    let result = deduplicatedProblems;

    // Apply text search only if in search mode
    if (isSearchMode && searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(problem => {
        const titleMatch = display(problem.short_description).toLowerCase().includes(searchLower);
        const descMatch = display(problem.description).toLowerCase().includes(searchLower);
        const numberMatch = display(problem.number).toLowerCase().includes(searchLower);
        
        return titleMatch || descMatch || numberMatch;
      });
    }

    // Apply filters only if not in search mode OR if no search term
    if (!isSearchMode || !searchTerm) {
      result = result.filter(problem => {
        // Category filter
        if (filters.category !== 'all') {
          const problemCategory = display(problem.category) || 'General';
          if (problemCategory !== filters.category) {
            return false;
          }
        }

        // Severity filter
        if (filters.severity !== 'all') {
          const problemPriority = display(problem.priority);
          if (problemPriority !== filters.severity) {
            return false;
          }
        }

        // Status filter
        if (filters.status !== 'all') {
          const problemState = display(problem.state);
          if (problemState !== filters.status) {
            return false;
          }
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
          const problemDate = new Date(display(problem.sys_updated_on));
          const now = new Date();
          const daysDiff = (now - problemDate) / (1000 * 60 * 60 * 24);

          switch (filters.dateRange) {
            case 'today':
              if (daysDiff > 1) return false;
              break;
            case 'week':
              if (daysDiff > 7) return false;
              break;
            case 'month':
              if (daysDiff > 30) return false;
              break;
          }
        }

        return true;
      });
    }

    return result;
  }, [deduplicatedProblems, searchTerm, filters, isSearchMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = e.target.search.value.trim();
    setSearchTerm(term);
    setIsSearchMode(!!term);
    
    if (term && onSearch) {
      onSearch(term);
    }
  };

  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsSearchMode(!!term);
    
    // Clear search mode if term is empty
    if (!term) {
      setIsSearchMode(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    // Clear search mode when using filters
    if (value !== 'all') {
      setIsSearchMode(false);
      setSearchTerm('');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      severity: 'all',
      status: 'all',
      dateRange: 'all'
    });
    setSearchTerm('');
    setIsSearchMode(false);
  };

  const toggleDuplicates = () => {
    setHideDuplicates(!hideDuplicates);
  };

  const getPriorityBadge = (priority) => {
    const priorityNum = display(priority);
    if (!priorityNum || priorityNum === '') {
      return null; // Don't show unknown badges
    }
    
    switch (priorityNum) {
      case '1': return { class: 'priority-critical', text: 'Critical', icon: '🔴' };
      case '2': return { class: 'priority-high', text: 'High', icon: '🟠' };
      case '3': return { class: 'priority-moderate', text: 'Moderate', icon: '🟡' };
      case '4': return { class: 'priority-low', text: 'Low', icon: '🟢' };
      case '5': return { class: 'priority-planning', text: 'Planning', icon: '🔵' };
      default: return null;
    }
  };

  const getStateBadge = (state) => {
    const stateNum = display(state);
    if (!stateNum || stateNum === '') {
      return null; // Don't show unknown badges
    }

    switch (stateNum) {
      case '1': return { class: 'state-new', text: 'New', icon: '🆕' };
      case '2': return { class: 'state-progress', text: 'In Progress', icon: '⚙️' };
      case '3': return { class: 'state-analysis', text: 'Analysis', icon: '🔍' };
      case '4': return { class: 'state-resolved', text: 'Resolved', icon: '✅' };
      case '5': return { class: 'state-closed', text: 'Closed', icon: '📁' };
      case '6': return { class: 'state-cancelled', text: 'Cancelled', icon: '❌' };
      default: return null;
    }
  };

  const getActiveFiltersCount = () => {
    const filterCount = Object.values(filters).filter(value => value !== 'all').length;
    const searchCount = isSearchMode && searchTerm ? 1 : 0;
    return filterCount + searchCount;
  };

  const getDuplicateCount = () => {
    const totalProblems = problems.length;
    const uniqueProblems = deduplicatedProblems.length;
    return totalProblems - uniqueProblems;
  };

  return (
    <div className="problem-list">
      {/* Enhanced Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <input 
              name="search" 
              type="text" 
              placeholder="🔍 Search problems by title, description, or number..." 
              className="search-input"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="clear-search" 
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchMode(false);
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="search-button">Search</button>
          <button 
            type="button" 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            🎛️ Filters {getActiveFiltersCount() > 0 && <span className="filter-count">({getActiveFiltersCount()})</span>}
          </button>
        </form>

        {/* Duplicate Toggle */}
        <div className="duplicate-toggle-section">
          <label className="duplicate-toggle">
            <input 
              type="checkbox" 
              checked={hideDuplicates}
              onChange={toggleDuplicates}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              🔗 Hide Duplicate Problems
              {getDuplicateCount() > 0 && (
                <span className="duplicate-count"> ({getDuplicateCount()} duplicates found)</span>
              )}
            </span>
          </label>
        </div>

        {/* Faceted Filters */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <h3>Filter Problems</h3>
              <div className="filter-actions">
                {isSearchMode && (
                  <button 
                    className="exit-search-mode" 
                    onClick={() => {
                      setIsSearchMode(false);
                      setSearchTerm('');
                    }}
                  >
                    Exit Search Mode
                  </button>
                )}
                {getActiveFiltersCount() > 0 && (
                  <button className="clear-filters" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
            
            {!isSearchMode && (
              <div className="filters-grid">
                {/* Category Filter */}
                <div className="filter-group">
                  <label htmlFor="category-filter">📂 Category</label>
                  <select 
                    id="category-filter"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {filterOptions.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Severity Filter */}
                <div className="filter-group">
                  <label htmlFor="severity-filter">⚡ Priority</label>
                  <select 
                    id="severity-filter"
                    value={filters.severity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Priorities</option>
                    <option value="1">Critical</option>
                    <option value="2">High</option>
                    <option value="3">Moderate</option>
                    <option value="4">Low</option>
                    <option value="5">Planning</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="filter-group">
                  <label htmlFor="status-filter">📊 Status</label>
                  <select 
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="1">New</option>
                    <option value="2">In Progress</option>
                    <option value="3">Analysis</option>
                    <option value="4">Resolved</option>
                    <option value="5">Closed</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="filter-group">
                  <label htmlFor="date-filter">📅 Updated</label>
                  <select 
                    id="date-filter"
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Any Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            )}
            
            {isSearchMode && (
              <div className="search-mode-info">
                <p>🔍 <strong>Search Mode Active</strong> - Filters are disabled while searching. Clear search to use filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <div className="results-info">
          <span className="results-count">
            📋 Showing <strong>{filteredProblems.length}</strong> of <strong>{problems.length}</strong> problems
          </span>
          {hideDuplicates && getDuplicateCount() > 0 && (
            <span className="duplicate-info">
              • {getDuplicateCount()} duplicate{getDuplicateCount() > 1 ? 's' : ''} hidden
            </span>
          )}
          {getActiveFiltersCount() > 0 && (
            <span className="active-filters">
              • {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
            </span>
          )}
          {isSearchMode && (
            <span className="search-mode-indicator">
              • Search mode
            </span>
          )}
        </div>
      </div>

      {/* Problems Grid */}
      <div className="problems-grid">
        {filteredProblems.length === 0 ? (
          <div className="no-problems">
            {problems.length === 0 ? (
              <>
                <div className="no-problems-icon">🎉</div>
                <h3>No Known Problems!</h3>
                <p>Great news! There are no active problems to display.</p>
              </>
            ) : (
              <>
                <div className="no-problems-icon">🔍</div>
                <h3>No Problems Match Your Criteria</h3>
                <p>Try adjusting your search terms or filters to find what you're looking for.</p>
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        ) : (
          filteredProblems.map(problem => {
            const priority = getPriorityBadge(problem.priority);
            const state = getStateBadge(problem.state);
            const category = display(problem.category) || 'General';
            
            return (
              <div 
                key={value(problem.sys_id)} 
                className="problem-card"
                onClick={() => onSelectProblem(problem)}
              >
                <div className="problem-header">
                  <div className="badges-container">
                    {priority && (
                      <span className={`priority-badge ${priority.class}`} title={`Priority: ${priority.text}`}>
                        {priority.icon} {priority.text}
                      </span>
                    )}
                    {state && (
                      <span className={`state-badge ${state.class}`} title={`Status: ${state.text}`}>
                        {state.icon} {state.text}
                      </span>
                    )}
                    <span className="category-badge" title={`Category: ${category}`}>
                      📂 {category}
                    </span>
                  </div>
                </div>
                
                <h3 className="problem-title">
                  {display(problem.short_description)}
                </h3>
                
                <p className="problem-description">
                  {display(problem.description) ? 
                    `${display(problem.description).substring(0, 150)}${display(problem.description).length > 150 ? '...' : ''}` :
                    'No description available.'
                  }
                </p>
                
                <div className="problem-meta">
                  <span className="problem-number" title="Problem Number">
                    🎫 {display(problem.number)}
                  </span>
                  <span className="problem-updated" title="Last Updated">
                    🕒 {new Date(display(problem.sys_updated_on)).toLocaleDateString()}
                  </span>
                </div>

                {/* Hover overlay for better UX */}
                <div className="problem-overlay">
                  <span className="view-details">👀 View Details</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}