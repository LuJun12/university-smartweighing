export default [
    {
        path: '/datareporting/Operatingstatistics',
        name: 'datareportingOperatingstatistics',
        component: () => import('./datareporting/Operatingstatistics.vue'),
        meta: {
            title: '经营统计',
            menuRouteName: 'datareportingOperatingstatistics',
        },
    },
    {
        path: '/datareporting/Salesstatisticsofdishes',
        name: 'datareportingSalesstatisticsofdishes',
        component: () => import('./datareporting/Salesstatisticsofdishes.vue'),
        meta: {
            title: '菜品销售统计',
            menuRouteName: 'datareportingSalesstatisticsofdishes',
        },
    },

    // 勿删此注释__ROUTES__勿删此注释
]
