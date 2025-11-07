import { gs } from '@servicenow/glide';
import { GlideRecord } from '@servicenow/glide';

export function notifyUsersOfNewProblem(current, previous) {
  // Only run for new problems or when state changes to resolved
  if (current.isNewRecord() || (previous && current.state.changes() && current.state == '4')) {
    
    var message = '';
    var eventType = '';
    
    if (current.isNewRecord()) {
      message = `New problem identified: ${current.short_description}. Check the Self-Service Portal for workarounds and updates.`;
      eventType = 'problem.created';
      gs.info('New problem created - Portal notification triggered: ' + current.number);
    } else if (current.state == '4') {
      message = `Problem resolved: ${current.short_description}. The issue has been fixed.`;
      eventType = 'problem.resolved';
      gs.info('Problem resolved - Portal notification triggered: ' + current.number);
    }
    
    // Create a general notification event that can be picked up by the portal
    var eventGr = new GlideRecord('sysevent');
    eventGr.initialize();
    eventGr.name = eventType;
    eventGr.parm1 = current.sys_id.toString();
    eventGr.parm2 = current.number.toString();
    eventGr.instance = gs.getProperty('instance_name', 'dev');
    eventGr.insert();
    
    // Log the activity for portal tracking
    gs.info(`Problem Prevention Portal: ${eventType} - ${current.number} - ${current.short_description}`);
  }
}