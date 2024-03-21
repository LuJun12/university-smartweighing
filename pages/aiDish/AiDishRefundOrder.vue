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
            <refund-dilog ref="refundRef" :detailId="dialogId" :dialogRow="dialogRow" @fresh-data="freshData"></refund-dilog>
        </div>
    </FakeRouterView>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted } from 'vue'
import RefundDilog from './components/RefundList.vue'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $store = inject('$store')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')

/* ------------------- 查询条件 -------------------- */

const searchConditionFormRef = ref()
const searchConditionForm = reactive({
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        refundMethodType: '',
        refundStatus: '',
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
            label: '退款编号',
            prop: 'refundNo',
        },
        {
            label: '订单编号',
            prop: 'orderNo',
        },
        {
            label: '下单人',
            prop: 'dinnerName',
        },
        {
            label: '退款状态',
            prop: 'refundStatus',
            type: 'el-select',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '退款成功',
                    value: 3,
                },
                {
                    label: '退款失败',
                    value: 4,
                },
                {
                    label: '申请中',
                    value: 0,
                },
                // {
                //     label: '部分退款',
                //     value: 2,
                // },
                // {
                //     label: '退款中',
                //     value: 1,
                // },
               
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
                    label: '微信',
                    value: '6',
                },
                // {
                //     label: '组合',
                //     value: '3',
                // },
                // {
                //     label: '他人代付',
                //     value: '4',
                // },
                // {
                //     label: '一卡通',
                //     value: '5',
                // },
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
            label: '退款单号',
            prop: 'refundNo',
            minWidth: 200,
        },
        {
            label: '相关订单',
            prop: 'orderNo',
            minWidth: 200,
        },
        {
            label: '相关账单',
            prop: 'revokeOrder',
            minWidth: 240,
            formatter: (row, column, cellValue) => {
                if (!row.revokeOrder) {
                    return '无'
                }
                if (row.revokeOrder.revokeNumber && row.revokeOrder.payNumber) {
                    return (
                        <span>
                            [{row.revokeOrder.revokeState == 1 ? '成功' : '失败'}]整单退款:{row.revokeOrder.revokeNumber}
                            <br />[{row.revokeOrder.payState == 1 ? '成功' : '失败'}]重新支付:{row.revokeOrder.payNumber}
                        </span>
                    )
                }
                if (row.revokeOrder.revokeNumber) {
                    return (
                        <span>
                            [{row.revokeOrder.revokeState == 1 ? '成功' : '失败'}]整单退款:{row.revokeOrder.revokeNumber}
                        </span>
                    )
                }
                if (row.revokeOrder.payNumber) {
                    return (
                        <span>
                            [{row.revokeOrder.payState == 1 ? '成功' : '失败'}]重新支付:{row.revokeOrder.payNumber}
                        </span>
                    )
                }
            },
        },
        {
            label: '状态',
            prop: 'refundStatusName',
            minWidth: 150,
        },
        {
            label: '下单人',
            prop: 'dinnerName',
            minWidth: 200,
        },
        {
            label: '退款方式',
            prop: 'refundMethod',
            width: 180,
        },
        {
            label: '退款内容',
            prop: 'refundItemNames',
            width: 180,
        },
        {
            label: '原因及回复',
            prop: 'refundReasonReply',
            width: 180,
            formatter: (row, column, cellValue) => {
                return (
                    <span>
                        {row.refundReason || '--'}
                        <br />
                        {row.refundReasonReply || '--'}
                    </span>
                )
            },
        },
        {
            label: '退款总额（元）',
            prop: 'refundedTotalAmount',
            width: 180,
        },
        {
            label: '操作人员',
            prop: 'operatorName',
            width: 180,
        },
        {
            label: '退款渠道',
            prop: 'refundChannel',
            width: 180,
        },
        {
            label: '退款时间',
            prop: 'operateTime',
            width: 200,
            formatter: (row, column, cellValue) => {
                if (row.refundStatus == 0) {
                    return <span>{row.operateTime}申请</span>
                } else if (row.refundStatus == 3 || row.refundStatus == 2) {
                    return <span>{row.operateTime}退款</span>
                } else if (row.refundStatus == 4) {
                    return <span>{row.operateTime}失败</span>
                } else {
                    return <span>--</span>
                }
            },
        },
        {
            label: '操作',
            type: 'buttons',
            width: 100,
            fixed: 'right',
            buttons: [
                {
                    label: '审核',
                    type: 'primary',
                    link: true,
                    show: row => {
                        return row.refundStatus === 0 ? true : false
                    },
                    click: row => {
                        refundRef.value.open({
                            dialogId: row.refundOrderId,
                        })
                    },
                },
                {
                    label: '再次退款',
                    type: 'primary',
                    link: true,
                    show: row => {
                        return row.refundStatus === 1 ? true : false
                    },
                    click: row => {
                        refundAgin(row)
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
        const res = await api.common.post('/order/mealSmartOrder/orderRefundList', {
            ...searchConditionForm.model,
            pageNo: mainTable.pagination.page,
            pageSize: mainTable.pagination.pageSize,
            // 组织（接口必须，这里传一个固定值）
            organizationId: $storage.get('userInfo')?.organizationId,
        })
        mainTable.config.loading = false
        if (res.success) {
            mainTable.data = [
    {
        "refundOrderId": "1691337663527882753",
        "refundNo": "TD20230815143457001",
        "orderId": "1691335097423208449",
        "orderNo": "CZ20230815142445001",
        "revokeOrder": null,
        "refundStatus": 2,
        "refundStatusName": "部分退款",
        "dinnerId": "1670684721439645698",
        "dinnerName": "",
        "refundMethod": "后台退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "",
        "refundReasonReply": "",
        "refundedTotalAmount": 1,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-15 14:34:57",
        "createTime": "2023-08-15 14:34:57",
        "operateTime": "2023-08-15 14:34:57"
    },
    {
        "refundOrderId": "1690988650360397825",
        "refundNo": "TD20230814152805001",
        "orderId": "1690987270237249538",
        "orderNo": "CZ20230814152236001",
        "revokeOrder": null,
        "refundStatus": 0,
        "refundStatusName": "申请退款",
        "dinnerId": "1670684721439645698",
        "dinnerName": "",
        "refundMethod": "申请退款",
        "refundItemNames": "肉包,红烧牛肉",
        "refundReason": "1111",
        "refundReasonReply": "",
        "refundedTotalAmount": 3.4,
        "operatorName": "",
        "refundChannel": "",
        "refundTime": null,
        "createTime": "2023-08-14 15:28:05",
        "operateTime": "2023-08-14 15:28:06"
    },
    {
        "refundOrderId": "1690972208772603906",
        "refundNo": "TD20230814142245001",
        "orderId": "1690274575708368897",
        "orderNo": "CZ20230812161037001",
        "revokeOrder": null,
        "refundStatus": 3,
        "refundStatusName": "退款成功",
        "dinnerId": "1671448727512875009",
        "dinnerName": "",
        "refundMethod": "后台退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "",
        "refundReasonReply": "",
        "refundedTotalAmount": 3.4,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-14 14:22:46",
        "createTime": "2023-08-14 14:22:45",
        "operateTime": "2023-08-14 14:22:46"
    },
    {
        "refundOrderId": "1688530224300486658",
        "refundNo": "TD20230807203911002",
        "orderId": "1688528672215068674",
        "orderNo": "CZ20230807203301003",
        "revokeOrder": null,
        "refundStatus": 4,
        "refundStatusName": "退款失败",
        "dinnerId": "1685921181752946690",
        "dinnerName": "",
        "refundMethod": "申请退款",
        "refundItemNames": "葡萄干燕麦11",
        "refundReason": "退款1.51",
        "refundReasonReply": "不同意11111",
        "refundedTotalAmount": null,
        "operatorName": "李海波",
        "refundChannel": "",
        "refundTime": null,
        "createTime": "2023-08-07 20:39:11",
        "operateTime": "2023-08-07 20:39:29"
    },
    {
        "refundOrderId": "1688524815950999553",
        "refundNo": "TD20230807201742001",
        "orderId": "1688522615833030657",
        "orderNo": "CZ20230807200857002",
        "revokeOrder": {
            "orderNumber": "CZ20230807200857002",
            "revokeNumber": "RN20230807201756001",
            "revokeState": 1,
            "payNumber": "",
            "payState": null,
            "businessRefundId": "1688524815950999553"
        },
        "refundStatus": 3,
        "refundStatusName": "退款成功",
        "dinnerId": "1685921181752946690",
        "dinnerName": "",
        "refundMethod": "申请退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "2.6",
        "refundReasonReply": "2.6",
        "refundedTotalAmount": 2.6,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-07 20:18:02",
        "createTime": "2023-08-07 20:17:42",
        "operateTime": "2023-08-07 20:18:12"
    },
    {
        "refundOrderId": "1688520712067805185",
        "refundNo": "TD20230807200123002",
        "orderId": "1688516696952860674",
        "orderNo": "CZ20230807194526002",
        "revokeOrder": {
            "orderNumber": "CZ20230807194526002",
            "revokeNumber": "RN20230807200123001",
            "revokeState": 1,
            "payNumber": "PN20230807200124001",
            "payState": 1,
            "businessRefundId": "1688520712067805185"
        },
        "refundStatus": 2,
        "refundStatusName": "部分退款",
        "dinnerId": "1685921181752946690",
        "dinnerName": "",
        "refundMethod": "后台退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "",
        "refundReasonReply": "",
        "refundedTotalAmount": 0.1,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-07 20:01:25",
        "createTime": "2023-08-07 20:01:23",
        "operateTime": "2023-08-07 20:01:35"
    },
    {
        "refundOrderId": "1688491712935161858",
        "refundNo": "TD20230807180609001",
        "orderId": "1688489556354068481",
        "orderNo": "CZ20230807175735001",
        "revokeOrder": {
            "orderNumber": "CZ20230807175735001",
            "revokeNumber": "RN20230807180609002",
            "revokeState": 1,
            "payNumber": "",
            "payState": null,
            "businessRefundId": "1688491712935161858"
        },
        "refundStatus": 3,
        "refundStatusName": "退款成功",
        "dinnerId": "1685921181752946690",
        "dinnerName": "",
        "refundMethod": "后台退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "",
        "refundReasonReply": "",
        "refundedTotalAmount": 0.1,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-07 18:06:11",
        "createTime": "2023-08-07 18:06:09",
        "operateTime": "2023-08-07 18:06:21"
    },
    {
        "refundOrderId": "1688491083835699201",
        "refundNo": "TD20230807180339002",
        "orderId": "1688489556354068481",
        "orderNo": "CZ20230807175735001",
        "revokeOrder": {
            "orderNumber": "CZ20230807175735001",
            "revokeNumber": "RN20230807180518002",
            "revokeState": 1,
            "payNumber": "PN20230807180519002",
            "payState": 1,
            "businessRefundId": "1688491083835699201"
        },
        "refundStatus": 2,
        "refundStatusName": "部分退款",
        "dinnerId": "1685921181752946690",
        "dinnerName": "",
        "refundMethod": "申请退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "退0.3",
        "refundReasonReply": "退0.3",
        "refundedTotalAmount": 0.3,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-07 18:05:20",
        "createTime": "2023-08-07 18:03:39",
        "operateTime": "2023-08-07 18:05:30"
    },
    {
        "refundOrderId": "1688489397629022209",
        "refundNo": "TD20230807175657001",
        "orderId": "1688486488224886786",
        "orderNo": "CZ20230807174524001",
        "revokeOrder": {
            "orderNumber": "CZ20230807174524001",
            "revokeNumber": "RN20230807175657001",
            "revokeState": 1,
            "payNumber": "",
            "payState": null,
            "businessRefundId": "1688489397629022209"
        },
        "refundStatus": 3,
        "refundStatusName": "退款成功",
        "dinnerId": "1685921181752946690",
        "dinnerName": "",
        "refundMethod": "后台退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "",
        "refundReasonReply": "",
        "refundedTotalAmount": 0.3,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-07 17:56:59",
        "createTime": "2023-08-07 17:56:57",
        "operateTime": "2023-08-07 17:57:09"
    },
    {
        "refundOrderId": "1688489121987751938",
        "refundNo": "TD20230807175551001",
        "orderId": "1688486488224886786",
        "orderNo": "CZ20230807174524001",
        "revokeOrder": {
            "orderNumber": "CZ20230807174524001",
            "revokeNumber": "RN20230807175552001",
            "revokeState": 1,
            "payNumber": "PN20230807175553001",
            "payState": 1,
            "businessRefundId": "1688489121987751938"
        },
        "refundStatus": 2,
        "refundStatusName": "部分退款",
        "dinnerId": "1685921181752946690",
        "dinnerName": "",
        "refundMethod": "后台退款",
        "refundItemNames": "红烧鲫鱼",
        "refundReason": "",
        "refundReasonReply": "",
        "refundedTotalAmount": 0.1,
        "operatorName": "李海波",
        "refundChannel": "原路退回",
        "refundTime": "2023-08-07 17:55:54",
        "createTime": "2023-08-07 17:55:52",
        "operateTime": "2023-08-07 17:56:04"
    }
]//res.data.records
            mainTable.pagination.total = Number(res.data.total)
        }
    },
})
const dialogId = ref('')
const freshData = () => {
    mainTable.getData()
}
const refundAgin = async row => {
    mainTable.config.loading = true
    const res = await api.common.post('/order/mealSmartOrder/confirmRefunds', {
        strategyName: 'pcOneCardOnceAgainRefundStrategy',
        orderId: row.orderId,
        refundOrderId: row.refundOrderId,
        // 组织（接口必须，这里传一个固定值）
        organizationId: $storage.get('userInfo')?.organizationId,
    })
    mainTable.config.loading = false
    if (res.success) {
        mainTable.getData()
    }
}
const refundRef = ref(null)

/* ------------------- 生命周期 -------------------- */
onMounted(() => {
    // 查询表格数据
    mainTable.getData()
})
</script>

<style lang="less" scoped></style>
