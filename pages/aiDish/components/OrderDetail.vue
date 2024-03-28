<template>
    <div class="yq-flex-column staff-detail" v-loading="detailInfo.loading">
        <div class="asd-all">
            <el-card class="box-card">
                <div class="thyj">
                    <div class="type-left">
                        <div class="esl-sdd">{{ detailInfo.info.orderStatusName }}</div>
                        <el-tag class="yq-mt-6" v-if="detailInfo.info.refundStatusName">{{ detailInfo.info.refundStatusName }}</el-tag>
                    </div>
                    <el-divider direction="vertical"></el-divider>
                    <div class="type-right">
                        <el-steps :active="activeSteps" finish-status="success">
                            <el-step :title="startSteps.orderStatusName">
                                <template #description>
                                    <div class="stype-name">{{ startSteps.statusChangeTime }}</div>
                                    <div class="stype-time">{{ startSteps.description }}</div>
                                </template>
                            </el-step>
                            <el-step :title="endSteps.orderStatusName">
                                <template #description>
                                    <div class="stype-name">{{ endSteps.statusChangeTime }}</div>
                                    <div class="stype-time">{{ endSteps.description }}</div>
                                </template>
                            </el-step>
                        </el-steps>
                    </div>
                </div>
            </el-card>
        </div>
        <div class="log-all">
            <el-row :gutter="20" v-if="detailInfo.info.orderStatus !== 4">
                <el-col :span="10">
                    <el-card class="box-card">
                        <template #header>
                            <div class="clearfix">
                                <span>订单基础信息</span>
                            </div>
                        </template>
                        <div class="list-all">
                            <div class="left">订单编号：</div>
                            <div class="right">{{ detailInfo.info.orderNo || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">下单人编号：</div>
                            <div class="right">{{ detailInfo.info.userNo || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">下单人：</div>
                            <div class="right">{{ detailInfo.info.userName || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">菜品数量：</div>
                            <div class="right" v-if="detailInfo.info.dishCount">{{ detailInfo.info.dishCount }}件</div>
                        </div>
                        <div class="list-all">
                            <div class="left">菜品总重：</div>
                            <div class="right" v-if="detailInfo.info.dishTotalWeight">{{ detailInfo.info.dishTotalWeight }}g</div>
                        </div>
                        <div class="list-all">
                            <div class="left">下单时间：</div>
                            <div class="right">{{ detailInfo.info.orderTime || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">取餐总耗时：</div>
                            <div class="right">{{ detailInfo.info.timeDifference || '--' }}</div>
                        </div>
                        <!-- <div class="list-all">
                            <div class="left">下单食堂：</div>
                            <div class="right">{{ detailInfo.info.downOrderPosition || '--' }}</div>
                        </div>-->
                    </el-card>
                </el-col>
                <el-col :span="14">
                    <el-card class="box-card">
                        <template #header>
                            <div class="clearfix">
                                <span>订单付款信息</span>
                            </div>
                        </template>
                        <el-row>
                            <el-col :span="12">
                                <div class="list-all">
                                    <div class="left">付款人编号：</div>
                                    <div class="right">{{ detailInfo.info.orderStatus === 0 || detailInfo.info.orderStatus === 3 ? '--' : detailInfo.info.payUserNo || '--' }}</div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="list-all">
                                    <div class="left">付款人：</div>
                                    <div class="right">{{ detailInfo.info.orderStatus === 0 || detailInfo.info.orderStatus === 3 ? '--' : detailInfo.info.payUserName || '--' }}</div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="list-all">
                                    <div class="left">付款方式：</div>
                                    <div class="right">{{ detailInfo.info.orderStatus === 0 || detailInfo.info.orderStatus === 3 ? '--' : detailInfo.info.paymentMethod || '--' }}</div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="list-all">
                                    <div class="left">付款时间：</div>
                                    <div class="right">{{ detailInfo.info.orderStatus === 0 || detailInfo.info.orderStatus === 3 ? '--' : detailInfo.info.paymentTime || '--' }}</div>
                                </div>
                            </el-col>
                        </el-row>
                        <div class="table-a">
                            <div class="left">
                                <div class="bottom">金额明细</div>
                                <div class="bottom">支付方式</div>
                            </div>
                            <div class="right">
                                <div class="top">
                                    <div class="df-one">订单总价</div>
                                    <div class="df-one">优惠金额</div>
                                    <div class="df-one">优惠券抵扣</div>
                                    <!-- <div class="df-one">订单应收</div> -->
                                    <div class="df-one">订单实收</div>
                                </div>
                                <div class="dis-bottom-all">
                                    <div class="lefts">
                                        <div class="top-value">
                                            <div class="df-one-a">{{ detailInfo.info.totalPrice || 0 }}</div>
                                            <div class="df-one-a">{{ detailInfo.info.offerAmount || 0 }}</div>
                                            <div class="df-one-a">{{ detailInfo.info.msd || 0 }}</div>
                                        </div>
                                        <div class="top-title">
                                            <div class="df-one">钱包余额</div>
                                            <div class="df-one">补贴账户</div>
                                            <div class="df-one">其他支付</div>
                                        </div>
                                        <div class="top-value">
                                            <div class="df-one-a">{{ detailInfo.info.amount || 0 }}</div>
                                            <div class="df-one-a">{{ detailInfo.info.allowanceAmount || 0 }}</div>
                                            <div class="df-one-a" v-html="detailInfo.info.actualAmount || '--'"></div>
                                        </div>
                                    </div>
                                    <!-- <div class="rights">{{ detailInfo.info.amountReceivable || 0 }}</div> -->
                                    <div class="rights">{{ detailInfo.info.actualPrice || 0 }}</div>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row v-else>
                <el-col :span="24">
                    <el-card class="box-card">
                        <template #header>
                            <div class="clearfix">
                                <span>订单基础信息</span>
                            </div>
                        </template>
                        <div class="list-all">
                            <div class="left">订单编号：</div>
                            <div class="right">{{ detailInfo.info.orderNo || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">下单人编号：</div>
                            <div class="right">{{ detailInfo.info.userNo || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">下单人：</div>
                            <div class="right">{{ detailInfo.info.userName || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">菜品数量：</div>
                            <div class="right">{{ detailInfo.info.dishCount || '--' }}件</div>
                        </div>
                        <div class="list-all">
                            <div class="left">菜品总重：</div>
                            <div class="right">{{ detailInfo.info.dishTotalWeight || '--' }}g</div>
                        </div>
                        <div class="list-all">
                            <div class="left">下单时间：</div>
                            <div class="right">{{ detailInfo.info.orderTime || '--' }}</div>
                        </div>
                        <div class="list-all">
                            <div class="left">取餐总耗时：</div>
                            <div class="right">{{ detailInfo.info.timeDifference || '--' }}</div>
                        </div>
                        <!-- <div class="list-all">
                            <div class="left">下单食堂：</div>
                            <div class="right">{{ detailInfo.info.downOrderPosition || '--' }}</div>
                        </div>-->
                    </el-card>
                </el-col>
            </el-row>
        </div>
        <div class="tab-all">
            <el-button type="primary" class="tk-btn" v-if="detailInfo.info.orderStatus === 1 && activeName === 'first'" @click="kuikuanhandle">退款</el-button>
            <el-tabs v-model="activeName" v-if="detailInfo.info.orderStatus !== 4">
                <el-tab-pane label="菜品信息" name="first">
                    <el-table :data="dataListDish" style="width: 100%; margin-top: 20px" @selection-change="handleSelectionChange">
                        <el-table-column type="selection" width="55"></el-table-column>
                        <el-table-column v-for="(item, index) in columnsdish" :prop="item.prop" :key="index" :formatter="item.formatter" :label="item.label" :width="item.width" :type="item.type">
                            <template #default="scope">
                                <template v-if="item.formatter">
                                    <span v-html="item.formatter(scope.row)"></span>
                                </template>
                                <span v-else>{{ scope.row[item.prop] || '--' }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="退款信息" name="third" v-if="detailInfo.info.orderStatus === 1">
                    <el-table :data="dataListTk" style="width: 100%; margin-top: 20px">
                        <el-table-column v-for="(item, index) in columnstk" :prop="item.prop" :key="index" :formatter="item.formatter" :label="item.label" :width="item.width">
                            <template #default="scope">
                                <template v-if="item.formatter">
                                    <span v-html="item.formatter(scope.row)"></span>
                                </template>
                                <span v-else>{{ scope.row[item.prop] || '--' }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </div>
        <!-- <div
            class="foot-btn"
            v-if="
                (detailInfo.info.orderStatus == 1 ? detailInfo.info.actualPrice > 0 : detailInfo.info.totalPrice > 0) &&
                (detailInfo.info.orderStatus === 0 || detailInfo.info.orderStatus === 3 || detailInfo.info.orderStatus === 2)
            "
        >
            <el-button type="primary" @click="handlePay()">立即结算</el-button>
        </div>-->
        <refund-dilog ref="refundRef" :detailId="dialogId" :dialogRow="dialogRow" @fresh-data="freshData"></refund-dilog>
    </div>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted, computed, watch } from 'vue'
import RefundDilog from './Refund.vue'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $store = inject('$store')
const $message = inject('$message')
const $routeState = inject('$routeState')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')

const props = defineProps({
    id: {
        type: [String, Number],
    },
})

/* ----------------- 图片基础路径 ------------------ */

/* --------------------- 表格 --------------------- */

const dataListLog = ref([])
const dataListTk = ref([])
const dataListDish = ref([])
const columnsdish = ref([
    // { width: '55px', type: 'selection' },
    { prop: 'itemName', label: '菜品名称', width: '' },
    // { prop: 'itemName', label: '计价方式', width: '' },
    { prop: 'itemUnitPrice', label: '单价（元）', width: '' },
    { prop: 'itemUnitPrice', label: '数量', width: '' },
    // { prop: 'itemName', label: '份量（份）', width: '' },
    // { prop: 'itemWeight', label: '重量（g）', width: '' },
    { prop: 'itemTotalPrice', label: '总价（元）', width: '' },
    { prop: 'discountedPrice', label: '优惠价（元）', width: '' },
    // { prop: 'actionTime', label: '最后打餐时间', width: '' },
])
const columnstk = ref([
    { prop: 'refundTime', label: '退款时间', width: '' },
    { prop: 'refundStatusName', label: '状态', width: '' },
    
    { prop: 'refundMethod', label: '退款方式', width: '' },
    { prop: 'refundItemNames', label: '退款内容', width: '' },
    { prop: 'refundedAmount', label: '退款总额(元)', width: '' },
    {
        prop: 'refundReasonReply',
        label: '原因及回复',
        width: '',
        formatter: (row, column, cellValue) => {
            if(row.refundReason || row.refundReasonReply) {
                return (
                    <span>
                        {row.refundReason || '--'}
                        <br />
                        {row.refundReasonReply || '--'}
                    </span>
                )
            }else{
                return '--'
            }
        }
    },
    // { prop: 'refundWalletBalance', label: '退回钱包余额(元)', width: '' },
    // { prop: 'refundSubsidyAccount', label: '退回补贴账户(元)', width: '' },
    // { prop: 'refundOnlinePayment', label: '退回其他(元)', width: '' },
    { prop: 'operatorName', label: '操作人员', width: '' },
    { prop: 'refundChannel', label: '退款渠道', width: '' },
])
const activeName = ref('first')
const multipleSelection = ref([])
const activeSteps = ref(0)
const startSteps = ref({})
const endSteps = ref({})
const showAnnotatorDialog = ref(false)
const dialogId = ref('')
const dialogRow = ref([])

const handleSelectionChange = val => {
    multipleSelection.value = val
}

const refundRef = ref(false)
const kuikuanhandle = () => {
    if (!multipleSelection.value.length) {
        $message.error('请先在下面的表格中选中至少一样菜品')
    } else {
        dialogRow.value = multipleSelection.value
        dialogId.value = props.id

        refundRef.value.open({
            dialogRow: multipleSelection.value,
            dialogId: props.id,
        })
        // refundFlag.value = true
    }
}

const handlePay = async () => {
    if (await $message.confirm('请确认食客已取完餐，若立即结算，结算后食客将无法取餐', '结算确认')) {
        const res = await api.common.post('/order/mealSmartOrder/handBackstageSettlement', {
            id: detailInfo.modifyId,
        })
        if (res.success) {
            $message.success('操作成功')
            freshData()
        }
    }
}
// const refundFlag = ref(false)
const freshData = () => {
    // refundFlag.value = false
    detailInfo.getData()
}

const detailInfo = reactive({
    info: {},
    modifyId: '',
    loading: false,
    getData: async () => {
        let actualAmount = ''
        detailInfo.loading = true
        const res = await api.visualSettlementBase.post('/visual-settlement-base/order/detail/canteen', {
            id: detailInfo.modifyId,
            organizationId: $storage.get('userInfo')?.organizationId,
        })
        detailInfo.loading = false
        if (res.success) {
            detailInfo.info = res.data
            let actualAmount = ''
            res.data.actualAmount.forEach(v => {
                actualAmount = actualAmount + `${v.paymentMethod}：${v.changeAmount}` + '<br>'
            })
            detailInfo.info.actualAmount = actualAmount
            dataListDish.value = res.data.detailList
            dataListLog.value = res.data.dishLogList
            dataListTk.value = res.data.refundInfoList
            startSteps.value = {
                orderStatusName:'待支付',
                statusChangeTime:res.data.orderTime,
                description:'用户下单'
            }
            if(res.data.orderStatus == 1) {
                endSteps.value = {
                    orderStatusName:'已完成',
                    statusChangeTime:res.data.paymentTime,
                    description:'支付成功'
                }
                activeSteps.value = 2
            }
        }
    },
})
/* --------------------- watch -------------------- */
watch(
    () => props.id,
    newValue => {
        if (newValue) {
            detailInfo.modifyId = newValue
            detailInfo.getData()
        }
    },
    {
        immediate: true,
        deep: true,
    }
)

/* ------------------- 变量和方法 -------------------- */

const goBack = () => {
    $fakeRouter.back()
}

/* ------------------- 生命周期 -------------------- */
onMounted(() => {
    // detailInfo.modifyId = props.id
    // detailInfo.getData()
    // mainTable.getMorningData()
    // mainTable.getPublishData()
    // mainTable.getTrainData()
})
</script>

<style lang="less" scoped>
.foot-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 60px;
    background-color: white;
    width: 100%;
    z-index: 100;
    line-height: 60px;
    text-align: right;
    padding-right: 40px;
}
.staff-detail {
    overflow: hidden;
    .tab-all {
        position: relative;
        margin-top: 20px;
        margin-bottom: 60px;
        .tk-btn {
            position: absolute;
            z-index: 20;
            right: 20px;
            top: 0px;
        }
    }
    .log-all {
        margin-top: 20px;
        .list-all {
            display: flex;
            align-items: center;
            height: 45px;
            .left {
                width: 100px;
            }
            .right {
                flex: 1;
            }
        }
    }
    .clearfix {
        font-size: 16px;
        font-weight: bold;
    }
    .table-a {
        height: 100%;
        box-sizing: border-box;
        border-top: 1px solid #ddd;
        border-left: 1px solid #ddd;
        display: flex;
        .left {
            width: 50px;
            background-color: rgba(85, 85, 85, 1);
            .bottom {
                height: 50%;
                box-sizing: border-box;
                border-right: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                font-size: 20px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            }
        }
        .right {
            flex: 1;
            .top {
                display: flex;
                .df-one {
                    height: 37.5px;
                    width: 25%;
                    line-height: 37.5px;
                    padding-left: 10px;
                    background-color: #eee;
                    border-right: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                }
            }
            .top-value {
                display: flex;
                .df-one-a {
                    height: 75px;
                    width: 33.333%;
                    // line-height: 37.5px;
                    padding-left: 10px;
                    display: flex;
                    align-items: center;
                    // background-color: #eee;
                    border-right: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                }
            }
            .top-title {
                display: flex;
                .df-one {
                    height: 37.5px;
                    width: 33.333%;
                    line-height: 37.5px;
                    padding-left: 10px;
                    background-color: #eee;
                    border-right: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                }
            }
            .dis-bottom-all {
                display: flex;
                width: 100%;
                .lefts {
                    flex: 1;
                }
                .rights {
                    width: 25%;
                    height: 187.5px;
                    line-height: 187.5px;
                    padding-left: 10px;
                    border-right: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                    font-size: 28px;
                }
            }
        }
    }
    .asd-all {
        .thyj {
            display: flex;
            .type-left {
                width: 150px;
                display: flex;
                flex-direction: column;
                align-items: center;
                .esl-sdd {
                    font-size: 24px;
                    color: #303133;
                    font-weight: bold;
                }
            }

            :deep(.el-divider--vertical) {
                height: 4.5em;
            }
            .type-right {
                flex: 1;
                padding-left: 10px;
            }
        }
    }
    :deep(.el-step__head.is-success) {
        color: var(--el-color-primary) !important;
        border-color: var(--el-color-primary) !important;
        // height: 4.5em;
    }
    :deep(.el-step__description.is-success) {
        color: var(--el-color-primary) !important;
    }
    :deep(.el-step__title.is-success) {
        color: var(--el-color-primary) !important;
    }
}
.stype-name {
    font-size: 16px;
}
</style>
