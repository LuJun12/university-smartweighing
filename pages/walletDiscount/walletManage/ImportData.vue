<template>
    <div
        v-loading="loading"
        class="yq-page-container yq-page-container--no-padding yq-flex-column"
    >
        <CardPanel
            class="yq-flex-1 yq-flex-column yq-pb-10-i"
            size="small"
        >
            <div
                class="yq-flex-row-space-between yq-pb-10-i"
                style="border-bottom: 1px solid #eee"
            >
                <div
                    class="left"
                    style="font-weight: 600"
                >
                    导入充值
                </div>
                <div class="right">
                    <el-button
                        type="primary"
                        @click="exportFun"
                    >
                        成员导出
                    </el-button>
                </div>
            </div>
            <div class="yq-flex-row yq-flex-jc-sb yq-flex-1">
                <div
                    class="yq-flex-1 yq-flex-column yq-overflow-auto"
                    style="border-right: 1px dashed"
                >
                    <div
                        style="font-weight: 600"
                        class="yq-pt-10-i"
                    >
                        导入数据
                    </div>
                    <div class="yq-wp-99 yq-hp-100 yq-relative yq-mt-10 yq-flex-1 yq-mr-10">
                        <Luckysheet
                            ref="luckysheetEl"
                            class="yq-wp-100 yq-hp-100"
                            @update-cell-one="mainForm.update"
                        />
                    </div>
                </div>
                <div class="yq-w-400 yq-flex-column-i yq-pl-10-i yq-pr-10-i yq-overflow-auto">
                    <div class="yq-flex-row yq-flex-jc-sb-i yq-mb-10 yq-pt-10-i">
                        <div
                            class
                            style="font-weight: 600"
                        >
                            问题
                        </div>
                    </div>
                    <div class="yq-flex-1">
                        <ElPlusTable
                            :table-toolbar="mainTable.toolbar"
                            :table-data="mainTable.data"
                            :table-config="mainTable.config"
                            :table-columns="mainTable.columns"
                        />
                    </div>
                </div>
            </div>
        </CardPanel>
        <CardPanel
            v-if="!props.readonly"
            class="yq-flex-row-end yq-flex-ai-c-i yq-flex-none"
            size="small"
        >
            <el-button
                :disabled="mainForm.submitting || props.readonly"
                @click="mainForm.back"
            >
                取消
            </el-button>
            <el-button
                type="primary"
                :loading="mainForm.submitting"
                :disabled="props.readonly"
                @click="mainForm.submit"
            >
                确认导入
            </el-button>
        </CardPanel>
    </div>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, watch, onMounted, nextTick, computed } from 'vue'
import Luckysheet from './components/Luckysheet.vue'
import ElPlusTable from '@/components/ElPlusTable.vue'

import { deepCopy } from '@/tools/toolsValidate'
import { computeNumber } from '@common/tools/selfTool'
import api from '@common/api'
/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $regular = inject('$regular')
const $message = inject('$message')
const $utils = inject('$utils')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')
const $eventBus = inject('$eventBus')
const organizationId = $storage.get('userInfo')?.maxOrgId || $storage.get('userInfo')?.organizationId

/* ----------------- props 和 emit ---------------- */
const props = defineProps({
    readonly: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(['success'])

/* --------------------- 表单 --------------------- */
const loading = ref(false)

const mainFormRef = ref()
const mainForm = reactive({
    // 表单初始数据（用于重置表单）
    originalModel: {},
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {},
    // 表单校验规则
    rules: {},
    // 表单配置
    config: {
        // 行内表单
        inRow: true,
        // labelPosition: 'left',
        // 每个表单项占据的列数
        defaultColSpan: 10,
        // 标签长度
        labelWidth: 100,
        // 标签后缀
        labelSuffix: '',
        emptyText: '--',
        // 为指定类型的表单项设置默认属性
        defaultProps: {
            'el-input': {
                maxlength: 50,
                modelModifiers: 'trim',
                style: 'width: 200px',
            },
            'el-select': { style: 'width: 200px' },
        },
    },
    // 表单项配置
    items: [],
    // 根据是否只读模式初始化表单项配置
    // 获取数据
    loading: false,
    // 提交表单
    submitting: false,
    submit: async () => {
        const { tableList, errorList } = luckysheetEl.value.checkTable()
        mainTable.data = errorList
        if (errorList.length !== 0 || tableList.length === 0) {
            $message.error('填写的数据有误或未填写数据')
            return
        }
        mainForm.submitting = true
        const res = await api.common.post('/sysUserWallet/importAmount', tableList)
        mainForm.submitting = false

        if (res.success) {
            $message.success(res.msg)
            $fakeRouter.back()
            emit('success')
            luckysheetEl.value?.destroy()
        } else {
            mainTable.data = res.data.map(v => {
                return {
                    indexSel: v.seq,
                    error: v.msg,
                }
            })
        }
    },
    back: () => {
        $fakeRouter.back()
        luckysheetEl.value?.destroy()
    },
    update: async () => {
        const { tableList, errorList } = luckysheetEl.value.checkTable()
        mainTable.data = errorList
        if (errorList.length !== 0 || tableList.length === 0) {
            $message.error('填写的数据有误或未填写数据')
            return
        }
        mainForm.submitting = true
        const res = await api.common.post('/sysUserWallet/checkImportAmount', tableList, {}, null, false)
        mainForm.submitting = false

        if (res.success) {
            if (res.data && res.data.length) {
                mainTable.data = res.data.map(v => {
                    return {
                        indexSel: v.seq,
                        error: v.msg,
                    }
                })
            } else {
                mainTable.data = []
                $message.success('填写的数据完整请提交')
            }
        }
    },
    //  图片的上
})

/* --------------------- 表格 --------------------- */
const mainTable = reactive({
    // 表格数据
    data: [],
    order: {},
    // 表格配置
    config: {
        // 正在加载
        loading: false,
        // 高度
        maxHeight: '100%',
        // 斑马纹
        stripe: true,
        // 边框
        border: true,
        // 为所有表格列设置默认属性
        defaultProps: {
            // 居中
            align: 'center',
            // 当内容过长被隐藏时显示 tooltip
            showOverflowTooltip: true,
            // 默认格式化器
            formatter: (row, column, cellValue) => {
                if (!cellValue && cellValue !== 0) {
                    return '--'
                }
                return cellValue
            },
        },
    },
    // 字段配置
    columns: [
        {
            label: '序号',
            prop: 'indexSel',
            width: 60,
        },
        {
            label: '问题',
            prop: 'error',
            minWidth: 120,
        },
    ],
})

const luckysheetEl = ref()

//导出
const exportFun = async e => {
    const res = await api.common.post('/excel/queueTask/exportExcel', {
        organizationId: $storage.get('userInfo')?.organizationId,
        templateEnumName: 'USER_WALLET_AMOUNT_EXPORT',
        param: JSON.stringify({
            organizationId: $storage.get('userInfo')?.organizationId,
        }),
        remark: '',
        type: 0,
        title: '导入充值',
    })
    if (!res.success) return
    $eventBus.emit('updateExportNum',1)
    let targetEl = document.getElementsByClassName('export-task-badge')[0]
    $utils.flyToAnimation(e.target, targetEl)
}

/* --------------------- watch -------------------- */
watch(
    () => props.planetId,
    newValue => {
        // 重置表单数据
        mainForm.model = Object.assign({}, mainForm.originalModel)
        mainFormRef.value?.resetFields()
        if (newValue) {
            // 获取表单数据
            // mainForm.getData()
        }
    },
    {
        immediate: true,
    }
)

onMounted(async () => {
    loading.value = true
    mainTable.config.loading = true
    // 重置表单数据

    // 根据是否只读模式初始化表单项配置
    mainTable.config.loading = false
    loading.value = false
})
</script>

<style lang="less" scoped>
.dish-rule {
    width: 100%;
    min-height: 100px;
    border: 1px solid;
    border-radius: 10px;
    margin-top: 10px;
}

.red {
    color: red;
    font-weight: 300 !important;
    font-size: 14px;
}

.dish-rule-no {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    span {
        font-weight: 600;
        font-size: 20px;
        display: inline-block;
    }
}

.dish-rule-con {
    display: flex;
    flex-direction: column;
    padding: 10px;

    .dish-rule-con-top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .dish-rule-con-top-title {
            font-weight: 600;
            font-size: 18px;
        }
    }

    .dish-rule-con-btm {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        font-size: 14px;

        .dish-rule-item + .dish-rule-item {
            margin-top: 5px;
        }

        .item-label {
            color: #333;
            font-weight: 600;
        }

        .item-value {
            color: #666;
        }
    }
}
</style>
