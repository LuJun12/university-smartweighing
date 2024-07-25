export default [
    {
        path: '/supermarketCashier',
        name: 'supermarketCashier',
        redirect: '/supermarketCashier/supermarketCashierOrder',
        meta: {
            title: '超市收银',
        },
    },
    {
        path: '/supermarketCashier/supermarketCashierOrder',
        name: 'supermarketCashierOrder',
        component: () => import('./supermarketCashierOrder.vue'),
        meta: {
            title: '超市订单',
            menuRouteName: 'supermarketCashierOrder',
        },
    },
    {
        path: '/supermarketCashier/supermarketCashierRefuedOrder',
        name: 'supermarketCashierRefuedOrder',
        component: () => import('./supermarketCashierRefuedOrder.vue'),
        meta: {
            title: '退款订单',
            menuRouteName: 'supermarketCashierRefuedOrder',
        },
    },
    // 勿删此注释__ROUTES__勿删此注释
]
