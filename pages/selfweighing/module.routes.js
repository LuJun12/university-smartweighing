export default [
    {
        path: '/weighConfig/Index',
        name: 'weighConfigIndex',
        component: () => import('./weighConfig/Index.vue'),
        meta: {
            title: '自助称重配置',
            menuRouteName: 'weighConfigIndex',
        },
    },

    //用餐订单
    {
        path: '/selfweight',
        name: 'selfweight',
        redirect: '/selfweight/Mealorders',
        meta: {
            title: '用餐订单',
        },
    },
    {
        path: '/selfweight/Mealorders',
        name: 'selfweightMealorders',
        component: () => import('./selfweight/Mealorders.vue'),
        meta: {
            title: '用餐订单',
            menuRouteName: 'selfweightMealorders',
        },
    },
    {
        path: '/selfweight/AddVegetableLog',
        name: 'selfweightAddVegetableLog',
        component: () => import('./selfweight/AddVegetableLog.vue'),
        meta: {
            title: '加菜日志',
            menuRouteName: 'selfweightAddVegetableLog',
        },
    },
    {
        path: '/selfweight/RefundManagement',
        name: 'selfweightRefundManagement',
        component: () => import('./selfweight/RefundManagement.vue'),
        meta: {
            title: '退款管理',
            menuRouteName: 'selfweightRefundManagement',
        },
    },
    {
        path: '/featureGate',
        name: 'featureGate',
        meta: {
            title: '特色档口',
        },
        redirect: '/featureGate/Index',
    },
    {
        path: '/featureGate/Index',
        name: 'featureGateIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '特色档口',
            menuRouteName: 'featureGateIndex',
        },
    },
    {
        path: '/dishRecognition',
        name: 'dishRecognition',
        meta: {
            title: '菜品识别结算',
        },
        redirect: '/dishRecognition/Index',
    },
    {
        path: '/dishRecognition/Index',
        name: 'dishRecognitionIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '菜品识别结算',
            menuRouteName: 'dishRecognitionIndex',
        },
    },
    {
        path: '/cashier',
        name: 'cashier',
        meta: {
            title: '档口收银',
        },
        redirect: '/cashier/GeneralCashier',
    },
    {
        path: '/cashier/GeneralCashier',
        name: 'cashierGeneralCashier',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '普通收银',
            menuRouteName: 'cashierGeneralCashier',
        },
    },
    {
        path: '/cashier/SelfweightCashier',
        name: 'cashierSelfweightCashier',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '称重收银',
            menuRouteName: 'cashierSelfweightCashier',
        },
    },
    {
        path: '/supermarketManagement',
        name: 'supermarketManagement',
        meta: {
            title: '超市管理',
        },
        redirect: '/supermarketManagement/Index',
    },
    {
        path: '/supermarketManagement/Index',
        name: 'supermarketManagementIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '超市管理',
            menuRouteName: 'supermarketManagementIndex',
        },
    },
    {
        path: '/boxReservation',
        name: 'boxReservation',
        meta: {
            title: '包厢预订',
        },
        redirect: '/boxReservation/Index',
    },
    {
        path: '/boxReservation/Index',
        name: 'boxReservationIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '包厢预订',
            menuRouteName: 'boxReservationIndex',
        },
    },
    {
        path: '/studentInteract',
        name: 'studentInteract',
        meta: {
            title: '学生互动',
        },
        redirect: '/studentInteract/InteractScreen',
    },
    {
        path: '/studentInteract/InteractScreen',
        name: 'studentInteractInteractScreen',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '互动屏',
            menuRouteName: 'studentInteractInteractScreen',
        },
    },
    {
        path: '/studentInteract/ScanQr',
        name: 'studentInteractScanQr',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '扫码互动',
            menuRouteName: 'studentInteractScanQr',
        },
    },
    {
        path: '/passengerFlowAnalysis',
        name: 'passengerFlowAnalysis',
        meta: {
            title: '客流分析',
        },
        redirect: '/passengerFlowAnalysis/Index',
    },
    {
        path: '/passengerFlowAnalysis/Index',
        name: 'passengerFlowAnalysisIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '客流分析',
            menuRouteName: 'passengerFlowAnalysisIndex',
        },
    },
    {
        path: '/patientOrder/Index',
        name: 'patientOrderIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '病患点餐',
            menuRouteName: 'patientOrderIndex',
        },
    },
    {
        path: '/employeeOrder/Index',
        name: 'employeeOrderIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '职工点餐',
            menuRouteName: 'employeeOrderIndex',
        },
    },
    {
        path: '/invoicing/Index',
        name: 'invoicingIndex',
        component: () => import('./undeveloped/Index.vue'),
        meta: {
            title: '进销存',
            menuRouteName: 'invoicingIndex',
        },
    },

    // 勿删此注释__ROUTES__勿删此注释
]
