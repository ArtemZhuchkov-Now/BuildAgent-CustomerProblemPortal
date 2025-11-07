import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'
import { customerRole } from './customer-role.now'

export const problemAdminRole = Role({
    $id: Now.ID['problem_admin_role'],
    name: 'x_snc_selfservic_1.problem_admin',
    description: 'Role for administrators to manage problem prevention system',
    can_delegate: false,
    grantable: true,
    contains_roles: [customerRole]
})