<template>
    <ElPlusFormDialog
        ref="elPlusFormDialogRef"
        v-model="mainFormDialog.visible"
        v-model:formModel="mainFormDialog.formModel"
        :dialog-config="mainFormDialog.dialogConfig"
        :form-rules="mainFormDialog.formRules"
        :form-config="mainFormDialog.formConfig"
        :form-items="mainFormDialog.formItems"
        :loading="mainFormDialog.loading"
        :submitting="mainFormDialog.submitting"
        @open="mainFormDialog.onOpen"
        @submit="mainFormDialog.submit"
        @closed="mainFormDialog.onClosed"
    />
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, computed, watch } from 'vue'
import ElPlusFormDialog from '@/components/ElPlusFormDialog.vue'
import api from '@common/api'
/* ----------------- 实例化和注入 ------------------ */
const $regular = inject('$regular')
const $message = inject('$message')
const $utils = inject('$utils')
const $storage = inject('$storage')
// const organizationId = $storage.get('userInfo')?.organizationId || ''
/* ----------------- props 和 emit ---------------- */
const props = defineProps({
    // 【双向绑定】是否显示对话框
    modelValue: {
        type: Boolean,
        default: false,
    },
    // 只读模式
    readonlyMode: {
        type: Boolean,
        default: false,
    },
    templateItem: {
        type: Object,
        default: ()=>{
            {}
        },
    },
    organizationId: {
        type: [String,Number],
        default: '',
    },
    id:{
        type: [String,Number],
        default: '', 
    }
})
// watch(
//     () => props.templateItem,
//     () => {
//         Object.keys(mainFormDialog.formModel).forEach(key => {
//             mainFormDialog.formModel[key] = props.templateItem?.[key]
//             if (key === 'unqualifiedImg') {
//                 mainFormDialog.formModel[key] = props.templateItem[key] ? props.templateItem[key].split(',').map(item => item) : []
//             }
//             console.log(mainFormDialog.formModel,'mainFormDialog.formModel.unqualifiedImg')
//             elPlusFormDialogRef.value.resetFields()
//         })
//     },
//     { deep: true }
// )
const emit = defineEmits(['update:modelValue', 'success'])
/* ------------------ 表单对话框 ------------------ */
// 编码验证
const departmentList = ref([])
const getDepartmentList = async () => {
    const params = {
        canteenId: props.organizationId,
        deviceTypeId:'1772886240627605511',
        page: 1,
        pageSize: 1000000,
    }
    const res = await api.common.post('/openframe/device/deviceCompanyRecord/getDeviceDetailList', params)
    if (res.success) {
        departmentList.value = res.data.map(v=>{
            return{
                label: v.deviceNo,
                value: v.deviceNo ,
            }
        })
        mainFormDialog.formItems[1].options = departmentList.value
    }
}
const mainFormDialogRef = ref()
const mainFormDialog = reactive({
    // 是否显示对话框
    visible: computed({
        get() {
            return props.modelValue
        },
        set(val) {
            emit('update:modelValue', val)
        },
    }),
    // 对话框配置
    dialogConfig: {
        title: '添加点位',
        width: '500px',
    },
    // 打开前
    onOpen: async () => {
        getDepartmentList()
        mainFormDialog.dialogConfig.title = props.id ? '添加点位' : '编辑点位'
        // 重置表单数据
        mainFormDialog.formModel = Object.assign({}, mainFormDialog.originalFormModel)
        Object.keys(mainFormDialog.formModel).forEach(key => {
            mainFormDialog.formModel[key] = props.templateItem?.[key]
            elPlusFormDialogRef.value.resetFields()
        })
        // if(mainFormDialog.formModel.departmentId){
        //     getResponsibilityPeopleList(mainFormDialog.formModel.departmentId)
        // }
        // console.log(mainFormDialog.formModel,'mainFormDialog.formModel.unqualifiedImg')
    },
    // 表单初始数据（用于重置表单）
    originalFormModel: {
        deviceNo: '',
        siteName: '',
    },
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    formModel: {},
    // 表单校验规则
    formRules: {
        deviceNo: [{ required: true, message: '请选择客流摄像头MAC地址', trigger: 'change' }],
        siteName: [{ required: true, message: '请输入点位名称', trigger: 'blur' }]
    },
    // 表单配置
    formConfig: {
        // 标签长度
        labelWidth: 180,
        // 标签后缀
        labelSuffix: '',
        // 为指定分类的表单项设置默认属性
        defaultProps: {
            'el-input': {
                maxlength: 50,
                clearable: true,
                modelModifiers: 'trim',
                style: 'width: 100%',
            },
            'el-select': {
                clearable: true,
                style: 'width: 100%',
            },
        },
    },
    // 表单项配置
    formItems: [
        {
            label: '点位名称：',
            prop: 'siteName',
            type: 'render',
            render: () => (
                <>
                    <el-input
                        v-model={mainFormDialog.formModel.siteName}
                        maxlength="30"
                        placeholder="请输入点位名称"
                    />
                </>
            ),
        },
        {
            label: '客流摄像头MAC地址：',
            prop: 'deviceNo',
            type: 'el-select',
            options: [],
            events: {
            },
        },
    ],
    // 获取数据
    loading: false,
    // 提交表单
    submitting: false,
    submit: async () => {
        if (await elPlusFormDialogRef.value.validate()) {
            mainFormDialog.submitting = true
            let res
            if(props.id){
                res = await api.common.post('/passenger/passengerDeviceSite/updateById', {
                    'deviceNo': mainFormDialog.formModel.deviceNo,
                    'id': props.id,
                    'siteName': mainFormDialog.formModel.siteName
                })
            }else{
                res = await api.common.post('/passenger/passengerDeviceSite/save', {
                    'deviceNo': mainFormDialog.formModel.deviceNo,
                    'organizationId': props.organizationId,
                    'siteName': mainFormDialog.formModel.siteName
                })
            }
            mainFormDialog.submitting = false
            if (res.success) {
                $message.success('操作成功')
                mainFormDialog.visible = false
                emit('success')
            }
        }
    },
    // 关闭后
    onClosed: () => {
        // 重置表单数据
        elPlusFormDialogRef.value.resetFields()
        // 清除树数据
    },
})

const elPlusFormDialogRef = ref(null)
</script>

<style lang="less" scoped></style>
