<template>
    <div v-loading="state.loading" class="yq-page-container">
        <div class="main-form">
            <div class="top-row">
                <FormBaseInfo :form="state.form" ref="refFormBaseInfo" />
            </div>
            <div class="two-col">
                <FormRange :form="state.form" ref="refFormRange" />
                <FormAmount :form="state.form" ref="refFormAmount" />
            </div>
        </div>
        <div class="foot-btn" size="small">
            <el-button @click="handleBack">取消并返回</el-button>
            <el-button @click="handleConfirm" type="primary">
                {{ state.type == 'edit' ? '确认编辑' : '确认创建' }}
            </el-button>
        </div>
    </div>
</template>

<script setup lang="jsx">
import api from '@smartweighing/api'
import { inject, onMounted, reactive, ref, nextTick } from 'vue'
import FormBaseInfo from './FormBaseInfo.vue'
import FormRange from './FormRange.vue'
import FormAmount from './FormAmount.vue'

const $fakeRouter = inject('$fakeRouter')
const $message = inject('$message')
const $storage = inject('$storage')

const organizationId = $storage.get('userInfo')?.organizationId || ''

const props = defineProps({
    id: {},
})

const emits = defineEmits(['success'])

const refFormBaseInfo = ref()
const refFormRange = ref()
const refFormAmount = ref()

const state = reactive({
    type: props.id ? 'edit' : 'add',
    loading: false,
    form: {},
})

// 点击取消并返回
const handleBack = async () => {
    if (await $message.confirm('确认取消并返回')) {
        $fakeRouter.back()
    }
}

// 额外的特殊需求校验
const validateFormsExtra = (form1, form2, form3) => {
    // 指定人发放时 指定人不能为空
    if (form2.item__1 == '2') {
        if (!form2.peopleList.length) {
            $message.error('请配置指定人')
            return false
        }
    }
    return true
}

// 根据表单获取接口的入参
const getProcessedParams = (form1, form2, form3) => {
    const params = { jobName: form1.jobName, cycle: form1.cycle, remarks: form1.remarks, type: form2.type, organizationId }
    // 除了任务周期为 单次 其他都需要选起止日期
    if (form1.cycle != 1) {
        params.beginDate = form1.dates[0]
        params.endDate = form1.dates[1]
    }
    // 任务周期 每周每月每年需要选执行日期
    if ([3, 4, 5].includes(form1.cycle)) {
        params.exeDate = form1.exeDate
    }
    // 按条件
    if (form2.type == 1) {
        const organizationList = form2.organizationId.map(id => ({ applyOrganizationId: id }))
        const tagList = form2.tagList.map(v => ({ labelId: v.id, labelName: v.name }))
        const memberTypeList = form2.memberTypeList.map(v => ({ userType: v.personTypeId }))
        params.scopeList = [...organizationList, ...tagList, ...memberTypeList]
    }
    // 指定人
    if (form2.type == 2) {
        const scopeList = form2.peopleList.map(v => {
            return { dinersId: v.id, dinersName: v.userName, userType: v.userType, applyOrganizationName: v.organizationName }
        })
        params.scopeList = scopeList
    }
    params.amount = form3.amount
    params.allowanceAmount = form3.allowanceAmount
    return params
}

// 提交
const handleConfirm = async () => {
    const valid1 = await refFormBaseInfo.value.validate()
    const valid2 = await refFormRange.value.validate()
    const valid3 = await refFormAmount.value.validate()
    const form1 = refFormBaseInfo.value.getForm()
    const form2 = refFormRange.value.getForm()
    const form3 = refFormAmount.value.getForm()
    const validExtra = validateFormsExtra(form1, form2, form3)
    if (!valid1 || !valid2 || !valid3 || !validExtra) return

    const params = getProcessedParams(form1, form2, form3)
    let apiPath = '/walletrecharge/walletRechargeJob/save'
    if (props.id) {
        apiPath = '/walletrecharge/walletRechargeJob/updateOne'
        params.id = props.id
    }
    state.loading = true
    const res = await api.common.post(apiPath, params)
    if (res.success) {
        emits('success')
        $message.success('创建成功')
        $fakeRouter.back()
    } else {
        state.loading = false
    }
}

onMounted(async () => {
    state.loading = true
    await refFormRange.value.init()
    if (props.id) {
        // 编辑回显
        const res = await api.common.post('/walletrecharge/walletRechargeJob/selectOne', { id: props.id })
        if (res.success) {
            state.form = res.data
            await nextTick()
            refFormBaseInfo.value.setForm()
            refFormRange.value.setForm()
            refFormAmount.value.setForm()
        }
    }
    state.loading = false
})
</script>

<style lang="scss" scoped>
.yq-page-container {
    background-color: transparent;
    padding: 0px;
    display: flex;
    flex-direction: column;
    .main-form {
        flex: 1;
        overflow: auto;
        display: flex;
        flex-direction: column;

        .two-col {
            flex: 1;
            display: flex;
            overflow: auto;
        }
    }

    .foot-btn {
        background-color: #fff;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
}
</style>
