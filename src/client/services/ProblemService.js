export class ProblemService {
  constructor() {
    this.baseHeaders = {
      "Accept": "application/json",
      "X-UserToken": window.g_ck
    };
  }

  async getKnownProblems(filters = {}) {
    try {
      // Build query based on filters
      let query = 'state!=6'; // Exclude cancelled problems by default
      
      // Add category filter
      if (filters.category && filters.category !== 'all') {
        query += `^category=${filters.category}`;
      }
      
      // Add priority filter
      if (filters.priority && filters.priority !== 'all') {
        query += `^priority=${filters.priority}`;
      }
      
      // Add state filter
      if (filters.state && filters.state !== 'all') {
        query += `^state=${filters.state}`;
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
          query += `^sys_updated_on>=${dateStr}`;
        }
      }
      
      // Always order by most recent first
      query += '^ORDERBYDESCsys_updated_on';
      
      const response = await fetch(`/api/now/table/problem?sysparm_display_value=all&sysparm_query=${query}&sysparm_limit=100&sysparm_fields=sys_id,number,short_description,description,priority,state,category,sys_updated_on,sys_created_on,assigned_to,impact,urgency,knowledge`, {
        headers: this.baseHeaders
      });
      
      if (!response.ok) throw new Error('Failed to fetch problems');
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error fetching problems:', error);
      // Return mock data for development/demo purposes
      return this._getMockProblems();
    }
  }

  _getMockProblems() {
    // Mock data for development when no ServiceNow instance is available
    const categories = ['Hardware', 'Software', 'Network', 'Security', 'Database', 'General'];
    const priorities = ['1', '2', '3', '4', '5'];
    const states = ['1', '2', '3', '4', '5'];
    
    const problems = [];
    
    for (let i = 1; i <= 25; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomState = states[Math.floor(Math.random() * states.length)];
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const updatedDate = new Date();
      updatedDate.setDate(updatedDate.getDate() - randomDaysAgo);
      
      problems.push({
        sys_id: { display_value: `problem_${i}`, value: `problem_${i}` },
        number: { display_value: `PRB00${1000 + i}`, value: `PRB00${1000 + i}` },
        short_description: { 
          display_value: `${randomCategory} Issue ${i}: ${this._getRandomProblemTitle()}`, 
          value: `${randomCategory} Issue ${i}: ${this._getRandomProblemTitle()}` 
        },
        description: { 
          display_value: this._getRandomDescription(), 
          value: this._getRandomDescription() 
        },
        priority: { display_value: randomPriority, value: randomPriority },
        state: { display_value: randomState, value: randomState },
        category: { display_value: randomCategory, value: randomCategory },
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
      'Monitoring Alert Storm'
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
      'SSL certificates are approaching expiration dates, which could cause service interruptions if not renewed promptly.'
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
      
      // Add base filter (exclude cancelled)
      query += '^state!=6';
      
      // Add additional filters
      if (filters.category && filters.category !== 'all') {
        query += `^category=${filters.category}`;
      }
      
      if (filters.priority && filters.priority !== 'all') {
        query += `^priority=${filters.priority}`;
      }
      
      if (filters.state && filters.state !== 'all') {
        query += `^state=${filters.state}`;
      }
      
      // Order by relevance (updated recently first)
      query += '^ORDERBYDESCsys_updated_on';
      
      const response = await fetch(`/api/now/table/problem?sysparm_display_value=all&sysparm_query=${query}&sysparm_limit=50&sysparm_fields=sys_id,number,short_description,description,priority,state,category,sys_updated_on,sys_created_on,assigned_to,impact,urgency`, {
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
      totalProblems: Math.floor(Math.random() * 50) + 10,
      resolvedToday: Math.floor(Math.random() * 5) + 1,
      newThisWeek: Math.floor(Math.random() * 8) + 2,
      communityContributions: Math.floor(Math.random() * 15) + 5
    };
  }

  async getProblemCategories() {
    try {
      // Get unique categories from problems
      const response = await fetch('/api/now/table/problem?sysparm_query=state!=6^ORDERBYcategory&sysparm_fields=category&sysparm_display_value=true&sysparm_exclude_reference_link=true', {
        headers: this.baseHeaders
      });
      
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      
      const categories = [...new Set(
        data.result
          .map(item => item.category)
          .filter(cat => cat && cat.trim() !== '')
      )].sort();
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return mock categories
      return ['Hardware', 'Software', 'Network', 'Security', 'Database', 'General'];
    }
  }

  async getProblemStats() {
    try {
      // Get statistics for dashboard
      const response = await fetch('/api/now/table/problem?sysparm_query=state!=6&sysparm_fields=state,priority,category&sysparm_display_value=true&sysparm_exclude_reference_link=true', {
        headers: this.baseHeaders
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      
      // Calculate statistics
      const stats = {
        total: data.result.length,
        byPriority: {},
        byState: {},
        byCategory: {}
      };
      
      data.result.forEach(problem => {
        // Count by priority
        const priority = problem.priority || 'Unknown';
        stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
        
        // Count by state
        const state = problem.state || 'Unknown';
        stats.byState[state] = (stats.byState[state] || 0) + 1;
        
        // Count by category
        const category = problem.category || 'General';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return mock stats
      return {
        total: 25,
        byPriority: { '1': 3, '2': 7, '3': 10, '4': 5 },
        byState: { '1': 5, '2': 8, '3': 7, '4': 3, '5': 2 },
        byCategory: { 'Hardware': 5, 'Software': 8, 'Network': 4, 'Security': 3, 'Database': 3, 'General': 2 }
      };
    }
  }
}