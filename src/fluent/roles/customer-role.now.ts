import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

export const customerRole = Role({
    $id: Now.ID['customer_role'],
    name: 'x_snc_selfservic_1.customer',
    description: 'Role for customers to access self-service problem prevention portal',
    can_delegate: false,
    grantable: true
})