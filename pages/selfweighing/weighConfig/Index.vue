<template>
    <div class="yq-page-container">
        <!-- 订单配置 -->
        <el-card
            shadow="never"
            body-style="{ padding: '0px' }"
            style="margin-bottom: 16px"
        >
            <div class="title-box">
                <div class="title-desc">
                    收费模式及订单配置
                </div>
                <el-button
                    v-if="isEdit2"
                    type="primary"
                    @click="isEdit2 = false"
                >
                    修改
                </el-button>
                <div v-else>
                    <el-button @click="cancelFun(2)">
                        取消
                    </el-button>
                    <el-button
                        type="primary"
                        :loading="buttonLoadFlag2"
                        @click="saveFun2()"
                    >
                        保存
                    </el-button>
                </div>
            </div>
            <div>
                <el-radio-group
                    v-model="ruleForm.payType"
                    :disabled="isEdit2"
                    @change="changePayType"
                >
                    <el-radio-button
                        label="1"
                    >
                        称重收费
                    </el-radio-button>
                    <el-radio-button
                        label="2"
                    >
                        按订单收费
                    </el-radio-button>
                </el-radio-group>
            </div>
            <template v-if="ruleForm.payType === '1'">
                <div class="title-box-top">
                    1.订单结束规则
                </div>
                <div
                    class="title-box1"
                    style="margin: 20px 0"
                >
                    <span class="mr-10">若用餐人员创建订单后未取餐，则订单在</span>
                    <el-input
                        v-model="ruleForm.orderAutoCloseTime"
                        size="small"
                        class="w-70"
                        :disabled="isEdit2"
                        @input="onDishVerifyNumberIntegerAndFloat($event, 'orderAutoCloseTime')"
                    />
                    <span class="m-l mr-10">分钟后自动关闭</span>
                </div>
                <div
                    class="title-box1"
                    style="margin: 20px 0"
                >
                    <span class="mr-10">若用餐人员已取餐，则订单在最后一次取餐后</span>
                    <el-input
                        v-model="ruleForm.orderAutoSettleTime"
                        size="small"
                        class="w-70"
                        :disabled="isEdit2"
                        @input="onDishVerifyNumberIntegerAndFloat($event, 'orderAutoSettleTime')"
                    />
                    <span class="m-l mr-10">分钟后自动结算</span>
                </div>
            </template>
            <template v-else-if="ruleForm.payType === '2'">
                <div class="title-box-top">
                    1.订单结束规则
                </div>
                <div
                    class="title-box1"
                    style="margin: 20px 0"
                >
                    <span class="mr-10">当餐次订单不结束，餐次结束后订单自动结算</span>
                </div>

                <div class="title-box-top">
                    2.订单统一收费
                </div>
                <div
                    class="title-box1"
                    style="margin: 20px 0"
                >
                    <span class="mr-10">订单统一费用为</span>

                    <el-input
                        v-model="ruleForm.unifyPay"
                        size="small"
                        class="yq-w-100-i"
                        :disabled="isEdit2"
                        @input="formartPayMoney($event, 'unifyPay')"
                    >
                        <template #suffix>
                            <span class="color-3">元/单</span>
                        </template>
                    </el-input>
                </div>
            </template>
        </el-card>

        <!-- 设备功能配置 -->
        <el-card
            shadow="never"
            body-style="{ padding: '0px' }"
            style="margin: 16px 0"
        >
            <div class="title-box">
                <div class="title-desc">
                    设备功能配置
                </div>
                <el-button
                    v-if="isEdit3"
                    type="primary"
                    @click="isEdit3 = false"
                >
                    修改
                </el-button>
                <div v-else>
                    <el-button @click="cancelFun(3)">
                        取消
                    </el-button>
                    <el-button
                        type="primary"
                        :loading="buttonLoadFlag3"
                        @click="saveFun3()"
                    >
                        保存
                    </el-button>
                </div>
            </div>
            <div class="title-box-top">
                1.取餐机功能
            </div>
            <div
                class="title-box1"
                style="margin: 20px 0"
            >
                <span class="mr-10">本餐次结束后</span>
                <el-input
                    v-model="ruleForm.fpmAutoDishRemovalTime"
                    size="small"
                    class="w-70"
                    :disabled="isEdit3"
                    @input="onDishVerifyNumberIntegerAndFloat($event, 'fpmAutoDishRemovalTime')"
                />
                <span class="m-l mr-10">分钟后自动下架菜品</span>
            </div>
            <div
                class="title-box1"
                style="margin: 20px 0"
            >
                <span class="mr-10">管理员密码为</span>
                <el-input
                    v-model="ruleForm.fpmAdminPassword"
                    size="small"
                    class="w-150"
                    maxlength="6"
                    :disabled="isEdit3"
                    @input="onDishVerifyNumberIntegerAndFloatPass($event, 'fpmAdminPassword')"
                />
            </div>
            <div class="title-box-top">
                2.绑盘机功能
            </div>
            <div
                class="title-box1"
                style="margin: 20px 0"
            >
                <span class="mr-10">管理员密码为</span>
                <el-input
                    v-model="ruleForm.tpmAdminPassword"
                    size="small"
                    class="w-150"
                    maxlength="6"
                    :disabled="isEdit3"
                    @input="onDishVerifyNumberIntegerAndFloatPass($event, 'tpmAdminPassword')"
                />
            </div>
        </el-card>

        <!-- 餐次配置 -->
        <!-- <el-card
            shadow="never"
            body-style="{ padding: '0px' }"
            >
            <el-form
            ref="ruleFormRef"
            :inline-message="true"
            :hide-required-asterisk="true"
            :model="ruleForm"
            :rules="rules"
            label-width="80px"
            >
            <div class="title-box">
            <div class="title-desc">
            餐次配置
            </div>
            <el-button
            v-if="isEdit1"
            type="primary"
            @click="isEdit1 = false"
            >
            修改
            </el-button>
            <div v-else>
            <el-button @click="cancelFun(1)">
            取消
            </el-button>
            <el-button
            type="primary"
            :loading="buttonLoadFlag"
            @click="saveFun('ruleForm')"
            >
            保存
            </el-button>
            </div>
            </div>
            <div class="inline-box">
            <el-form-item
            v-if="hasBreakfast"
            label="早餐："
            prop="breakfastTime"
            >
            <el-time-picker
            v-model="ruleForm.breakfastTime"
            class="w-240"
            is-range
            :disabled="isEdit1"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            value-format="HH:mm"
            format="HH:mm"
            size="small"
            align="center"
            @change="breakfastChange"
            />
            </el-form-item>
            </div>
            <div class="inline-box">
            <el-form-item
            v-if="hasLunch"
            label="午餐："
            prop="lunchTime"
            >
            <el-time-picker
            v-model="ruleForm.lunchTime"
            class="w-240"
            is-range
            :disabled="isEdit1"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            value-format="HH:mm"
            format="HH:mm"
            size="small"
            align="center"
            @change="lunchChange"
            />
            </el-form-item>
            </div>
            <div class="inline-box">
            <el-form-item
            v-if="hasDinner"
            label="晚餐："
            prop="dinnerTime"
            >
            <el-time-picker
            v-model="ruleForm.dinnerTime"
            class="w-240"
            is-range
            :disabled="isEdit1"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            value-format="HH:mm"
            format="HH:mm"
            size="small"
            align="center"
            @change="dinnerChange"
            />
            </el-form-item>
            </div>
            <div class="inline-box">
            <el-form-item
            v-if="hasNightsnack"
            label="宵夜："
            prop="nightsnackTime"
            >
            <el-time-picker
            v-model="ruleForm.nightsnackTime"
            class="w-240"
            is-range
            :disabled="isEdit1"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            value-format="HH:mm"
            format="HH:mm"
            size="small"
            align="center"
            @change="nightsnackChange"
            />
            </el-form-item>
            </div>
            </el-form>
            </el-card>-->
    </div>
</template>

<script setup>
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, watch, computed, onMounted } from 'vue'
import { verifiyNumberInteger, verifiyNumberNumber, verifyNumberIntegerAndFloat } from '@/tools/toolsValidate'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $message = inject('$message')
const $storage = inject('$storage')

/* ----------------- props 和 emit ---------------- */
const props = defineProps({})

/* ------------------ 变量和方法 ------------------ */

const ruleForm = reactive({
    nightsnackTime: null,
    nightWindowStart: null,
    nightWindowEnd: null,
    dinnerTime: null,
    dinnerWindowStart: null,
    dinnerWindowEnd: null,
    lunchTime: null,
    lunchWindowStart: null,
    lunchWindowEnd: null,
    breakfastTime: null,
    breakfastWindowStart: null,
    breakfastWindowEnd: null,
    autoDistributeWindow: false,
    smartAutoDistributeWindow: false,
    addMealBreakfastTime: false,
    addMealLunchTime: false,
    addMealDinnerTime: false,
    addMealNightsnackTime: false,
    breakfastMealPlus: 1, // 早餐加餐
    lunchMealPlus: 1, // 午餐加餐
    dinnerMealPlus: 1, // 晚餐加餐
    nightMealPlus: 1, // 夜宵加餐
    fpmAdminPassword: '',
    fpmAutoDishRemovalTime: '',
    orderAutoCloseTime: '',
    orderAutoSettleTime: '',
    tpmAdminPassword: '',
    payType: '1', // 1：称重收费 2：按订单收费
    unifyPay: '', // 按订单收费统一费用
})

const rules = reactive({
    breakfastTime: [
        {
            required: true,
            message: '请输入早餐时间',
            trigger: 'blur',
        },
    ],
    lunchTime: [
        {
            required: true,
            message: '请输入午餐时间',
            trigger: 'blur',
        },
    ],
    dinnerTime: [
        {
            required: true,
            message: '请输入晚餐时间',
            trigger: 'blur',
        },
    ],
    nightsnackTime: [
        {
            required: true,
            message: '请输入宵夜时间',
            trigger: 'blur',
        },
    ],
})

const buttonLoadFlag = ref(false)
const buttonLoadFlag1 = ref(false)
const buttonLoadFlag2 = ref(false)
const buttonLoadFlag3 = ref(false)
const isEdit1 = ref(true)
const isEdit2 = ref(true)
const isEdit3 = ref(true)
const hasBreakfast = ref(false) //当前食堂和校区有没有开通早餐
const hasLunch = ref(false) //当前食堂和校区有没有开通午餐
const hasDinner = ref(false) //当前食堂和校区有没有开通晚餐
const hasNightsnack = ref(false) //当前食堂和校区有没有开通宵夜

const onDishVerifyNumberIntegerAndFloat = (val, name) => {
    let num = verifiyNumberInteger(val)
    if (num > 999999) {
        num = 999999
    }
    if (num === '') {
        num = ''
    } else if (num === '0') {
        num = 1
    }
    ruleForm[name] = num
}

const onDishVerifyNumberIntegerAndFloatPass = (val, name) => {
    let num = verifiyNumberNumber(val, 999999)
    if (num === '') {
        num = ''
    } else if (num === '0') {
        num = 0
    }
    ruleForm[name] = num
}

const cancelFun = type => {
    if (type == 1) {
        isEdit1.value = true
    }
    if (type == 2) {
        isEdit2.value = true
    }
    if (type == 3) {
        isEdit3.value = true
    }
    getSetting()
}
const changePayType = (type) => {
    console.log(type)
}
const formartPayMoney = (val, key) => {
    let num = verifyNumberIntegerAndFloat(val, 9999)
    ruleForm[key] = num
}
const saveFun2 = () => {
    buttonLoadFlag2.value = false
    saveupdataInfo(2, () => {
        isEdit2.value = true
        buttonLoadFlag2.value = false
    })
}

const saveFun3 = () => {
    buttonLoadFlag3.value = false
    saveupdataInfo(2, () => {
        isEdit3.value = true
        buttonLoadFlag3.value = false
    })
}

const compareDate = (d1, d2) => {
    const sDate = d1.split(':')
    const eDate = d2.split(':')
    const d1One = Number(sDate[0])
    const d2One = Number(eDate[0])
    const d1Second = Number(sDate[1])
    const d2Second = Number(eDate[1])
    console.log('d1One', d1One)
    console.log('d2One', d2One)
    console.log('d1Second', d1Second)
    console.log('d2Second', d2Second)
    if (d1One < d2One) {
        return true
    } else if (d1One === d2One && d1Second < d2Second) {
        return true
    } else {
        return false
    }
}
const ruleFormRef = ref(null)
const saveFun = formName => {
    ruleFormRef.value.validate(valid => {
        if (valid) {
            let params = {}
            //根据当前餐次的开启 传递相应参数
            if (hasBreakfast.value) {
                params.breakfastStartTime = ruleForm.breakfastTime[0]
                params.breakfastEndTime = ruleForm.breakfastTime[1]
            }
            if (hasLunch.value) {
                params.lunchStartTime = ruleForm.lunchTime[0]
                params.lunchEndTime = ruleForm.lunchTime[1]
                if (hasBreakfast.value && compareDate(params.lunchStartTime, params.breakfastEndTime)) {
                    $message.warning('午餐时间必须在早餐之后配置')
                    return false
                }
            }
            if (hasDinner.value) {
                params.dinnerStartTime = ruleForm.dinnerTime[0]
                params.dinnerEndTime = ruleForm.dinnerTime[1]
                if (hasLunch.value && compareDate(params.dinnerStartTime, params.lunchEndTime)) {
                    $message.warning('晚餐时间必须在午餐之后配置')
                    return false
                }
                if (hasBreakfast.value && compareDate(params.dinnerStartTime, params.breakfastEndTime)) {
                    $message.warning('晚餐时间必须在早餐之后配置')
                    return false
                }
            }
            if (hasNightsnack.value) {
                params.supperStartTime = ruleForm.nightsnackTime[0]
                params.supperEndTime = ruleForm.nightsnackTime[1]
                if (hasDinner.value && compareDate(params.supperStartTime, params.dinnerEndTime)) {
                    $message.warning('夜宵时间必须在晚餐之后配置')
                    return false
                }
                if (hasLunch.value && compareDate(params.supperStartTime, params.lunchEndTime)) {
                    $message.warning('夜宵时间必须在午餐之后配置')
                    return false
                }
                if (hasBreakfast.value && compareDate(params.supperStartTime, params.breakfastEndTime)) {
                    $message.warning('夜宵时间必须在早餐之后配置')
                    return false
                }
            }

            params.breakfastMealPlus = ruleForm.breakfastMealPlus ? 1 : 2
            params.lunchMealPlus = ruleForm.lunchMealPlus ? 1 : 2
            params.dinnerMealPlus = ruleForm.dinnerMealPlus ? 1 : 2
            params.nightMealPlus = ruleForm.nightMealPlus ? 1 : 2
            console.log('params', params)
            // return
            buttonLoadFlag.value = true
            updataInfo(params, () => {
                isEdit1.value = true
                buttonLoadFlag.value = false
            })
        }
    })
}

const getSetting = () => {
    getInfo()
}
const getInfo = async () => {
    const res = await api.smartWeighing.post('/canteen/mealSmartBizConfig/getByCanteenId', {
        organizationId: $storage.get('userInfo')?.organizationId,
    })
    if (res.success) {
        const result = res.data
        hasBreakfast.value = result.ccConfigList.some(item => item.id == 1 && item.disabled == 1) && result.canteenRgcc.indexOf('1') >= 0
        hasLunch.value = result.ccConfigList.some(item => item.id == 2 && item.disabled == 1) && result.canteenRgcc.indexOf('2') >= 0
        hasDinner.value = result.ccConfigList.some(item => item.id == 3 && item.disabled == 1) && result.canteenRgcc.indexOf('3') >= 0
        hasNightsnack.value = result.ccConfigList.some(item => item.id == 4 && item.disabled == 1) && result.canteenRgcc.indexOf('4') >= 0
        ruleForm.breakfastTime = [result.breakfastStartTime, result.breakfastEndTime]
        ruleForm.lunchTime = [result.lunchStartTime, result.lunchEndTime]
        ruleForm.dinnerTime = [result.dinnerStartTime, result.dinnerEndTime]
        ruleForm.nightsnackTime = [result.supperStartTime, result.supperEndTime]
        ruleForm.autoDistributeWindow = result.autoDistributeWindow == 1 ? true : false
        ruleForm.smartAutoDistributeWindow = result.smartAutoDistributeWindow == 1 ? true : false
        ruleForm.breakfastMealPlus = result.breakfastMealPlus === 1
        ruleForm.lunchMealPlus = result.lunchMealPlus === 1
        ruleForm.dinnerMealPlus = result.dinnerMealPlus === 1
        ruleForm.nightMealPlus = result.nightMealPlus === 1
        ruleForm.fpmAdminPassword = result.fpmAdminPassword
        ruleForm.fpmAutoDishRemovalTime = result.fpmAutoDishRemovalTime
        ruleForm.orderAutoCloseTime = result.orderAutoCloseTime
        ruleForm.orderAutoSettleTime = result.orderAutoSettleTime
        ruleForm.tpmAdminPassword = result.tpmAdminPassword
    }
}

const saveupdataInfo = async (params, callback) => {
    if (params === 3 && (!ruleForm.fpmAdminPassword || ruleForm.fpmAdminPassword.length !== 6)) {
        $message.error('请输入6位数字密码')
        return false
    }
    if (params === 3 && (!ruleForm.tpmAdminPassword || ruleForm.tpmAdminPassword.length !== 6)) {
        $message.error('请输入6位数字密码')
        return false
    }
    const res = await api.smartWeighing.post('/canteen/mealSmartBizConfig/update', {
        organizationId: $storage.get('userInfo')?.organizationId,
        fpmAdminPassword: ruleForm.fpmAdminPassword,
        fpmAutoDishRemovalTime: ruleForm.fpmAutoDishRemovalTime,
        orderAutoCloseTime: ruleForm.orderAutoCloseTime,
        orderAutoSettleTime: ruleForm.orderAutoSettleTime,
        tpmAdminPassword: ruleForm.tpmAdminPassword,
    })
    if (res.success) {
        getSetting()
        $message.success('修改成功')
        callback && callback()
    } else {
        buttonLoadFlag.value = false
        buttonLoadFlag1.value = false
    }
}

const updataInfo = async (params, callback) => {
    const res = api.smartWeighing.post('/canteen/mealSmartBizConfig/update', {
        organizationId: $storage.get('userInfo')?.organizationId,
        ...params,
    })
    if (res.success) {
        getSetting()
        $message.success('修改成功')
        callback && callback()
    } else {
        buttonLoadFlag.value = false
        buttonLoadFlag1.value = false
    }
}

const breakfastChange = e => {
    if (!e) {
        ruleForm.breakfastWindowStart = ''
        ruleForm.breakfastWindowEnd = ''
    } else {
        if (!checkAuditTime(ruleForm.breakfastWindowStart, e[0], e[1])) {
            ruleForm.breakfastWindowStart = e[0]
        }
        if (!checkAuditTime(ruleForm.breakfastWindowEnd, e[0], e[1])) {
            ruleForm.breakfastWindowEnd = e[1]
        }
    }
}
const lunchChange = e => {
    if (!e) {
        ruleForm.lunchWindowStart = ''
        ruleForm.lunchWindowEnd = ''
    } else {
        if (!checkAuditTime(ruleForm.lunchWindowStart, e[0], e[1])) {
            ruleForm.lunchWindowStart = e[0]
        }
        if (!checkAuditTime(ruleForm.lunchWindowEnd, e[0], e[1])) {
            ruleForm.lunchWindowEnd = e[1]
        }
    }
}
const dinnerChange = e => {
    if (!e) {
        ruleForm.dinnerWindowStart = ''
        ruleForm.dinnerWindowEnd = ''
    } else {
        if (!checkAuditTime(ruleForm.dinnerWindowStart, e[0], e[1])) {
            ruleForm.dinnerWindowStart = e[0]
        }
        if (!checkAuditTime(ruleForm.dinnerWindowEnd, e[0], e[1])) {
            ruleForm.dinnerWindowEnd = e[1]
        }
    }
}
const nightsnackChange = e => {
    if (!e) {
        ruleForm.nightWindowStart = ''
        ruleForm.nightWindowEnd = ''
    } else {
        if (!checkAuditTime(ruleForm.nightWindowStart, e[0], e[1])) {
            ruleForm.nightWindowStart = e[0]
        }
        if (!checkAuditTime(ruleForm.nightWindowEnd, e[0], e[1])) {
            ruleForm.nightWindowEnd = e[1]
        }
    }
}
const checkAuditTime = (checkTime, beginTime, endTime) => {
    var nowDate = new Date()
    var checkDate = new Date(nowDate)
    var beginDate = new Date(nowDate)
    var endDate = new Date(nowDate)
    var checkIndex = checkTime.lastIndexOf(':')
    var checkHour = checkTime.substring(0, checkIndex)
    var checkMinue = checkTime.substring(checkIndex + 1, checkTime.length)
    checkDate.setHours(checkHour, checkMinue, 0, 0)
    var beginIndex = beginTime.lastIndexOf(':')
    var beginHour = beginTime.substring(0, beginIndex)
    var beginMinue = beginTime.substring(beginIndex + 1, beginTime.length)
    beginDate.setHours(beginHour, beginMinue, 0, 0)
    var endIndex = endTime.lastIndexOf(':')
    var endHour = endTime.substring(0, endIndex)
    var endMinue = endTime.substring(endIndex + 1, endTime.length)
    endDate.setHours(endHour, endMinue, 0, 0)
    return checkDate.getTime() - beginDate.getTime() >= 0 && checkDate.getTime() <= endDate.getTime()
}

/* ------------------- computed ------------------- */

/* --------------------- watch -------------------- */

/* -------------------- 初始化 -------------------- */

/* ------------------- 生命周期 ------------------- */
onMounted(() => {
    getSetting()
})
</script>

<style lang="less" scoped>
.title-box {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-desc {
        font-size: 16px;
        font-weight: 600;
    }
}
.title-box-top {
    font-size: 14px;
    margin-top: 10px;
}

.title-box1 {
    display: flex;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    .mr-10 {
        margin-right: 10px;
    }
    .ml-10 {
        margin-left: 10px;
    }
}
.inline-box {
    display: flex;
    align-items: center;
}

.input-item {
    margin: 10px;
    .input-item-label {
        display: inline-block;
        width: 140px;
    }
    .desc {
        margin: 0 6px;
    }

    label {
        font-size: 14px;
        font-weight: 400;
        color: #333333;
    }
}

.w-240 {
    width: 240px;
}
.w-150 {
    width: 150px;
}

.w-90 {
    width: 90px;
}

.w-70 {
    width: 70px;
}

.w-38 {
    width: 38px;
}
:deep(.el-form-item) {
    margin-bottom: 0px;
}
.dish {
    font-weight: 700;
    font-size: 18px;
}
.m-r {
    margin-right: 30px;
}
.m-l {
    margin-left: 10px;
}
.color {
    &-D9001B {
        color: #d9001b;
    }
    &-3{
        color: #333333;
    }
}
</style>
