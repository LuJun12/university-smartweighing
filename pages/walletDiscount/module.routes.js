export default [
    //钱包管理
    {
        path: '/walletManage',
        name: 'walletManage',
        redirect: '/walletManage/Index',
        meta: {
            title: '钱包管理',
        },
    },
    {
        path: '/walletManage/Index',
        name: 'walletManageIndex',
        component: () => import('./walletManage/Walletmanagement.vue'),
        meta: {
            title: '钱包管理',
            menuRouteName: 'walletManageIndex',
        },
    },
    {
        path: '/walletManage/Walletflow',
        name: 'walletManageWalletflow',
        component: () => import('./walletManage/Walletflow.vue'),
        meta: {
            title: '钱包流水',
            menuRouteName: 'walletManageWalletflow',
        },
    },
    {
        path: '/walletManage/RechargeTask',
        name: 'walletManageRechargeTask',
        component: () => import('./walletManage/RechargeTask.vue'),
        meta: {
            title: '充值任务',
            menuRouteName: 'walletManageRechargeTask',
        },
    },
    // 勿删此注释__ROUTES__勿删此注释
]
