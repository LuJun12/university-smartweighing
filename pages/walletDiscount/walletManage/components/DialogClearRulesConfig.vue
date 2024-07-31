<template>
    <ElPlusDialog
        v-model="mainDialog.visible"
        :title="mainDialog.config.title"
        :top-vh="mainDialog.config.topVh"
        :submitting="mainDialog.submitting"
        :loading="mainDialog.loading"
        :width="mainDialog.config.width"
        @open="mainDialog.open"
        @confirm="mainDialog.confirm"
        @closed="mainDialog.closed"
    >
        <div v-loading="mainDialog.loading">
            <div class="yq-mb-24 yq-fs-12">本规则仅对补贴钱包的金额进行控制，并且清空会反应在钱包流水中</div>
            <ElPlusForm ref="refMainForm" v-model="mainForm.model" :form-config="mainForm.config" :form-items="mainForm.items" :disabled="mainForm.config.loading"> </ElPlusForm>
            <div v-show="mainForm.model.clearStatus == '1'">
                <div class="yq-mb-12">清零时间规则：</div>
                <ElPlusForm
                    ref="refMainForm2"
                    v-model="mainForm2.model"
                    :form-config="mainForm2.config"
                    :form-items="mainForm2.items"
                    :form-rules="mainForm2.rules"
                    :disabled="mainForm2.config.loading"
                >
                </ElPlusForm>
            </div>
        </div>
    </ElPlusDialog>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import api from '@smartweighing/api'
import { ref, reactive, inject, computed } from 'vue'
/* ----------------- 实例化和注入 ------------------ */
const $message = inject('$message')
const $storage = inject('$storage')

/* ----------------- props 和 emits ---------------- */
const props = defineProps({
    // 【双向绑定】是否显示对话框
    modelValue: {
        type: Boolean,
        default: false,
    },
})
const emits = defineEmits(['update:modelValue', 'success'])

const maxOrgId = $storage.get('userInfo')?.maxOrgId || ''

/* ------------------ 对话框 ------------------ */
const mainDialog = reactive({
    // 是否显示对话框
    visible: computed({
        get() {
            return props.modelValue
        },
        set(val) {
            emits('update:modelValue', val)
        },
    }),
    // 对话框配置
    config: {
        title: '补贴清零规则配置',
        width: '500px',
        topVh: 20,
        confirmButtonText: '确定',
    },
    submitting: false,
    loading: false,
    // 关闭后
    closed: () => {
        refMainForm.value.resetFields()
        refMainForm2.value.resetFields()
        mainDialog.submitting = false
    },
    open: async () => {
        mainDialog.loading = true
        const params = { organizationId: maxOrgId }
        const res = await api.common.post('/dinerswallet/userAllowanceWalletClearConfig/getConfig', params)
        mainDialog.loading = false
        if (res.success && res.data) {
            mainForm.model.clearStatus = res.data.clearStatus
            mainForm2.model.cycle = res.data.cycle
            mainForm2.model.exeDate = res.data.exeDate
        }
    },
    confirm: async () => {
        const valid = await refMainForm.value.validate()
        const valid2 = await refMainForm2.value.validate()
        if (!valid || !valid2) return
        const params = {
            clearStatus: mainForm.model.clearStatus,
            organizationId: maxOrgId,
        }
        if (mainForm.model.clearStatus == 1) {
            params.cycle = mainForm2.model.cycle
            if (mainForm2.model.cycle != 2) {
                params.exeDate = mainForm2.model.exeDate
            }
        }
        mainDialog.submitting = true
        const res = await api.common.post('/dinerswallet/userAllowanceWalletClearConfig/updateConfig', params)
        if (res.success) {
            $message.success('配置成功')
            mainDialog.visible = false
        } else {
            mainDialog.submitting = false
        }
    },
})

/* ------------- 补贴清零开关 ----------- */
const refMainForm = ref()
const mainForm = reactive({
    config: {
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
    },
    model: {
        clearStatus: '2',
    },
    items: [
        {
            label: '补贴钱包自动清零',
            type: 'render',
            prop: 'clearStatus',
            render: () => {
                return (
                    <>
                        <el-switch inline-prompt size="large" active-value={1} inactive-value={2} active-text="自动清零" inactive-text="不清零" v-model={mainForm.model.clearStatus} />
                    </>
                )
            },
        },
    ],
})

/* ------------- 清零时间规则 ----------- */
const refMainForm2 = ref()
const mainForm2 = reactive({
    config: {
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
    },
    model: {
        cycle: 2,
        exeDate: '',
    },
    rules: {
        cycle: { required: true, message: '请选择清零周期' },
        exeDate: { required: true, message: '请选择清零日期' },
    },
    items: [
        {
            label: '清零周期',
            prop: 'cycle',
            type: 'render',
            render: () => {
                const options = [
                    { value: 2, label: '每日' },
                    { value: 3, label: '每周' },
                    { value: 4, label: '每月' },
                    { value: 5, label: '每年' },
                ]
                return (
                    <>
                        <el-select
                            onChange={() => {
                                mainForm2.model.exeDate = ''
                            }}
                            v-model={mainForm2.model.cycle}
                        >
                            {options.map(option => {
                                return <el-option label={option.label} value={option.value}></el-option>
                            })}
                        </el-select>
                        <span v-show={mainForm2.model.cycle == '2'} className="yq-ml-10">
                            早上01:00
                        </span>
                    </>
                )
            },
        },
        {
            label: '清零日期',
            type: 'render',
            prop: 'exeDate',
            respond: (item, data) => {
                item.vIf = mainForm2.model.cycle == 3
            },
            type: 'render',
            render: () => {
                const options = [
                    { label: '周一', value: '1' },
                    { label: '周二', value: '2' },
                    { label: '周三', value: '3' },
                    { label: '周四', value: '4' },
                    { label: '周五', value: '5' },
                    { label: '周六', value: '6' },
                    { label: '周日', value: '7' },
                ]
                return (
                    <>
                        <el-select v-model={mainForm2.model.exeDate}>
                            {options.map(option => {
                                return <el-option label={option.label} value={option.value}></el-option>
                            })}
                        </el-select>
                        <span className="yq-ml-10">早上01:00</span>
                    </>
                )
            },
        },
        {
            label: '清零日期',
            type: 'render',
            prop: 'exeDate',
            respond: (item, data) => {
                item.vIf = mainForm2.model.cycle == 4
            },
            type: 'render',
            render: () => {
                const options = []
                for (let i = 0; i < 31; i++) {
                    options.push({ label: `${i + 1}日`, value: `${i + 1}` })
                }
                return (
                    <>
                        <el-select v-model={mainForm2.model.exeDate}>
                            {options.map(option => {
                                return <el-option label={option.label} value={option.value}></el-option>
                            })}
                        </el-select>
                        <span className="yq-ml-10">早上01:00</span>
                    </>
                )
            },
        },
        {
            label: '清零日期',
            type: 'render',
            prop: 'exeDate',
            respond: (item, data) => {
                item.vIf = mainForm2.model.cycle == 5
            },
            render: () => {
                return (
                    <>
                        <el-date-picker placeholder="请选择" format="MM-DD" value-format="MM-DD" v-model={mainForm2.model.exeDate}></el-date-picker>
                        <span className="yq-ml-10">早上01:00</span>
                    </>
                )
            },
        },
    ],
})
</script>

<style lang="less" scoped></style>
