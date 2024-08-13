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
            <ElPlusForm ref="refMainForm" v-model="mainForm.model" :form-config="mainForm.config" :form-items="mainForm.items" :disabled="mainForm.config.loading"></ElPlusForm>
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
        title: '余额结余导出',
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
        getOrgTree()
        getPersonTypeList()
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
         // 横向表单
         inline: true,
        // 不换行
        nowrap: true,
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
        a1:$storage.get('userInfo')?.maxOrgId,
        a2:''
    },
    items: [
    {
            label: '所属组织',
            prop: 'a1',
            type: 'render',
            render: () => (
                <>
                    <el-cascader
                        class="yq-wp-100"
                        props={{ label: 'companyName',value:'organizationId',checkStrictly: true,emitPath:false }}
                        placeholder="请选择组织"
                        showAllLevels={false}
                        filterable={true}
                        v-model={mainForm.model.a1}
                        options={orgTree.value}
                    ></el-cascader>
                </>
            )
        },
        {
            label: '成员类型',
            type: 'el-select',
            prop:'a2',
            options:computed(() => personTypeList.value),
            labelField:'personTypeName',
            valueField:'id',
        },
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
