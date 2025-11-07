import React, { useState, useEffect, useMemo } from 'react';
import { display, value } from '../utils/fields.js';
import './ProblemList.css';

export default function ProblemList({ problems, onSelectProblem, onSearch, problemService }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    state: 'all',
    active: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [hideDuplicates, setHideDuplicates] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Choice lists from ServiceNow
  const [choiceLists, setChoiceLists] = useState({
    categories: [],
    priorities: [],
    states: []
  });

  // Fetch choice lists on component mount
  useEffect(() => {
    const fetchChoiceLists = async () => {
      if (problemService) {
        try {
          const [categories, priorities, states] = await Promise.all([
            problemService.getProblemCategories(),
            problemService.getProblemPriorities(),
            problemService.getProblemStates()
          ]);
          
          console.log('Fetched choice lists:', { categories, priorities, states });
          
          setChoiceLists({
            categories: categories || [],
            priorities: priorities || [],
            states: states || []
          });
        } catch (error) {
          console.error('Error fetching choice lists:', error);
          // Set fallback choice lists based on actual ServiceNow schema
          setChoiceLists({
            categories: [
              { value: 'software', label: 'Software' },
              { value: 'hardware', label: 'Hardware' },
              { value: 'network', label: 'Network' },
              { value: 'database', label: 'Database' }
            ],
            priorities: [
              { value: '1', label: '1 - Critical' },
              { value: '2', label: '2 - High' },
              { value: '3', label: '3 - Moderate' },
              { value: '4', label: '4 - Low' },
              { value: '5', label: '5 - Planning' }
            ],
            states: [
              { value: '101', label: 'New' },
              { value: '102', label: 'Assess' },
              { value: '103', label: 'Root Cause Analysis' },
              { value: '104', label: 'Fix in Progress' },
              { value: '106', label: 'Resolved' },
              { value: '107', label: 'Closed' }
            ]
          });
        }
      }
    };

    fetchChoiceLists();
  }, [problemService]);

  // Helper function to get choice label from value
  const getChoiceLabel = (choiceList, choiceValue) => {
    const choice = choiceList.find(c => c.value === choiceValue);
    return choice ? choice.label : choiceValue;
  };

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
        // Category filter - using the correct value comparison
        if (filters.category !== 'all') {
          const problemCategory = value(problem.category); // Use value() not display()
          if (problemCategory !== filters.category) {
            return false;
          }
        }

        // Priority filter - using the correct value comparison
        if (filters.priority !== 'all') {
          const problemPriority = value(problem.priority); // Use value() not display()
          if (problemPriority !== filters.priority) {
            return false;
          }
        }

        // State filter - using the correct value comparison
        if (filters.state !== 'all') {
          const problemState = value(problem.state); // Use value() not display()
          if (problemState !== filters.state) {
            return false;
          }
        }

        // Active filter - new filter
        if (filters.active !== 'all') {
          const problemActive = value(problem.active);
          const isActive = problemActive === 'true' || problemActive === true;
          if (filters.active === 'true' && !isActive) {
            return false;
          }
          if (filters.active === 'false' && isActive) {
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
      priority: 'all',
      state: 'all',
      active: 'all',
      dateRange: 'all'
    });
    setSearchTerm('');
    setIsSearchMode(false);
  };

  const toggleDuplicates = () => {
    setHideDuplicates(!hideDuplicates);
  };

  const getPriorityBadge = (priority) => {
    const priorityValue = value(priority);
    if (!priorityValue || priorityValue === '') {
      return null; // Don't show unknown badges
    }
    
    switch (priorityValue) {
      case '1': return { class: 'priority-critical', text: 'Critical', icon: '🔴' };
      case '2': return { class: 'priority-high', text: 'High', icon: '🟠' };
      case '3': return { class: 'priority-moderate', text: 'Moderate', icon: '🟡' };
      case '4': return { class: 'priority-low', text: 'Low', icon: '🟢' };
      case '5': return { class: 'priority-planning', text: 'Planning', icon: '🔵' };
      default: return null;
    }
  };

  const getStateBadge = (state) => {
    const stateValue = value(state);
    if (!stateValue || stateValue === '') {
      return null; // Don't show unknown badges
    }

    // Use the actual ServiceNow problem state values
    switch (stateValue) {
      case '101': return { class: 'state-new', text: 'New', icon: '🆕' };
      case '102': return { class: 'state-assess', text: 'Assess', icon: '🔍' };
      case '103': return { class: 'state-analysis', text: 'Root Cause Analysis', icon: '🔬' };
      case '104': return { class: 'state-progress', text: 'Fix in Progress', icon: '⚙️' };
      case '106': return { class: 'state-resolved', text: 'Resolved', icon: '✅' };
      case '107': return { class: 'state-closed', text: 'Closed', icon: '📁' };
      default: return null;
    }
  };

  const getActiveBadge = (active) => {
    const activeValue = value(active);
    const isActive = activeValue === 'true' || activeValue === true;
    
    if (isActive) {
      return { class: 'active-badge active', text: 'Active', icon: '✅' };
    } else {
      return { class: 'active-badge inactive', text: 'Inactive', icon: '❌' };
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

  // Get stats for the current filtered problems
  const getFilteredStats = () => {
    const active = filteredProblems.filter(p => {
      const activeValue = value(p.active);
      return activeValue === 'true' || activeValue === true;
    }).length;
    const inactive = filteredProblems.length - active;
    
    return { active, inactive, total: filteredProblems.length };
  };

  const stats = getFilteredStats();

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
                {/* Category Filter - Using real ServiceNow choice values */}
                <div className="filter-group">
                  <label htmlFor="category-filter">📂 Category</label>
                  <select 
                    id="category-filter"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {choiceLists.categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter - Using real ServiceNow choice values */}
                <div className="filter-group">
                  <label htmlFor="priority-filter">⚡ Priority</label>
                  <select 
                    id="priority-filter"
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Priorities</option>
                    {choiceLists.priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State Filter - Using real ServiceNow choice values */}
                <div className="filter-group">
                  <label htmlFor="state-filter">📊 State</label>
                  <select 
                    id="state-filter"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All States</option>
                    {choiceLists.states.map(state => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Filter - New filter */}
                <div className="filter-group">
                  <label htmlFor="active-filter">🔄 Status</label>
                  <select 
                    id="active-filter"
                    value={filters.active}
                    onChange={(e) => handleFilterChange('active', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
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
          <span className="status-breakdown">
            • <strong>{stats.active}</strong> active, <strong>{stats.inactive}</strong> inactive
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
                <p>Great news! There are no problems to display.</p>
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
            const activeStatus = getActiveBadge(problem.active);
            const category = display(problem.category) || 'Unknown';
            
            return (
              <div 
                key={value(problem.sys_id)} 
                className={`problem-card ${!activeStatus || activeStatus.text === 'Inactive' ? 'inactive-problem' : ''}`}
                onClick={() => onSelectProblem(problem)}
              >
                <div className="problem-header">
                  <div className="badges-container">
                    {activeStatus && (
                      <span className={`active-badge ${activeStatus.class}`} title={`Status: ${activeStatus.text}`}>
                        {activeStatus.icon} {activeStatus.text}
                      </span>
                    )}
                    {priority && (
                      <span className={`priority-badge ${priority.class}`} title={`Priority: ${priority.text}`}>
                        {priority.icon} {priority.text}
                      </span>
                    )}
                    {state && (
                      <span className={`state-badge ${state.class}`} title={`State: ${state.text}`}>
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