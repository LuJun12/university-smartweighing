<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header"><span>基本信息</span></div>
        </template>
        <ElPlusForm
            ref="refMainForm"
            v-model="mainForm.model"
            :form-config="mainForm.config"
            :form-items="mainForm.items"
            :form-rules="mainForm.rules"
            :disabled="mainForm.config.loading"
        ></ElPlusForm>
    </el-card>
</template>

<script setup lang="jsx">
import { ref, reactive, onMounted } from 'vue'

const props = defineProps({
    form: {},
})

const refMainForm = ref()
const mainForm = reactive({
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        jobName: '',
        cycle: 1,
        exeDate: '',
        dates: [],
        remarks: '',
    },
    // 表单配置
    config: {
        // 横向表单
        inline: true,
        labelWidth: '110',
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
        defaultEvents: {},
        empty: 'custom',
    },
    rules: {
        jobName: { required: true, message: '请输入任务名称' },
        cycle: { required: true, message: '请选择任务周期' },
        exeDate: { required: true, message: '请选择执行日期' },
        dates: { required: true, message: '请选择起止日期' },
    },
    // 表单项配置
    items: [
        {
            label: '任务名称',
            prop: 'jobName',
            props: {
                maxlength: 10,
            },
        },
        {
            label: '任务周期',
            prop: 'cycle',
            type: 'el-select',
            options: [
                { label: '单次', value: 1 },
                { label: '每天', value: 2 },
                { label: '每周', value: 3 },
                { label: '每月', value: 4 },
                { label: '每年', value: 5 },
            ],
            props: {
                onChange: () => {
                    mainForm.model.exeDate = ''
                },
            },
        },
        {
            label: '执行日期',
            prop: 'exeDate',
            respond: (item, data) => {
                item.vIf = mainForm.model.cycle == 3
            },
            type: 'el-select',
            options: [
                { label: '周一', value: '1' },
                { label: '周二', value: '2' },
                { label: '周三', value: '3' },
                { label: '周四', value: '4' },
                { label: '周五', value: '5' },
                { label: '周六', value: '6' },
                { label: '周日', value: '7' },
            ],
        },
        {
            label: '执行日期',
            prop: 'exeDate',
            respond: (item, data) => {
                item.vIf = mainForm.model.cycle == 4
            },
            type: 'render',
            render: () => {
                const options = []
                for (let i = 0; i < 31; i++) {
                    options.push({ label: `${i + 1}日`, value: `${i + 1}` })
                }
                return (
                    <>
                        <el-select placeholder="请选择执行日期" style={{ width: '150px' }} v-model={mainForm.model.exeDate}>
                            {options.map(option => {
                                return <el-option label={option.label} value={option.value}></el-option>
                            })}
                        </el-select>
                    </>
                )
            },
        },
        {
            label: '执行日期',
            prop: 'exeDate',
            type: 'el-date-picker',
            props: {
                style: 'width: 250px',
                valueFormat: 'MM-DD',
                format: 'MM-DD',
            },
            respond: (item, data) => {
                item.vIf = data.cycle === 5 ? true : false
            },
        },
        {
            label: '起止日期',
            prop: 'dates',
            type: 'el-date-picker',
            respond: (item, data) => {
                item.vIf = mainForm.model.cycle !== 1
            },
            props: {
                type: 'daterange',
            },
        },
        {
            label: '任务说明',
            prop: 'remarks',
            props: {
                type: 'textarea',
                rows: 2,
                maxlength: 30,
                style: { width: '500px' },
            },
        },
    ],
})

const validate = async () => {
    const res = await refMainForm.value.validate()
    return res
}

const getForm = () => {
    return mainForm.model
}

const setForm = () => {
    const { form } = props
    mainForm.model.jobName = form.jobName
    mainForm.model.cycle = form.cycle
    mainForm.model.remarks = form.remarks
    if (form.cycle != 1) {
        mainForm.model.dates = [form.beginDate, form.endDate]
    }
    if ([3, 4, 5].includes(form.cycle)) {
        mainForm.model.exeDate = form.exeDate
    }
    mainForm.model.exeDate = form.exeDate
}

defineExpose({ validate, getForm, setForm })
</script>

<style lang="scss" scoped>
.box-card {
    margin-bottom: 20px;

    :deep(.el-card__header) {
        padding: 10px;
    }
    :deep(.el-card__body) {
        padding: 10px;
    }
}
</style>
