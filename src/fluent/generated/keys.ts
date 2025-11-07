import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '0db16064694b45bd85bb9eb2f80bfec5'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '6ff83ca6e6c84bbbb3fc050e44e5dcba'
                    }
                    problem_notification_rule: {
                        table: 'sys_script'
                        id: '4f78316b97b047f285b129ae6ee960c1'
                    }
                    problem_portal_utils: {
                        table: 'sys_script_include'
                        id: '16685a1135214556a95ed2db7fa2920c'
                    }
                    problem_prevention_portal: {
                        table: 'sys_ui_page'
                        id: 'ec841279f44e426bb2bcf114b0161a3e'
                    }
                    'src_server_business-rules_problem-notification_js': {
                        table: 'sys_module'
                        id: '2388c3bac0064ee7bb6c7c0c222e8f30'
                    }
                    'src_server_script-includes_problem-portal-utils_js': {
                        table: 'sys_module'
                        id: 'b3605d90224c428dae4251d81e1c9cff'
                    }
                    'x_snc_selfservic_1/main': {
                        table: 'sys_ux_lib_asset'
                        id: '0151063832974eee96f87728e4b15a25'
                    }
                    'x_snc_selfservic_1/main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: 'd32fd5d5f11e4877aa7a4227261c4eb7'
                    }
                }
                composite: [
                    {
                        table: 'sys_user_role_contains'
                        id: '3b203b4cdcc7465da49292d3dab022cb'
                        key: {
                            role: {
                                id: 'e19958c9b9f34669aa3867c5ce15ab0a'
                                key: {
                                    name: 'x_snc_selfservic_1.problem_admin'
                                }
                            }
                            contains: {
                                id: '4b8070b4e1b146338969b0317e00daab'
                                key: {
                                    name: 'x_snc_selfservic_1.customer'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '4b8070b4e1b146338969b0317e00daab'
                        key: {
                            name: 'x_snc_selfservic_1.customer'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'e19958c9b9f34669aa3867c5ce15ab0a'
                        key: {
                            name: 'x_snc_selfservic_1.problem_admin'
                        }
                    },
                ]
            }
        }
    }
}
