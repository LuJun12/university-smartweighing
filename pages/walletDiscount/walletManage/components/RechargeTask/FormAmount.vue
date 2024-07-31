<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header"><span>充值金额</span></div>
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
import { ref, reactive } from 'vue'
import { verifyNumberIntegerAndFloat } from '@/tools/toolsValidate'

const props = defineProps({
    form: {},
})

const refMainForm = ref()
const mainForm = reactive({
    // 表单配置
    config: {
        // 标签后缀
        labelSuffix: '：',
        labelWidth: '110',
        empty: 'custom',
    },
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        amount: '0',
        allowanceAmount: '0',
    },
    rules: {
        // amount: {
        //     validator: (_rule, val, callback) => {
        //         if (!mainForm.model.amount && !mainForm.model.allowanceAmount) {
        //             return callback(new Error('成员钱包、补贴钱包充值金额不能同时为空'))
        //         }
        //         callback()
        //     },
        // },
        // allowanceAmount: {
        //     validator: (_rule, val, callback) => {
        //         if (!mainForm.model.amount && !mainForm.model.allowanceAmount) {
        //             return callback(new Error('成员钱包、补贴钱包充值金额不能同时为空'))
        //         }
        //         callback()
        //     },
        // },
    },
    items: [
        {
            label: '成员钱包',
            prop: 'amount',
            type: 'render',
            render: () => {
                return (
                    <div className="yq-flex">
                        <el-input
                            onInput={() => {
                                mainForm.model.amount = verifyNumberIntegerAndFloat(mainForm.model.amount)
                                refMainForm.value.validate()
                            }}
                            v-model={mainForm.model.amount}
                            placeholder="请输入充值金额"
                        ></el-input>
                        <span className="yq-ml-10">元</span>
                    </div>
                )
            },
        },
        {
            label: '补贴钱包',
            prop: 'allowanceAmount',
            type: 'render',
            render: () => {
                return (
                    <div className="yq-flex">
                        <el-input
                            onInput={() => {
                                mainForm.model.allowanceAmount = verifyNumberIntegerAndFloat(mainForm.model.allowanceAmount)
                                refMainForm.value.validate()
                            }}
                            v-model={mainForm.model.allowanceAmount}
                            placeholder="请输入充值金额"
                        ></el-input>
                        <span className="yq-ml-10">元</span>
                    </div>
                )
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
    mainForm.model.amount = form.amount || '0'
    mainForm.model.allowanceAmount = form.allowanceAmount || '0'
}

defineExpose({ validate, getForm, setForm })
</script>

<style lang="scss" scoped>
.box-card {
    margin-left: 20px;
    flex: 1;
    margin-bottom: 20px;
    :deep(.el-card__header) {
        padding: 10px;
    }
    :deep(.el-card__body) {
        padding: 10px;
    }
}
</style>
