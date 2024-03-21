<template>
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
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted } from 'vue'
import ElPlusFormDialog from '@/components/ElPlusFormDialog.vue'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $store = inject('$store')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')
const $routeState = inject('$routeState')

/* ------------------- 查询条件 -------------------- */
const searchConditionFormRef = ref()
const searchConditionForm = reactive({
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        userName: '',
        organizationId: '',
        userAccount: '',
        flowType: '',
        flowEvent: '',
        id: '',
        walletType: '',
    },
    // 表单配置
    config: {
        // 横向表单
        inline: true,
        // 不换行
        nowrap: false,
        // 标签后缀
        labelSuffix: '：',
        // labelWidth: '80',
        // 为指定类型的表单项设置默认属性
        defaultProps: {
            'el-input': {
                maxlength: 50,
                clearable: true,
                modelModifiers: 'trim',
            },
        },
        // 为指定类型的表单项设置默认事件
        defaultEvents: {},
        empty: 'custom',
    },
    // 表单项配置
    items: [
        {
            label: '明细编号',
            prop: 'id',
        },
        {
            label: '姓名',
            prop: 'userName',
        },
        {
            label: '账号',
            prop: 'userAccount',
        },
        {
            label: '钱包类型',
            prop: 'walletType',
            type: 'el-select',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '食客钱包',
                    value: 1,
                },
                {
                    label: '补贴钱包',
                    value: 2,
                },
            ],
        },
        {
            label: '类型',
            prop: 'flowType',
            type: 'el-select',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '转入',
                    value: 1,
                },
                {
                    label: '转出',
                    value: 2,
                },
            ],
        },
        {
            label: '事项',
            prop: 'flowEvent',
            type: 'el-select',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '提现',
                    value: 1,
                },
                {
                    label: '充值',
                    value: 2,
                },
                {
                    label: '订单支付',
                    value: 3,
                },
                {
                    label: '调整',
                    value: 4,
                },
                {
                    label: '退款',
                    value: 5,
                },
            ],
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
        mainTable.pagination.pageSize = 20
        mainTable.getData()
    },
})

/* --------------------- 表格 --------------------- */
const mainTable = reactive({
    // 工具栏
    toolbar: {
        title: '钱包流水',
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
                if (!cellValue && cellValue !== 0) {
                    return '--'
                }
                return cellValue
            },
        },
    },
    // 字段配置
    columns: [
        {
            label: '时间',
            prop: 'createTime',
            width: 165,
        },
        {
            label: '明细编号',
            prop: 'id',
            minWidth: 140,
        },
        {
            label: '相关单据',
            prop: 'orderNo',
            minWidth: 140,
            formatter(...args) {
                if (!args[2]) return '--'
                if (args[0].flowEvent == 5) {
                    return `退款：${args[2]}`
                } else {
                    return `订单：${args[2]}`
                }
            },
        },
        {
            label: '账号',
            prop: 'userAccount',
            minWidth: 100,
        },
        {
            label: '姓名',
            prop: 'userName',
            minWidth: 90,
        },
        {
            label: '钱包类型',
            prop: 'walletType',
            minWidth: 80,
            formatter(...args) {
                return { 1: '食客钱包', 2: '补贴钱包' }[args[2]] ?? args[2] ?? '--'
            },
        },
        {
            label: '事项',
            prop: 'flowEventDesc',
            minWidth: 100,
        },
        {
            label: '类型',
            prop: 'flowType',
            minWidth: 80,
            formatter(...args) {
                return { 1: '转入', 2: '转出' }[args[2]] ?? args[2] ?? '--'
            },
        },
        {
            label: '原余额（元）',
            prop: 'originalBalance',
            minWidth: 100,
        },
        {
            label: '金额变化（元）',
            prop: 'changeAmount',
            minWidth: 120,
        },
        {
            label: '现余额（元）',
            prop: 'currentAmount',
            minWidth: 100,
        },
        {
            label: '备注',
            prop: 'remark',
            minWidth: 200,
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
        const res = await api.smartWeighing.post('/userWalletFlowLog/pageList',{
            ...searchConditionForm.model,
            page: mainTable.pagination.page,
            pageSize: mainTable.pagination.pageSize,
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
    searchConditionForm.model.organizationId = $storage.get('userInfo')?.organizationId
    const storeData = $routeState.get()?.data
    if (storeData) {
        Object.assign(searchConditionForm.model, storeData)
    }
    // 查询表格数据
    mainTable.getData()
})
</script>

<style lang="less" scoped></style>
