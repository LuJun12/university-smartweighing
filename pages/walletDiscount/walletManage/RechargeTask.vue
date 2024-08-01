<template>
    <FakeRouterView :view-config="fakeRouterViewConfig">
        <div class="yq-page-container yq-flex-column">
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
        <template #TaskAddEdit>
            <TaskAddEdit v-bind="fakeRouterViewConfig.TaskAddEdit.props" @success="mainTable.getData" />
        </template>
    </FakeRouterView>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import api from '@smartweighing/api'
import { reactive, inject, onMounted } from 'vue'
import TaskAddEdit from './components/RechargeTask/TaskAddEdit.vue'
import dayjs from 'dayjs';

/* ----------------- 实例化和注入 ------------------ */
const $message = inject('$message')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')

/* ---------------- 伪命名视图配置 ----------------- */
const fakeRouterViewConfig = reactive({
    TaskAddEdit: {
        // 显隐方式
        hiddenType: 'vIf',
        // 视图属性
        props: {},
    },
})
/* --------------------- 表格 --------------------- */
const organizationId = $storage.get('userInfo')?.organizationId || ''
const mainTable = reactive({
    // 工具栏
    toolbar: {
        title: '充值任务',
        render: () => {
            return (
                <el-button onClick={() => $fakeRouter.go('TaskAddEdit', '创建任务')} type="primary">
                    创建
                </el-button>
            )
        },
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
            label: '任务名称',
            prop: 'jobName',
            width: 165,
        },
        {
            label: '说明',
            prop: 'remarks',
            minWidth: 140,
        },
        {
            label: '任务周期',
            prop: 'cycle',
            minWidth: 140,
            formatter: row => {
                const options = [
                    { label: '单次', value: 1 },
                    { label: '每天', value: 2 },
                    { label: '每周', value: 3 },
                    { label: '每月', value: 4 },
                    { label: '每年', value: 5 },
                ]
                const find = options.find(op => op.value === row.cycle)
                let exeDateStr = ''
                if ([3, 4, 5].includes(row.cycle)) {
                    if (row.cycle == 3) {
                        const list = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                        exeDateStr = list[Number(row.exeDate) - 1]
                    } else if (row.cycle == 4) {
                        exeDateStr = row.exeDate + '号'
                    } else if (row.cycle == 5) {
                        exeDateStr = dayjs(row.exeDate).format('M月D日')
                    }
                }
                return (find?.label || '--') + (exeDateStr ? `,${exeDateStr}` : '')
            },
        },
        {
            label: '充值内容',
            minWidth: 180,
            type: 'render',
            render: ({ row }) => {
                return (
                    <>
                        <div v-show={row.amount}>成员钱包:{row.amount}元</div>
                        <div v-show={row.allowanceAmount}>补贴钱包:{row.allowanceAmount}元</div>
                    </>
                )
            },
        },
        {
            label: '创建人',
            prop: 'creatUserName',
            minWidth: 100,
        },
        {
            label: '创建组织',
            prop: 'organizationName',
            minWidth: 180,
        },
        {
            label: '创建时间',
            prop: 'createTime',
            minWidth: 180,
        },
        {
            label: '操作',
            type: 'render',
            width: 150,
            fixed: 'right',
            align: 'center',
            render: params => {
                return (
                    <>
                        <el-button v-show={params.row.organizationId === organizationId} onClick={() => $fakeRouter.go('TaskAddEdit', '编辑任务', { id: params.row.id })} link type="primary">
                            编辑
                        </el-button>
                        <el-button
                            v-show={params.row.organizationId === organizationId}
                            link
                            type="danger"
                            onClick={async () => {
                                if (await $message.confirm('确认删除后，将删除当前充值任务，后续将不会通过当前任务给特定账户充值，但已充值的金额不会受到影响', '确认删除')) {
                                    mainTable.config.loading = true
                                    const res = await api.common.post('/walletrecharge/walletRechargeJob/deleteOne', { id: params.row.id })
                                    mainTable.config.loading = false
                                    if (res.success) {
                                        $message.success('删除成功')
                                        mainTable.getData()
                                    }
                                }
                            }}
                        >
                            删除
                        </el-button>
                    </>
                )
            },
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
        const res = await api.common.post('/walletrecharge/walletRechargeJob/selectPageList', {
            organizationId,
            pageNo: mainTable.pagination.page,
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
    mainTable.getData(1)
})
</script>

<style lang="less" scoped></style>
