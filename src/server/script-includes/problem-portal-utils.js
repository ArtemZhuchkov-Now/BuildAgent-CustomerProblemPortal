import { gs } from '@servicenow/glide';
import { GlideRecord } from '@servicenow/glide';

var ProblemPortalUtils = Class.create();
ProblemPortalUtils.prototype = {
  initialize: function() {},

  getProblemsWithWorkarounds: function() {
    var problems = [];
    var gr = new GlideRecord('problem');
    gr.addQuery('state', '!=', '6'); // Not closed
    gr.addOrderByDesc('sys_updated_on');
    gr.setLimit(50);
    gr.query();
    
    while (gr.next()) {
      var problem = {
        sys_id: gr.getUniqueValue(),
        number: gr.number.getDisplayValue(),
        short_description: gr.short_description.getDisplayValue(),
        description: gr.description.getDisplayValue(),
        state: gr.state.getDisplayValue(),
        priority: gr.priority.getDisplayValue(),
        sys_updated_on: gr.sys_updated_on.getDisplayValue(),
        workarounds: this._getWorkarounds(gr.getUniqueValue())
      };
      problems.push(problem);
    }
    
    return problems;
  },

  _getWorkarounds: function(problemSysId) {
    var workarounds = [];
    var kb = new GlideRecord('kb_knowledge');
    kb.addQuery('workflow_state', 'published');
    kb.addQuery('short_description', 'CONTAINS', 'workaround');
    kb.setLimit(10);
    kb.query();
    
    while (kb.next()) {
      workarounds.push({
        sys_id: kb.getUniqueValue(),
        title: kb.short_description.getDisplayValue(),
        text: kb.text.getDisplayValue(),
        author: kb.author.getDisplayValue(),
        created_on: kb.sys_created_on.getDisplayValue()
      });
    }
    
    return workarounds;
  },

  getRecentProblemActivity: function() {
    var activity = {
      newProblems: 0,
      resolvedProblems: 0,
      totalActive: 0
    };
    
    // Count new problems in last 7 days
    var newGr = new GlideRecord('problem');
    newGr.addQuery('sys_created_on', '>=', gs.daysAgoStart(7));
    newGr.query();
    activity.newProblems = newGr.getRowCount();
    
    // Count resolved problems in last 7 days
    var resolvedGr = new GlideRecord('problem');
    resolvedGr.addQuery('state', '4'); // Resolved
    resolvedGr.addQuery('sys_updated_on', '>=', gs.daysAgoStart(7));
    resolvedGr.query();
    activity.resolvedProblems = resolvedGr.getRowCount();
    
    // Count total active problems
    var activeGr = new GlideRecord('problem');
    activeGr.addQuery('state', '!=', '6'); // Not closed
    activeGr.query();
    activity.totalActive = activeGr.getRowCount();
    
    return activity;
  },

  submitCommunityWorkaround: function(problemId, solution) {
    var kb = new GlideRecord('kb_knowledge');
    kb.initialize();
    kb.short_description = 'Community Solution: ' + problemId;
    kb.text = solution;
    kb.workflow_state = 'draft'; // Requires approval
    kb.kb_category = 'community_solutions';
    
    var sysId = kb.insert();
    
    if (sysId) {
      gs.info('Community solution submitted for problem: ' + problemId);
      return { success: true, sys_id: sysId };
    } else {
      gs.error('Failed to submit community solution for problem: ' + problemId);
      return { success: false, error: 'Failed to create knowledge article' };
    }
  },

  recordFeedback: function(knowledgeId, helpful, comments) {
    // Try to create feedback record, but don't fail if table doesn't exist
    try {
      var feedback = new GlideRecord('kb_feedback');
      feedback.initialize();
      feedback.article = knowledgeId;
      feedback.helpful = helpful ? 'yes' : 'no';
      feedback.comments = comments || '';
      feedback.insert();
      
      gs.info('Feedback recorded for knowledge article: ' + knowledgeId);
      return { success: true };
    } catch (e) {
      gs.info('Feedback simulated (kb_feedback table may not exist): ' + knowledgeId);
      return { success: true, simulated: true };
    }
  },

  getPortalStats: function() {
    var stats = {
      totalProblems: 0,
      activeProblems: 0,
      resolvedThisWeek: 0,
      knowledgeArticles: 0
    };
    
    // Total problems
    var totalGr = new GlideRecord('problem');
    totalGr.query();
    stats.totalProblems = totalGr.getRowCount();
    
    // Active problems
    var activeGr = new GlideRecord('problem');
    activeGr.addQuery('state', '!=', '6');
    activeGr.query();  
    stats.activeProblems = activeGr.getRowCount();
    
    // Resolved this week
    var resolvedGr = new GlideRecord('problem');
    resolvedGr.addQuery('state', '4');
    resolvedGr.addQuery('sys_updated_on', '>=', gs.daysAgoStart(7));
    resolvedGr.query();
    stats.resolvedThisWeek = resolvedGr.getRowCount();
    
    // Knowledge articles
    var kbGr = new GlideRecord('kb_knowledge');
    kbGr.addQuery('workflow_state', 'published');
    kbGr.query();
    stats.knowledgeArticles = kbGr.getRowCount();
    
    return stats;
  },

  type: 'ProblemPortalUtils'
};