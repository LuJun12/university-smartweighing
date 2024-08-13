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
            <ElPlusForm ref="refMainForm" v-model="mainForm.model" :form-config="mainForm.config" :form-items="mainForm.items" :form-rules="mainForm.rules" :disabled="mainForm.config.loading"></ElPlusForm>
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
    name:{
        type: String,
    }
})
const emits = defineEmits(['update:modelValue', 'success'])


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
        title: '钱包有效期',
        width: '400px',
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
        mainForm.model.name = props.name
        getOrgTree()
        getPersonTypeList()
    },
    confirm: async () => {
        if(await refMainForm.value.validate()) {
            console.log("验证成功")
            return
            mainDialog.submitting = true
            const res = await api.common.post('/dinerswallet/userAllowanceWalletClearConfig/updateConfig', {})
            if (res.success) {
                $message.success('配置成功')
                mainDialog.visible = false
            } else {
                mainDialog.submitting = false
            }
        }
    },
})

/* ------------- 补贴清零开关 ----------- */
const refMainForm = ref()
const mainForm = reactive({
    config: {
         // 横向表单
         inline: false,
        // 不换行
        nowrap: true,
        labelWidth: '110px',
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
    rules: {
        limitTime: { required: true, message: '请选择期限' },
    },
    model: {
        name:'',
        type:'1',
        limitTime:[]
    },
    items: [
        {
            label: '姓名',
            type: 'text',
            prop:'name',
        },
        {
            label: '钱包有效期限',
            type: 'el-select',
            prop:'type',
            options:[
                {label: '长期', value: '1'},
                {label: '短期', value: '2'},
            ],
            props:{
                style: 'width:100%'
            }
        },
        {
            label: '期限',
            prop: 'limitTime',
            type: 'el-date-picker',
            vIf:() => mainForm.model.type === '2',
            props: {
                type: 'daterange',
            },
        }
    ]
})
/* ------------------- 方法和变量 ------------------- */
//获取组织
const orgTree = ref([])
const getOrgTree = async () => {
    mainDialog.loading = true
    const res = await api.common.post('/openframe/organization/sysOrganization/getOrgTreeByOrgId', {
        orgId: $storage.get('userInfo')?.organizationId,
    })
    mainDialog.loading = false
    if (res.success && res.data) {
        orgTree.value = res.data
    }
}
//获取成员类型
const personTypeList = ref([])
const getPersonTypeList = async () => {
    const params = { disabledStatus: '1', organizationId: $storage.get('userInfo')?.maxOrgId }
    const res = await api.manage.post('/busi/company/person/getAppointPersonType', params)
    if (res.success) {
        personTypeList.value = [{personTypeName:'全部',id:''}].concat(res.data)
    }
}

</script>

<style lang="less" scoped></style>
