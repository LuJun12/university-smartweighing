<template>
    <div>
        <el-dialog :title="dialogTitle" top="10vh" :close-on-press-escape="false" :close-on-click-modal="false" v-model="centerDialogVisible" :width="counterVisible?'1000px':'500px'">
            <div v-if="centerDialogVisible">
                <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
                    <el-row>
                        <el-col :span="counterVisible?12:24">
                            <el-form-item label="退款方式：">
                                <el-radio-group v-model="form.refundChannelType" size="mini">
                                    <el-radio :label="1" border>原路退回</el-radio>
                                    <el-radio :label="2" border>现金退款</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <div class="mian-all">
                                <div class="mian-title">退款明细</div>
                                <el-row>
                                    <el-col :span="12">订单总额：¥{{ detailInfo.totalPrice }}</el-col>
                                    <el-col :span="12">已退：¥{{ detailInfo.refundedTotalAmount }}</el-col>
                                    <el-col :span="12">剩余可退：¥{{ detailInfo.remainingRefundAmount }}</el-col>
                                </el-row>
                            </div>
                            <el-form-item label="退款金额：" prop="refundAmount">
                                <el-input size="mini" v-model.trim="form.refundAmount" @input="onDishVerifyNumberIntegerAndFloat($event, 'refundAmount')" style="width: 200px"></el-input>
                            </el-form-item>
                            <el-form-item label="退款回复：" prop="refundReasonReply">
                                <el-input size="mini" rows="3" type="textarea" placeholder="请输入原因回复食客" v-model.trim="form.refundReasonReply" style="width: 200px"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" v-if="counterVisible">
                            <div class="sd-title">退款原因</div>
                            <div class="sd-md-c">{{ detailInfo.refundReason }}</div>
                            <div>
                                <ImageUploader :readOnly="true" :max-list="100" :img-list="detailInfo.refundImages" />
                            </div>
                            <div class="sd-title">期望退款金额</div>
                            <div class="sd-md">注意：这里只作为计算金额使用</div>
                            <div class="table-new">
                                <div class="top-title">
                                    <div class="df-one">退款菜品</div>
                                    <div class="df-one">退款重量（g）</div>
                                    <div class="df-one">退款金额（元）</div>
                                </div>
                                <div class="top-bottom" v-for="(item, index) in tableNew" :key="index">
                                    <div class="df-one one-text-overflow">
                                        <!-- {{item.itemName}} -->
                                        <el-tooltip :content="item.itemName" placement="top">
                                            <span>{{ item.itemName }}</span>
                                        </el-tooltip>
                                    </div>
                                    <div class="df-one">
                                        <el-input size="mini" v-model="item.weightnew" @input="onDishVerifyNumberIntegerAndFloatnew($event, 'weightnew', index)"></el-input>
                                    </div>
                                    <div class="df-one">{{ item.totalPricenew }}</div>
                                </div>
                                <div class="top-bottom">
                                    <div class="df-one">合计金额</div>
                                    <div class="df-one"></div>
                                    <div class="df-one">{{ newAllprice }}</div>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                    <div class="submit-btn-wapper">
                        <el-button size="mini" :loading="submitloading" @click="onNosubmit">拒绝退款</el-button>
                        <el-button size="mini" type="primary" :loading="submitloading" @click="onSubmit">确定</el-button>
                    </div>
                </el-form>
            </div>
        </el-dialog>
    </div>
</template>
<script setup>
import { computed, markRaw, onMounted, ref, inject, unref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// import { mealSmartOrderorderRefundDetail, mealSmartOrderorderconfirmRefunds } from '@/api/devicemanagement'
// import { Session } from '@/utils/storage'
import { verifyNumberIntegerAndFloat } from '@/tools/toolsValidate'
import ImageUploader from '@/components/ImageUploader.vue'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $store = inject('$store')
const $message = inject('$message')
const $routeState = inject('$routeState')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')

const props = defineProps({
    dialogTitle: {
        type: [String],
        default: '订单审核',
    },
    counterVisible: {
        type: Boolean,
        default: () => false,
    },
})
const emits = defineEmits(['freshData'])

/* ------------------- computed ------------------- */
const newAllprice = computed(() => {
    return tableNew.value
        .reduce((preValue, curValue) => {
            return preValue + +curValue.totalPricenew
        }, 0)
        .toFixed(2)
})

const form = reactive({
    refundChannelType: 1,
    refundAmount: '',
})
const sendId = ref('')
const rules = reactive({
    refundAmount: [{ required: true, message: `请输入`, trigger: ['blur'] }],
})

const detailInfo = ref({})
const tableNew = ref([])
const submitloading = ref(false)

const onDishVerifyNumberIntegerAndFloat = (val, name) => {
    let num = verifyNumberIntegerAndFloat(val)
    form[name] = num
}
const onDishVerifyNumberIntegerAndFloatnew = (val, name, index) => {
    let num = verifyNumberIntegerAndFloat(val)
    const newPrice = ((+tableNew.value[index]['itemUnitPrice'] * +num) / 100).toFixed(2)
    tableNew.value[index][name] = num
    tableNew.value[index]['totalPricenew'] = newPrice
}
const orderId = ref('')
const getmealSmartOrderorderRefundDetail = async () => {
    const params = {
        refundOrderId: detailId.value,
        strategyName: 'pcRefundAuditInfoStrategy',
        orderId: orderId.value,
    }
    const res = await api.visualSettlementBase.post('/visual-settlement-base/order/orderRefund/detail', params)
    if (res.success) {
        detailInfo.value = res.data
        form.refundAmount = res.data.refundAmount
        orderId.value = res.data.orderId
        tableNew.value = res.data.refundDishList.map(v => {
            return {
                ...v,
                weightnew: 0,
                totalPricenew: 0,
            }
        })
    }
}
const onNosubmit = async () => {
    submitloading.value = true
    let data = {}
    data = {
        // ...form,
        organizationId: $storage.get('userInfo')?.organizationId,
        refundMethodType: 2,
        refundOrderId: detailId.value,
        // userId: $storage.get('userInfo')?.userId,
        strategyName: 'pcRefundInfoStrategy',
        orderId: orderId.value,
        // refundChannelType:form.refundChannelType,
        refundReasonReply: form.refundReasonReply,
    }
    const res = await api.visualSettlementBase.post('/visual-settlement-base/order/open/sign/confirmRefunds', data)
    if (res.success) {
        submitloading.value = false
        centerDialogVisible.value = false
        emits('freshData')
        $message.success('操作成功')
    } else {
        submitloading.value = false
    }
}
const doSubmitFun = async () => {
    let data = {}
    if (detailId.value) {
        if (+form.refundAmount > +detailInfo.value.remainingRefundAmount) {
            ElMessageBox.alert(
                `
                    <div>订单总金额：${detailInfo.value.totalPrice}</div>
                    <div>已退款：${detailInfo.value.refundedTotalAmount}</div>
                    <div>本次退款：${form.refundAmount}</div>
                    <br>
                    <div><strong>剩余可退款的金额为${detailInfo.value.remainingRefundAmount}，小于本次退款金额，退款失败</strong></div>
                    `,
                '退款失败',
                {
                    dangerouslyUseHTMLString: true,
                }
            )
        } else {
            if (form.refundAmount == 0) {
                $message.error('退款金额需大于0')
                return
            }
            submitloading.value = true
            data = {
                ...form,
                organizationId: $storage.get('userInfo')?.organizationId,
                refundMethodType: 2,
                refundOrderId: detailId.value,
                // userId: $storage.get('userInfo')?.userId,
                strategyName: 'auditRefund',
                orderId: orderId.value,
            }
            const res = await api.visualSettlementBase.post('/visual-settlement-base/order/open/sign/confirmRefunds', data)
            if (res.success) {
                submitloading.value = false
                centerDialogVisible.value = false
                emits('freshData')
                $message.success('操作成功')
            } else {
                submitloading.value = false
            }
        }
    }

    // console.log(data, "formdata");
    // return;
}
const validSubmit = () => {
    doSubmitFun()
}

const formRef = ref(null)
const onSubmit = () => {
    formRef.value.validate(valid => {
        if (valid) {
            validSubmit()
        } else {
        }
    })
}

const centerDialogVisible = ref(false)
const detailId = ref('')
const dialogRow = ref([])

const open = row => {
    detailId.value = row.dialogId
    orderId.value = row.orderId
    // dialogRow.value = row.dialogRow
    if (detailId.value) {
        form.refundChannelType = 1
        form.refundAmount = ''
        form.refundReasonReply = ''
        getmealSmartOrderorderRefundDetail()
    }
    centerDialogVisible.value = true
}
/* -------------------- expose -------------------- */
defineExpose({
    open,
})
</script>
<style lang="scss" scoped>
.check-box-wapper {
    margin-left: 40px;
    margin-bottom: 22px;
}
.submit-btn-wapper {
    text-align: right;
}
.deal-step-btn {
    width: 100%;
}
.deal-step-btn :deep(.el-input-number__decrease) {
    display: none;
}
.deal-step-btn :deep(.el-input-number__increase) {
    display: none;
}
.deal-step-btn :deep(.el-input > input) {
    text-align: left;
    padding-left: 15px;
    padding-right: 15px;
}
.mian-all {
    padding-left: 38px;
    margin-bottom: 10px;
    margin-top: -20px;
    .mian-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
    }
}
.table-new {
    width: 100%;
    // height: 100%;
    box-sizing: border-box;
    border-top: 1px solid #ddd;
    border-left: 1px solid #ddd;
    margin-bottom: 20px;
    .top-title {
        display: flex;
        .df-one {
            height: 40px;
            width: 33.333%;
            line-height: 40px;
            padding: 0 10px;
            background-color: #eee;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
        }
    }
    .top-bottom {
        display: flex;
        .df-one {
            height: 40px;
            width: 33.333%;
            line-height: 40px;
            padding: 0 10px;
            // background-color: #eee;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
        }
    }
}
.sd-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
}
.sd-md {
    color: #d9001b;
}
.sd-md-c {
    font-size: 16px;
    margin-bottom: 5px;
}
</style>
