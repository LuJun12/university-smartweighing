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
            <ElPlusForm ref="refMainForm" v-model="mainForm.model" :form-config="mainForm.config" :form-items="mainForm.items" :disabled="mainForm.config.loading">
                <template #_a1Slot>
                    <div class="yq-flex-row-align">
                        <el-input @input="e => mainForm.checkFun('a1',e)" class="yq-w-150-i" v-model="mainForm.model.a1">
                            <template #append>%</template>
                        </el-input>
                        <span class="yq-f-12 yq-ml-6">充值金额的0-100%，默认0%不赠送</span>
                    </div>
                </template>
                <template #_a2Slot>
                    <div class="yq-flex-row-align">
                        <el-input @input="e => mainForm.checkFun('a2',e)" class="yq-w-150-i" v-model="mainForm.model.a2">
                            <template #append>%</template>
                        </el-input>
                        <span class="yq-f-12 yq-ml-6">实付金额的0-100%，默认0%不使用赠送钱包</span>
                    </div>
                </template>
            </ElPlusForm>
        </div>
    </ElPlusDialog>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import api from '@smartweighing/api'
import { ref, reactive, inject, computed } from 'vue'
import { verifyNumberIntegerAndFloat } from '@/tools/toolsValidate'
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
        title: '充值赠送配置',
        width: '600px',
        topVh: 20,
        confirmButtonText: '确定',
    },
    submitting: false,
    loading: false,
    // 关闭后
    closed: () => {
        refMainForm.value.resetFields()
        mainDialog.submitting = false
    },
    open: async () => {
        mainDialog.loading = true
        const params = { organizationId: maxOrgId }
        const res = await api.common.post('/dinerswallet/userAllowanceWalletClearConfig/getConfig', params)
        mainDialog.loading = false
        if (res.success && res.data) {
            mainForm.model.clearStatus = res.data.clearStatus
        }
    },
    confirm: async () => {
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
        clearStatus: 2,
    },
    items: [
        {
            label: '赠送比例',
            type: 'slot',
            slotName:'_a1Slot',
            prop: 'a1',
        },
        {
            label: '赠送钱包扣款比例',
            type: 'slot',
            slotName:'_a2Slot',
            prop: 'a2',
        },
        {
            label: '退款后是否退回',
            type: 'el-switch',
            prop: 'a3',
            props:{
                activeText:'退回',
                inactiveText:'不退回',
            }
        },
    ],
    checkFun:(key,e)=> {
        mainForm.model[key] = verifyNumberIntegerAndFloat(e,100)
    }
})

</script>

<style lang="less" scoped></style>
