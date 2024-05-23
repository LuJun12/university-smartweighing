export default [
    {
        path: '/aiDish',
        name: 'aiDish',
        redirect: '/aiDish/aiDishOrder',
        meta: {
            title: '菜品识别',
        },
    },
    {
        path: '/aiDish/aiDishOrder',
        name: 'aiDishAiDishOrder',
        component: () => import('./AiDishOrder.vue'),
        meta: {
            title: '订单管理',
            menuRouteName: 'aiDishAiDishOrder',
        },
    },
    {
        path: '/aiDish/aiDishRefundOrder',
        name: 'aiDishAiDishRefundOrder',
        component: () => import('./AiDishRefundOrder.vue'),
        meta: {
            title: '退款管理',
            menuRouteName: 'aiDishAiDishRefundOrder',
        },
    },
    // 勿删此注释__ROUTES__勿删此注释
]
