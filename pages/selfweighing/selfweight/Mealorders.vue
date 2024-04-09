<template>
    <FakeRouterView :view-config="fakeRouterViewConfig">
        <div class="yq-page-container yq-flex-column">
            <div class="yq-page-search yq-mb-16 yq-rounded-4 yq-bg-white">
                <ElPlusForm
                    ref="searchConditionFormRef"
                    v-model="searchConditionForm.model"
                    :form-config="searchConditionForm.config"
                    :form-items="searchConditionForm.items"
                    :disabled="mainTable.config.loading"
                />
            </div>

            <div class="yq-flex-1 yq-p-16 yq-rounded-4 yq-bg-white">
                <ElPlusTable
                    :table-toolbar="mainTable.toolbar"
                    :table-data="mainTable.data"
                    :table-config="mainTable.config"
                    :table-columns="mainTable.columns"
                    :table-pagination="mainTable.pagination"
                />
            </div>
        </div>
        <template #OrderDetail>
            <OrderDetail v-bind="fakeRouterViewConfig.OrderDetail.props" @success="mainTable.getData"></OrderDetail>
        </template>
    </FakeRouterView>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted } from 'vue'
import OrderDetail from './OrderDetail.vue'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $store = inject('$store')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')

/* ------------------- 查询条件 -------------------- */
const fakeRouterViewConfig = reactive({
    OrderDetail: {
        // 显隐方式
        hiddenType: 'vIf',
        // 视图属性
        props: {},
    },
})

const searchConditionFormRef = ref()
const searchConditionForm = reactive({
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        orderTime: [],
        orderStatus: '',
        paymentMethod: '',
    },
    // 表单配置
    config: {
        // 横向表单
        inline: true,
        // 不换行
        nowrap: false,
        // 标签后缀
        labelSuffix: '：',
        // 为指定类型的表单项设置默认属性
        defaultProps: {
            'el-input': {
                maxlength: 50,
                clearable: true,
                modelModifiers: 'trim',
            },
        },
        // 为指定类型的表单项设置默认事件
        defaultEvents: {
            // 'el-input': { change: () => mainTable.getData(1) },
            // 'el-input': { change: () => mainTable.getData(1) },
            // 'el-input': { change: () => mainTable.getData(1) },
        },
    },
    // 表单项配置
    items: [
        {
            label: '订单编号',
            prop: 'orderNo',
        },
        {
            label: '下单人',
            prop: 'userName',
        },
        {
            label: '订单状态',
            prop: 'orderStatus',
            type: 'el-select',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '待支付',
                    value: 0,
                },
                {
                    label: '已完成',
                    value: 1,
                },
                {
                    label: '支付失败',
                    value: 2,
                },
                {
                    label: '挂账待付',
                    value: 3,
                },
                {
                    label: '已关闭',
                    value: 4,
                },
            ],
        },
        {
            label: '付款方式',
            prop: 'paymentMethod',
            type: 'el-select',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '钱包余额',
                    value: '1',
                },
                {
                    label: '补贴钱包余额',
                    value: '2',
                },
                {
                    label: '组合',
                    value: '3',
                },
                {
                    label: '他人代付',
                    value: '4',
                },
                {
                    label: '一卡通',
                    value: '5',
                },
                // {
                //     label: '微信',
                //     value: '6',
                // },
            ],
        },
        {
            label: '下单时间',
            prop: 'orderTime',
            type: 'el-date-picker',
            props: {
                type: 'datetimerange',
                style: 'max-width: 364px; width: auto;',
                defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
            },
        },
        {
            // 类型为渲染函数
            type: 'render',
            render: () => (
                <>
                    <el-button type="primary" loading={mainTable.config.loading} icon={$elIcons.Search} onclick={() => mainTable.getData(1)}>
                        查询
                    </el-button>
                    <el-button onclick={searchConditionForm.reset}>重置</el-button>
                </>
            ),
        },
    ],
    // 重置
    reset: () => {
        searchConditionFormRef.value.resetFields()
        mainTable.pagination.page = 1
        mainTable.pagination.pageSize = 10
        mainTable.getData()
    },
})

/* --------------------- 表格 --------------------- */
const mainTable = reactive({
    // 工具栏
    toolbar: {
        title: '订单列表',
        render: scope => {},
    },
    // 表格数据
    data: [],
    // 表格配置
    config: {
        // 正在加载
        loading: false,
        // 高度
        maxHeight: '100%',
        // 斑马纹
        stripe: true,
        // 边框
        border: true,
        // 为所有表格列设置默认属性
        defaultProps: {
            // 居中
            align: 'center',
            // 当内容过长被隐藏时显示 tooltip
            showOverflowTooltip: true,
            // 默认格式化器
            formatter: (row, column, cellValue) => {
                if (!cellValue) {
                    return '--'
                }
                return cellValue
            },
        },
        empty: 'custom',
    },
    // 字段配置
    columns: [
        {
            label: '订单编号',
            prop: 'orderNo',
            minWidth: 200,
        },
        {
            label: '订单状态',
            prop: 'orderStatusName',
            minWidth: 90,
        },
        {
            label: '订单详情',
            prop: 'itemNames',
            minWidth: 150,
        },
        {
            label: '订单总价（元）',
            prop: 'totalPrice',
            minWidth: 200,
            formatter: (row, column, cellValue) => {
                if(row.orderType == 2) {
                    if(!row.itemNames && row.orderStatus !== 1) {
                        return '--'
                    }
                }
                if (!cellValue && row.orderStatus !== 1) {
                    return '--'
                }
                return cellValue
            },
        },
        {
            label: '订单应收（元）',
            prop: 'amountReceivable',
            width: 180,
            formatter: (row, column, cellValue) => {
                cellValue = row.orderType == 2 ? row.totalPrice : cellValue
                if(row.orderType == 2) {
                    if(!row.itemNames && row.orderStatus !== 1) {
                        return '--'
                    }
                }
                if (!cellValue && row.orderStatus !== 1) {
                    return '--'
                }
                if(row.orderType == 2) {
                    return row.totalPrice
                }
                return cellValue
            },
        },
        {
            label: '订单实收（元）',
            prop: 'actualPrice',
            width: 180,
            formatter: (row, column, cellValue) => {
                if (!cellValue && row.orderStatus !== 1) {
                    return '--'
                }
                return cellValue
            },
        },
        {
            label: '付款方式',
            prop: 'paymentMethod',
            width: 180,
        },
        {
            label: '下单人',
            prop: 'userName',
            width: 180,
        },
        {
            label: '下单时间',
            prop: 'orderTime',
            width: 180,
        },
        {
            label: '付款时间',
            prop: 'paymentTime',
            width: 180,
            formatter: (row, column, cellValue) => {
                if (!cellValue || row.orderStatus === 3) {
                    return '--'
                }
                return cellValue
            },
        },
        {
            label: '操作',
            type: 'buttons',
            width: 100,
            fixed: 'right',
            buttons: [
                {
                    label: '管理',
                    type: 'primary',
                    link: true,
                    click: row => {
                        fakeRouterViewConfig.OrderDetail.props.id = row.id
                        $fakeRouter.go('OrderDetail', '订单详情', {
                            id: row.id,
                            readonlyMode: true,
                        })
                    },
                },
            ],
        },
    ],
    // 分页器配置
    pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        sizeChange: val => {
            mainTable.pagination.pageSize = val
            mainTable.getData(1)
        },
        currentChange: val => {
            mainTable.pagination.page = val
            mainTable.getData()
        },
    },
    // 获取数据
    getData: async pageNumber => {
        if (pageNumber) {
            mainTable.pagination.page = pageNumber
        }
        mainTable.config.loading = true
        const res = await api.smartWeighing.post('/order/mealSmartOrder/list/canteen', {
            ...searchConditionForm.model,
            page: mainTable.pagination.page,
            pageSize: mainTable.pagination.pageSize,
            orderBeginTime: searchConditionForm.model.orderTime && searchConditionForm.model.orderTime.length ? searchConditionForm.model.orderTime[0] : '',
            orderEndTime: searchConditionForm.model.orderTime && searchConditionForm.model.orderTime.length ? searchConditionForm.model.orderTime[1] : '',
            // 组织（接口必须，这里传一个固定值）
            organizationId: $storage.get('userInfo')?.organizationId,
        })
        mainTable.config.loading = false
        if (res.success) {
            mainTable.data = res.data.records
            mainTable.pagination.total = Number(res.data.total)
        }
    },
})

/* ------------------- 生命周期 -------------------- */
onMounted(() => {
    // 查询表格数据
    mainTable.getData()
})
</script>

<style lang="less" scoped></style>
