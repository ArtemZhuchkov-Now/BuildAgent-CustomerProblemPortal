import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { notifyUsersOfNewProblem } from '../../server/business-rules/problem-notification.js'

export const problemNotificationRule = BusinessRule({
  $id: Now.ID['problem_notification_rule'],
  name: 'Problem Notification for Self-Service Portal',
  table: 'problem',
  when: 'after',
  action: ['insert', 'update'],
  script: notifyUsersOfNewProblem,
  order: 100,
  active: true,
  description: 'Sends proactive notifications to customers when problems are created or resolved'
})