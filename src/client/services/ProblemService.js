export class ProblemService {
  constructor() {
    this.baseHeaders = {
      "Accept": "application/json",
      "X-UserToken": window.g_ck
    };
    // Cache for choice values to avoid repeated API calls
    this._choiceCache = {};
  }

  // New method to fetch choice lists from ServiceNow
  async getChoiceValues(table, field) {
    const cacheKey = `${table}_${field}`;
    if (this._choiceCache[cacheKey]) {
      return this._choiceCache[cacheKey];
    }

    try {
      const response = await fetch(`/api/now/table/sys_choice?sysparm_query=name=${table}^element=${field}^inactive=false&sysparm_fields=value,label&sysparm_display_value=true&sysparm_order_by=sequence`, {
        headers: this.baseHeaders
      });
      
      if (!response.ok) throw new Error('Failed to fetch choice values');
      const data = await response.json();
      
      // Transform to usable format
      const choices = data.result.map(choice => ({
        value: choice.value,
        label: choice.label
      }));
      
      // If no choices found in sys_choice, use fallback
      if (choices.length === 0) {
        console.log(`No choices found in sys_choice for ${table}.${field}, using fallback`);
        const fallbackChoices = this._getFallbackChoices(table, field);
        this._choiceCache[cacheKey] = fallbackChoices;
        return fallbackChoices;
      }
      
      this._choiceCache[cacheKey] = choices;
      return choices;
    } catch (error) {
      console.error(`Error fetching choices for ${table}.${field}:`, error);
      // Return fallback choices based on actual schema
      const fallbackChoices = this._getFallbackChoices(table, field);
      this._choiceCache[cacheKey] = fallbackChoices;
      return fallbackChoices;
    }
  }

  _getFallbackChoices(table, field) {
    if (table === 'problem') {
      switch (field) {
        case 'category':
          return [
            { value: 'software', label: 'Software' },
            { value: 'hardware', label: 'Hardware' },
            { value: 'network', label: 'Network' },
            { value: 'database', label: 'Database' }
          ];
        case 'priority':
          // Priority field uses integer values 1-5 but doesn't store choices in sys_choice
          return [
            { value: '1', label: '1 - Critical' },
            { value: '2', label: '2 - High' },
            { value: '3', label: '3 - Moderate' },
            { value: '4', label: '4 - Low' },
            { value: '5', label: '5 - Planning' }
          ];
        case 'state':
          return [
            { value: '101', label: 'New' },
            { value: '102', label: 'Assess' },
            { value: '103', label: 'Root Cause Analysis' },
            { value: '104', label: 'Fix in Progress' },
            { value: '106', label: 'Resolved' },
            { value: '107', label: 'Closed' }
          ];
      }
    }
    return [];
  }

  async getKnownProblems(filters = {}) {
    try {
      // Build query based on filters - Include both active and inactive problems
      let query = '';
      
      // Add category filter
      if (filters.category && filters.category !== 'all') {
        query += (query ? '^' : '') + `category=${filters.category}`;
      }
      
      // Add priority filter
      if (filters.priority && filters.priority !== 'all') {
        query += (query ? '^' : '') + `priority=${filters.priority}`;
      }
      
      // Add state filter
      if (filters.state && filters.state !== 'all') {
        query += (query ? '^' : '') + `state=${filters.state}`;
      }
      
      // Add active filter option
      if (filters.activeOnly !== undefined) {
        query += (query ? '^' : '') + `active=${filters.activeOnly}`;
      }
      
      // Add date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
        }
        
        if (startDate) {
          const dateStr = startDate.toISOString().split('T')[0];
          query += (query ? '^' : '') + `sys_updated_on>=${dateStr}`;
        }
      }
      
      // Always order by most recent first
      query += (query ? '^' : '') + 'ORDERBYDESCsys_updated_on';
      
      const response = await fetch(`/api/now/table/problem?sysparm_display_value=all&sysparm_query=${query}&sysparm_limit=200&sysparm_fields=sys_id,number,short_description,description,priority,state,category,sys_updated_on,sys_created_on,assigned_to,impact,urgency,knowledge,active`, {
        headers: this.baseHeaders
      });
      
      if (!response.ok) throw new Error('Failed to fetch problems');
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error fetching problems:', error);
      // Return mock data for development/demo purposes with correct choice values
      return this._getMockProblems();
    }
  }

  _getMockProblems() {
    // Mock data with actual ServiceNow problem table choice values
    const categories = ['software', 'hardware', 'network', 'database'];
    const priorities = ['1', '2', '3', '4', '5'];
    const states = ['101', '102', '103', '104', '106', '107'];
    const activeStates = [true, true, true, false, false, true, true, false, true, true]; // Mix of active/inactive
    
    const problems = [];
    
    for (let i = 1; i <= 50; i++) { // Increased to 50 for more test data
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomState = states[Math.floor(Math.random() * states.length)];
      const randomActive = activeStates[Math.floor(Math.random() * activeStates.length)];
      const randomDaysAgo = Math.floor(Math.random() * 90); // Extended to 90 days
      const updatedDate = new Date();
      updatedDate.setDate(updatedDate.getDate() - randomDaysAgo);
      
      problems.push({
        sys_id: { display_value: `problem_${i}`, value: `problem_${i}` },
        number: { display_value: `PRB00${1000 + i}`, value: `PRB00${1000 + i}` },
        short_description: { 
          display_value: `${randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1)} Issue ${i}: ${this._getRandomProblemTitle()}`, 
          value: `${randomCategory.charAt(0).toUpperCase() + randomCategory.slice(1)} Issue ${i}: ${this._getRandomProblemTitle()}` 
        },
        description: { 
          display_value: this._getRandomDescription(), 
          value: this._getRandomDescription() 
        },
        priority: { display_value: randomPriority, value: randomPriority },
        state: { display_value: randomState, value: randomState },
        category: { display_value: randomCategory, value: randomCategory },
        active: { display_value: randomActive.toString(), value: randomActive.toString() },
        sys_updated_on: { display_value: updatedDate.toISOString(), value: updatedDate.toISOString() },
        sys_created_on: { display_value: updatedDate.toISOString(), value: updatedDate.toISOString() },
        impact: { display_value: Math.floor(Math.random() * 3) + 1, value: Math.floor(Math.random() * 3) + 1 },
        urgency: { display_value: Math.floor(Math.random() * 3) + 1, value: Math.floor(Math.random() * 3) + 1 }
      });
    }
    
    return problems;
  }

  _getRandomProblemTitle() {
    const titles = [
      'System Performance Degradation',
      'Authentication Failures',
      'Database Connection Timeouts',
      'Application Crash During Peak Hours',
      'Network Connectivity Issues',
      'Slow Response Times',
      'Service Unavailability',
      'Data Synchronization Errors',
      'Memory Leak in Production',
      'SSL Certificate Expiration',
      'Email Delivery Delays',
      'File Upload Failures',
      'API Rate Limiting Issues',
      'Cache Invalidation Problems',
      'Load Balancer Configuration Error',
      'Security Vulnerability Detected',
      'Backup Process Failures',
      'User Interface Rendering Issues',
      'Third-party Integration Outage',
      'Monitoring Alert Storm',
      'Session Timeout Issues',
      'Database Lock Conflicts',
      'Server Disk Space Full',
      'DNS Resolution Problems',
      'Certificate Chain Issues',
      'Application Memory Overflow',
      'Integration Service Down',
      'Cache Server Unreachable',
      'Load Testing Failures',
      'Security Scan Failures'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }

  _getRandomDescription() {
    const descriptions = [
      'Users are experiencing significant delays and timeouts when accessing the application during peak business hours. This appears to be affecting multiple departments and is causing business disruption.',
      'Multiple users report being unable to log in to the system. The authentication service appears to be rejecting valid credentials intermittently.',
      'The application database is showing connection timeout errors, particularly during high-traffic periods. This is affecting data retrieval and updates.',
      'The main application server is crashing unexpectedly during peak usage hours, requiring manual restarts to restore service.',
      'Network connectivity between offices is unstable, causing intermittent access issues for remote users and branch locations.',
      'System response times have increased significantly, with pages taking 30+ seconds to load instead of the usual 2-3 seconds.',
      'Critical business services are becoming unavailable without warning, affecting customer-facing operations and internal workflows.',
      'Data synchronization between systems is failing, causing discrepancies in reporting and potential data integrity issues.',
      'Production servers are showing signs of memory leaks, leading to degraded performance and eventual system crashes.',
      'SSL certificates are approaching expiration dates, which could cause service interruptions if not renewed promptly.',
      'Email services are experiencing delays in message delivery, with some emails taking hours to reach recipients.',
      'File upload functionality is failing for files larger than 5MB, preventing users from completing their work.',
      'API endpoints are returning rate limiting errors even for normal usage patterns, blocking integrations.',
      'Application cache is not invalidating properly, causing users to see stale data and outdated information.',
      'Load balancer is not distributing traffic evenly, causing some servers to be overloaded while others remain idle.'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  async getRelatedKnowledgeArticles(problemSysId) {
    try {
      // Search for knowledge articles that might be related to this problem
      const response = await fetch(`/api/now/table/kb_knowledge?sysparm_display_value=all&sysparm_query=workflow_state=published^short_descriptionLIKE${problemSysId}^ORtextLIKE${problemSysId}^ORDERBYDESCsys_updated_on&sysparm_limit=10`, {
        headers: this.baseHeaders
      });
      if (!response.ok) throw new Error('Failed to fetch knowledge articles');
      const data = await response.json();
      
      // If no real articles found, return some mock community solutions for POC
      if (data.result.length === 0) {
        return this._getMockSolutions(problemSysId);
      }
      
      return data.result || [];
    } catch (error) {
      console.error('Error fetching knowledge articles:', error);
      // Return mock solutions for POC
      return this._getMockSolutions(problemSysId);
    }
  }

  _getMockSolutions(problemSysId) {
    // Generate mock community solutions for POC demonstration
    const mockSolutions = [
      {
        sys_id: { display_value: `kb_${problemSysId}_1`, value: `kb_${problemSysId}_1` },
        short_description: { display_value: '🔧 Community Workaround: Quick Fix', value: 'Community Workaround: Quick Fix' },
        text: { 
          display_value: `<p><strong>Temporary Solution:</strong></p>
            <p>Based on community feedback, here's a workaround that has helped several users:</p>
            <ol>
              <li>Clear your browser cache and cookies</li>
              <li>Restart the affected service</li>
              <li>Check system logs for specific error messages</li>
              <li>If the issue persists, try accessing from a different network</li>
            </ol>
            <p><em>This is a temporary fix while the permanent solution is being developed.</em></p>
            <p><strong>Success Rate:</strong> 7 out of 10 users found this helpful</p>`, 
          value: 'Community workaround content' 
        },
        author: { display_value: 'Community User A', value: 'user_a' },
        sys_created_on: { display_value: new Date(Date.now() - 86400000).toISOString(), value: new Date(Date.now() - 86400000).toISOString() },
        helpful_count: 15,
        not_helpful_count: 3
      },
      {
        sys_id: { display_value: `kb_${problemSysId}_2`, value: `kb_${problemSysId}_2` },
        short_description: { display_value: '⚡ Alternative Solution - Tested & Verified', value: 'Alternative Solution - Tested' },
        text: { 
          display_value: `<p><strong>Alternative Approach:</strong></p>
            <p>I've found this method works consistently:</p>
            <ul>
              <li>Use the backup system during peak hours</li>
              <li>Schedule critical operations for off-peak times</li>
              <li>Monitor system performance closely</li>
              <li>Implement circuit breakers for external dependencies</li>
            </ul>
            <p><strong>Success Rate:</strong> This approach worked for 9 out of 10 users in our team.</p>
            <p><strong>Time to Resolution:</strong> Usually resolves within 15-30 minutes.</p>
            <p><strong>Verified by:</strong> System Administrator Team</p>`, 
          value: 'Alternative solution content' 
        },
        author: { display_value: 'Community User B', value: 'user_b' },
        sys_created_on: { display_value: new Date(Date.now() - 172800000).toISOString(), value: new Date(Date.now() - 172800000).toISOString() },
        helpful_count: 23,
        not_helpful_count: 1
      },
      {
        sys_id: { display_value: `kb_${problemSysId}_3`, value: `kb_${problemSysId}_3` },
        short_description: { display_value: '🎯 Root Cause Analysis & Prevention', value: 'Root Cause Analysis' },
        text: { 
          display_value: `<p><strong>Root Cause Identified:</strong></p>
            <p>After investigating multiple instances of this problem, we've identified the following root causes:</p>
            <h4>Primary Causes:</h4>
            <ul>
              <li>Memory allocation issues during high concurrency</li>
              <li>Database connection pool exhaustion</li>
              <li>Network timeout configurations too aggressive</li>
            </ul>
            <h4>Prevention Steps:</h4>
            <ol>
              <li>Implement proper connection pooling</li>
              <li>Add circuit breakers for external services</li>
              <li>Monitor memory usage patterns</li>
              <li>Adjust timeout values based on network conditions</li>
            </ol>
            <p><strong>Long-term Solution:</strong> System architecture review scheduled for next sprint.</p>`, 
          value: 'Root cause analysis content' 
        },
        author: { display_value: 'Technical Lead', value: 'tech_lead' },
        sys_created_on: { display_value: new Date(Date.now() - 259200000).toISOString(), value: new Date(Date.now() - 259200000).toISOString() },
        helpful_count: 31,
        not_helpful_count: 2
      }
    ];

    // Return 1-3 random solutions for variety
    return mockSolutions.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  async searchProblems(searchTerm, filters = {}) {
    try {
      // Build search query
      let query = `short_descriptionLIKE${searchTerm}^ORdescriptionLIKE${searchTerm}^ORnumberLIKE${searchTerm}`;
      
      // Add additional filters with correct values
      if (filters.category && filters.category !== 'all') {
        query += `^category=${filters.category}`;
      }
      
      if (filters.priority && filters.priority !== 'all') {
        query += `^priority=${filters.priority}`;
      }
      
      if (filters.state && filters.state !== 'all') {
        query += `^state=${filters.state}`;
      }
      
      // Include both active and inactive by default in search
      if (filters.activeOnly !== undefined) {
        query += `^active=${filters.activeOnly}`;
      }
      
      // Order by relevance (updated recently first)
      query += '^ORDERBYDESCsys_updated_on';
      
      const response = await fetch(`/api/now/table/problem?sysparm_display_value=all&sysparm_query=${query}&sysparm_limit=100&sysparm_fields=sys_id,number,short_description,description,priority,state,category,sys_updated_on,sys_created_on,assigned_to,impact,urgency,active`, {
        headers: this.baseHeaders
      });
      
      if (!response.ok) throw new Error('Failed to search problems');
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error searching problems:', error);
      // Filter mock data for development
      const mockData = this._getMockProblems();
      return mockData.filter(problem => 
        problem.short_description.display_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.display_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.number.display_value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  async voteFeedback(knowledgeId, helpful) {
    try {
      // For POC, we'll simulate the vote - in production this would create real feedback records
      const response = await fetch('/api/now/table/kb_feedback', {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          article: knowledgeId,
          helpful: helpful ? 'yes' : 'no',
          comments: helpful ? 'This solution worked for me!' : 'This did not resolve my issue.'
        })
      });
      
      // Don't throw error if feedback table doesn't exist - this is just for POC
      if (response.ok) {
        return await response.json();
      } else {
        console.log('Feedback simulated (table may not exist in POC environment)');
        return { success: true, simulated: true };
      }
    } catch (error) {
      console.log('Feedback vote simulated for POC:', { knowledgeId, helpful });
      return { success: true, simulated: true };
    }
  }

  async submitSolution(problemId, solution) {
    try {
      const response = await fetch('/api/now/table/kb_knowledge', {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          short_description: `Community Solution for Problem: ${problemId}`,
          text: solution,
          workflow_state: 'draft',
          kb_category: 'community_solutions'
        })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        console.log('Solution submission simulated (knowledge base may not be configured)');
        return { success: true, simulated: true };
      }
    } catch (error) {
      console.log('Solution submission simulated for POC:', { problemId, solution });
      return { success: true, simulated: true };
    }
  }

  async getNotificationSummary() {
    // For POC, return mock notification data
    return {
      totalProblems: Math.floor(Math.random() * 50) + 30,
      resolvedToday: Math.floor(Math.random() * 5) + 1,
      newThisWeek: Math.floor(Math.random() * 8) + 2,
      communityContributions: Math.floor(Math.random() * 15) + 5
    };
  }

  // Updated method to fetch real categories from choice lists
  async getProblemCategories() {
    return await this.getChoiceValues('problem', 'category');
  }

  // New methods to get other choice values
  async getProblemPriorities() {
    return await this.getChoiceValues('problem', 'priority');
  }

  async getProblemStates() {
    return await this.getChoiceValues('problem', 'state');
  }

  async getProblemStats() {
    try {
      // Get statistics for dashboard - include both active and inactive
      const response = await fetch('/api/now/table/problem?sysparm_fields=state,priority,category,active&sysparm_display_value=true&sysparm_exclude_reference_link=true&sysparm_limit=500', {
        headers: this.baseHeaders
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      
      // Calculate statistics
      const stats = {
        total: data.result.length,
        active: 0,
        inactive: 0,
        byPriority: {},
        byState: {},
        byCategory: {}
      };
      
      data.result.forEach(problem => {
        // Count active/inactive
        const isActive = problem.active === 'true' || problem.active === true;
        if (isActive) {
          stats.active++;
        } else {
          stats.inactive++;
        }
        
        // Count by priority
        const priority = problem.priority || 'Unknown';
        stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
        
        // Count by state
        const state = problem.state || 'Unknown';
        stats.byState[state] = (stats.byState[state] || 0) + 1;
        
        // Count by category
        const category = problem.category || 'Unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return mock stats with correct categories
      return {
        total: 50,
        active: 35,
        inactive: 15,
        byPriority: { '1': 8, '2': 12, '3': 15, '4': 10, '5': 5 },
        byState: { '101': 8, '102': 12, '103': 10, '104': 8, '106': 7, '107': 5 },
        byCategory: { 'software': 15, 'hardware': 12, 'network': 13, 'database': 10 }
      };
    }
  }
}