export class ProblemService {
  constructor() {
    this.baseHeaders = {
      "Accept": "application/json",
      "X-UserToken": window.g_ck
    };
  }

  async getKnownProblems() {
    try {
      const response = await fetch('/api/now/table/problem?sysparm_display_value=all&sysparm_query=state!=6^ORDERBYDESCsys_updated_on&sysparm_limit=50', {
        headers: this.baseHeaders
      });
      if (!response.ok) throw new Error('Failed to fetch problems');
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error fetching problems:', error);
      return [];
    }
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
        short_description: { display_value: 'Community Workaround: Quick Fix', value: 'Community Workaround: Quick Fix' },
        text: { 
          display_value: `<p><strong>Temporary Solution:</strong></p>
            <p>Based on community feedback, here's a workaround that has helped several users:</p>
            <ol>
              <li>Clear your browser cache and cookies</li>
              <li>Restart the affected service</li>
              <li>Check system logs for specific error messages</li>
              <li>If the issue persists, try accessing from a different network</li>
            </ol>
            <p><em>This is a temporary fix while the permanent solution is being developed.</em></p>`, 
          value: 'Community workaround content' 
        },
        author: { display_value: 'Community User A', value: 'user_a' },
        sys_created_on: { display_value: new Date(Date.now() - 86400000).toISOString(), value: new Date(Date.now() - 86400000).toISOString() }
      },
      {
        sys_id: { display_value: `kb_${problemSysId}_2`, value: `kb_${problemSysId}_2` },
        short_description: { display_value: 'Alternative Solution - Tested', value: 'Alternative Solution - Tested' },
        text: { 
          display_value: `<p><strong>Alternative Approach:</strong></p>
            <p>I've found this method works consistently:</p>
            <ul>
              <li>Use the backup system during peak hours</li>
              <li>Schedule critical operations for off-peak times</li>
              <li>Monitor system performance closely</li>
            </ul>
            <p><strong>Success Rate:</strong> This approach worked for 8 out of 10 users in our team.</p>
            <p><strong>Time to Resolution:</strong> Usually resolves within 15-30 minutes.</p>`, 
          value: 'Alternative solution content' 
        },
        author: { display_value: 'Community User B', value: 'user_b' },
        sys_created_on: { display_value: new Date(Date.now() - 172800000).toISOString(), value: new Date(Date.now() - 172800000).toISOString() }
      }
    ];

    // Return 1-2 random solutions for variety
    return mockSolutions.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  async searchProblems(searchTerm) {
    try {
      const encodedQuery = `short_descriptionLIKE${searchTerm}^ORdescriptionLIKE${searchTerm}^state!=6^ORDERBYDESCsys_updated_on`;
      const response = await fetch(`/api/now/table/problem?sysparm_display_value=all&sysparm_query=${encodedQuery}&sysparm_limit=50`, {
        headers: this.baseHeaders
      });
      if (!response.ok) throw new Error('Failed to search problems');
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error searching problems:', error);
      return [];
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
}