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
            <ElPlusTable :table-toolbar="mainTable.toolbar" :table-data="mainTable.data" :table-config="mainTable.config" :table-columns="mainTable.columns" :table-pagination="mainTable.pagination" />
        </div>
    </div>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted } from 'vue'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $store = inject('$store')
const $storage = inject('$storage')

/* ------------------- 查询条件 -------------------- */
const searchConditionFormRef = ref()
const searchConditionForm = reactive({
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        mealTimePeriod: '',
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
            'el-input': { change: () => mainTable.getData(1) },
        },
    },
    // 表单项配置
    items: [
        {
            label: '餐次',
            prop: 'mealTimePeriod',
            type: 'el-select',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '全餐次',
                    value: '7',
                },
                {
                    label: '早餐',
                    value: '1',
                },
                {
                    label: '午餐',
                    value: '2',
                },
                {
                    label: '晚餐',
                    value: '3',
                },
                {
                    label: '夜宵',
                    value: '4',
                },
                {
                    label: '下午茶',
                    value: '5',
                },
                {
                    label: '早上点心',
                    value: '6',
                },
            ],
        },
        {
            label: '菜品名称',
            prop: 'dishName',
        },
        {
            label: '设备编码',
            prop: 'deviceSn',
        },
        {
            label: '设备名称',
            prop: 'deviceName',
        },
        {
            label: '加菜日期',
            prop: 'addTime',
            type: 'el-date-picker',
            props: {
                type: 'date',
                style: 'max-width: 164px; width: auto;',
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
        mainTable.pagination.pageNo = 1
        mainTable.pagination.pageSize = 10
        mainTable.getData()
    },
})

/* --------------------- 表格 --------------------- */
const mainTable = reactive({
    // 工具栏
    toolbar: {
        title: '日志列表',
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
        empty: 'custom',
    },
    // 字段配置
    columns: [
        {
            label: '加菜时间',
            prop: 'addTime',
            minWidth: 120,
        },
        {
            label: '餐次',
            prop: 'mealTimePeriod',
            minWidth: 90,
            formatter: row => {
                if (row.mealTimePeriod && row.mealTimePeriod == 1) {
                    return <span>早餐</span>
                } else if (row.mealTimePeriod && row.mealTimePeriod == 2) {
                    return <span>午餐</span>
                } else if (row.mealTimePeriod && row.mealTimePeriod == 3) {
                    return <span>晚餐</span>
                } else if (row.mealTimePeriod && row.mealTimePeriod == 4) {
                    return <span>夜宵</span>
                } else if (row.mealTimePeriod && row.mealTimePeriod == 5) {
                    return <span>下午茶</span>
                } else if (row.mealTimePeriod && row.mealTimePeriod == 6) {
                    return <span>早上点心</span>
                } else if (row.mealTimePeriod && row.mealTimePeriod == 7) {
                    return <span>全餐次</span>
                } else {
                    return <span>--</span>
                }
            },
        },
        {
            label: '菜品名称',
            prop: 'itemName',
            minWidth: 150,
        },
        {
            label: '加菜重量',
            prop: 'roleList',
            minWidth: 200,
            formatter: row => {
                if (row.addAmount) {
                    return <span>{row.addAmount}g</span>
                } else {
                    return <span>--</span>
                }
            },
        },
        {
            label: '设备名称',
            prop: 'deviceName',
            width: 180,
        },
        {
            label: '设备编码',
            prop: 'deviceSn',
            width: 180,
        },
    ],
    // 分页器配置
    pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0,
        sizeChange: val => {
            mainTable.pagination.pageSize = val
            mainTable.getData(1)
        },
        currentChange: val => {
            mainTable.pagination.pageNo = val
            mainTable.getData()
        },
    },
    // 获取数据
    getData: async pageNumber => {
        if (pageNumber) {
            mainTable.pagination.pageNo = pageNumber
        }
        mainTable.config.loading = true
        const res = await api.smartWeighing.post('/mealSmartAddDishLog/list', {
            ...searchConditionForm.model,
            page: mainTable.pagination.pageNo,
            pageSize: mainTable.pagination.pageSize,
            // 组织（接口必须，这里传一个固定值）
            organizationId: $storage.get('userInfo')?.organizationId,
            // schoolId: $storage.get('userInfo')?.organizationId,
            // schoolAreaId: $storage.get('userInfo')?.organizationId,
            addBeginTime: searchConditionForm.model.addTime ? searchConditionForm.model.addTime + ' 00:00:00' : '',
            addEndTime: searchConditionForm.model.addTime ? searchConditionForm.model.addTime + ' 23:59:59' : '',
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
