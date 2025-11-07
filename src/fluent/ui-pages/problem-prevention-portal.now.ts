import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import portalPage from '../../client/index.html'

export const problemPreventionPortal = UiPage({
  $id: Now.ID['problem_prevention_portal'],
  endpoint: 'x_snc_selfservic_1_portal.do',
  html: portalPage,
  direct: true
})