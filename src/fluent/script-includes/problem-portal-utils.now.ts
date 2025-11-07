import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const problemPortalUtils = ScriptInclude({
  $id: Now.ID['problem_portal_utils'],
  name: 'ProblemPortalUtils',
  script: Now.include('../../server/script-includes/problem-portal-utils.js'),
  description: 'Utility functions for the Self-Service Problem Prevention Portal',
  apiName: 'x_snc_selfservic_1.ProblemPortalUtils',
  callerAccess: 'tracking',
  clientCallable: true,
  mobileCallable: true,
  sandboxCallable: true,
  accessibleFrom: 'public',
  active: true
})