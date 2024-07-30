<template>
    <FakeRouterView :view-config="fakeRouterViewConfig">
        <div class="yq-page-container yq-flex-column">
            <div class="yq-page-search yq-mb-16 yq-rounded-4 yq-bg-white">
                <ElPlusForm
                    ref="searchConditionFormRef"
                    v-model="searchConditionForm.model"
                    :form-config="searchConditionForm.config"
                    :form-items="searchConditionForm.items"
                    :disabled="mainTable.config.loading"
                />
            </div>

            <div class="yq-flex-1 yq-p-16 yq-rounded-4 yq-bg-white">
                <ElPlusTable
                    :table-toolbar="mainTable.toolbar"
                    :table-data="mainTable.data"
                    :table-config="mainTable.config"
                    :table-columns="mainTable.columns"
                    :table-pagination="mainTable.pagination"
                >
                    <template #action="{ row }">
                        <template v-if="row.status">
                            <el-button
                                link
                                type="primary"
                                @click="topUp(row)"
                            >
                                充值
                            </el-button>
                            <el-button
                                link
                                type="primary"
                                @click="extract(row)"
                            >
                                提现
                            </el-button>
                            <el-button
                                link
                                type="primary"
                                @click="changeState(row)"
                            >
                                调整
                            </el-button>
                            <el-button
                                link
                                type="primary"
                                @click="showDetail(row)"
                            >
                                查看明细
                            </el-button>
                        </template>
                        <el-button
                            v-else
                            link
                            type="primary"
                            @click="topUp(row)"
                        >
                            首充激活
                        </el-button>
                    </template>
                </ElPlusTable>
            </div>
            <ElPlusFormDialog
                ref="walletDialogEl"
                v-model="walletDialog.visible"
                v-model:formModel="walletDialog.form"
                :dialog-config="walletDialog.dialogConfig"
                :form-rules="walletDialog.formRules"
                :form-config="walletDialog.formConfig"
                :form-items="walletDialog.formItems"
                :submitting="walletDialog.submitting"
                @closed="() => walletDialogEl?.resetFields()"
                @submit="walletDialog.submit"
            >
                <template #money>
                    <div class="yq-wp-100">
                        <el-input
                            v-model="walletDialog.form.money"
                            :placeholder="`请输入${walletDialog.formItems[1].label}`"
                            clearable
                            @input="moneyInput"
                        >
                            <template #suffix>
                                元
                            </template>
                        </el-input>
                        <div class="yq-flex yq-justify-between">
                            <span>钱包余额：{{ walletDialog.balance }}元</span>
                            <el-button
                                v-if="walletDialog.formType === 2"
                                link
                                type="primary"
                                :disabled="walletDialog.submitting"
                                @click="allIn"
                            >
                                全部提现
                            </el-button>
                        </div>
                    </div>
                </template>
            </ElPlusFormDialog>
        </div>
        <template #importData>
            <ImportData
                v-bind="fakeRouterViewConfig.importData.props"
                @success="mainTable.getData(1)"
            />
        </template>
        <DialogClearRulesConfig v-model="dialogClearRulesConfig.visible" />
    </FakeRouterView>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted, computed } from 'vue'
import ElPlusFormDialog from '@/components/ElPlusFormDialog.vue'
import api from '@smartweighing/api'
import FakeRouterView from '@/components/FakeRouterView.vue'
import ImportData from './ImportData.vue'
import DialogClearRulesConfig from './components/DialogClearRulesConfig.vue'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $store = inject('$store')
const $fakeRouter = inject('$fakeRouter')
const $routeState = inject('$routeState')
const $storage = inject('$storage')

/* ---------------- 伪命名视图配置 ----------------- */
const fakeRouterViewConfig = reactive({
    importData: {
        // 显隐方式
        hiddenType: 'vIf',
        // 视图属性
        props: {},
    },
})

const cardTypeList = [
    {
        label: '身份证',
        value: '1'
    },
    {
        label: '学工号',
        value: '2'
    },
    {
        label: '工号',
        value: '3'
    },
    {
        label: '护照',
        value: '4'
    },
]
/* ------------------- 查询条件 -------------------- */
const searchConditionFormRef = ref()
const searchConditionForm = reactive({
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        userName: '',
        organizationId: '',
        phoneNo: '',
        cardType: '',
        idCard: '',
        personTypeList: [],
        smartCard: ''
    },
    // 表单配置
    config: {
        // 横向表单
        inline: true,
        // 不换行
        nowrap: false,
        // 标签后缀
        labelSuffix: '：',
        // labelWidth: '70',
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
    },
    // 表单项配置
    items: [
        {
            label: '姓名',
            prop: 'userName',
        },
        {
            label: '手机号',
            prop: 'phoneNo',
        },
        {
            label: '编号',
            prop: 'idCard',
            type: 'render',
            render() {
                let placeholder = '请输入' + (cardTypeList.find(item=>item.value == searchConditionForm.model.cardType)?.label || '编号')
                return (
                    <>
                        <el-input v-model={searchConditionForm.model.idCard} placeholder={placeholder} maxLength={50}>
                            {{
                                prepend(){
                                    return (
                                        <el-select class='yq-w-100' clearable v-model={searchConditionForm.model.cardType}>
                                            {
                                                cardTypeList.map(item => (
                                                    <el-option
                                                        key={item.value}
                                                        label={item.label}
                                                        value={item.value}
                                                    />
                                                ))
                                            }
                                        </el-select>
                                    )
                                }
                            }}
                        </el-input>
                    </>
                )
            }
        },
        {
            label: '成员类型',
            prop: 'personTypeList',
            type: 'el-select',
            options: computed(()=> {
                return [...personTypeList.value]
            }),
            valueField:'id',
            labelField:'personTypeName',
            props: {
                multiple: true,
                collapseTags: true,
                collapseTagsTooltip: true
            }
        },
        {
            label: '卡号',
            prop: 'smartCard',
        },
        {
            // 类型为渲染函数
            type: 'render',
            render: () => (
                <>
                    <el-button type="primary" loading={mainTable.config.loading} icon={$elIcons.Search} onclick={() => mainTable.getData(1)}>
                        查询
                    </el-button>
                    <el-button onclick={searchConditionForm.reset}>重置</el-button>
                </>
            ),
        },
    ],
    // 重置
    reset: () => {
        searchConditionFormRef.value.resetFields()
        mainTable.pagination.page = 1
        mainTable.pagination.pageSize = 20
        searchConditionForm.model.cardType = ''
        mainTable.getData()
    },
})
const handleContent = e => {
    let companyName = e.companyName
    if(e.parentCompanyNames) companyName = e.parentCompanyNames.join('/')
    return '所属组织:'+companyName
}
/* --------------------- 表格 --------------------- */
const mainTable = reactive({
    // 工具栏
    toolbar: {
        title: '钱包信息',
        render: scope => {
            return <>
                <el-button type="primary" onClick={()=> {
                    dialogClearRulesConfig.open()
                }}>补贴清零规则配置</el-button>
                <el-button type="primary" onClick={()=> {
                    $fakeRouter.go('importData', '导入充值', {})
                }}>导入充值</el-button>
            </>
        },
    },
    // 表格数据
    data: [],
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
        empty: 'custom',
    },
    // 字段配置
    columns: [
        {
            label: '成员Id',
            prop: 'dinersId',
            minWidth: 120,
        },
        {
            label: '所属组织',
            prop: 'orgList',
            minWidth: 150,
            showOverflowTooltip:false,
            type: 'render',
            render({row}) {
                return(
                    <div>
                        {
                            row.orgList.map((item)=>{
                                return(
                                    <div>
                                        <el-popover placement="top" width="200" trigger="hover" content={handleContent(item)}>
                                            {{
                                                reference() {
                                                    return <span>{item.companyName}</span>
                                                }
                                            }}
                                        </el-popover>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
        },
        {
            label: '姓名',
            prop: 'userName',
            minWidth: 90,
        },
        {
            label: '成员类型',
            prop: 'personTypes',
            minWidth: 90,
        },
        {
            label: '手机号',
            prop: 'phoneNo',
            minWidth: 100,
            // 类型为脱敏内容
            type: 'mask',
            // 脱敏的规则（默认：xxx****xxxx）
            maskFormatter: 'xx***xx',
            // 脱敏的空白占位符
            maskEmpty: '--',
        },
        {
            label: '编号类型',
            prop: 'cardType',
            minWidth: 100,
            formatter(...args){
                return cardTypeList.find(item => item.value == args[2])?.label || '--'
            }
        },
        {
            label: '编号',
            prop: 'idCard',
            minWidth: 100,
            // 类型为脱敏内容
            type: 'mask',
            // 脱敏的规则（默认：xxx****xxxx）
            maskFormatter: 'xx***xx',
            // 脱敏的空白占位符
            maskEmpty: '--',
        },
        {
            label: '卡号',
            prop: 'smartCard',
            minWidth: 100,
        },
        {
            label: '钱包余额（元）',
            prop: 'amount',
            minWidth: 120,
        },
        {
            label: '补贴钱包余额（元）',
            prop: 'allowanceAmount',
            minWidth: 120,
        },
        {
            label: '操作',
            type: 'slot',
            width: 250,
            fixed: 'right',
            slotName: 'action',
        },
    ],
    // 分页器配置
    pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        sizeChange: val => {
            mainTable.pagination.pageSize = val
            mainTable.getData(1)
        },
        currentChange: val => {
            mainTable.pagination.page = val
            mainTable.getData()
        },
    },
    // 获取数据
    getData: async pageNumber => {
        if (pageNumber) {
            mainTable.pagination.page = pageNumber
        }
        mainTable.config.loading = true

        const res = await api.common.post('/userWallet/pageListV2',{
            ...searchConditionForm.model,
            page: mainTable.pagination.page,
            pageSize: mainTable.pagination.pageSize,
        })
        mainTable.config.loading = false
        if (res.success) {
            mainTable.data = res.data.records
            mainTable.pagination.total = Number(res.data.total)
        }
    },
})

const setDialogForm = (type, row) => {
    // 1 充值 2 提现 3 调整
    walletDialog.formType = type
    walletDialog.formItems[2].vIf = false
    walletDialog.formConfig.labelWidth = '90px'
    walletDialog.balance = row.amount
    walletDialog.form.walletId = row.id
    walletDialog.row = row
    switch (type) {
        case 1:
            walletDialog.formItems[1].label = '充值金额'
            walletDialog.dialogConfig.title = '钱包充值'
            break
        case 2:
            walletDialog.formItems[1].label = '提现金额'
            walletDialog.dialogConfig.title = '钱包提现'
            break
        case 3:
            walletDialog.formItems[1].label = '调整后余额'
            walletDialog.dialogConfig.title = '钱包余额调整'
            walletDialog.formItems[2].vIf = true
            walletDialog.formConfig.labelWidth = '110px'
            break
        default:
            break
    }
}

const topUp = row => {
    setDialogForm(1, row)
    walletDialog.visible = true
}
const extract = async row => {
    setDialogForm(2, row)
    walletDialog.visible = true
}
const changeState = async row => {
    setDialogForm(3, row)
    walletDialog.visible = true
}

const showDetail = row => {
    const { page, pageSize } = mainTable.pagination
    $routeState.go('walletManageWalletflow', { dinersId: row.dinersId, userName: row.userName }, { model: searchConditionForm.model, pagination: { page, pageSize } })
}

const allIn = () => {
    walletDialog.form.money = walletDialog.balance
    walletDialogEl.value?.clearValidate('money')
}

const walletTypeKeyMap = {
    1: 'amount',
    2: 'allowanceAmount',
}

const walletDialogEl = ref()
const walletDialog = reactive({
    visible: false,
    // 1 充值 2 提现 3 调整
    formType: 1,
    balance: '',
    row: null,
    form: {
        walletId: '',
        walletType: 1,
        money: '',
        remark: '',
    },
    dialogConfig: {
        title: '钱包充值',
        width: '400px',
        // 自适应窗口高度
        autoHeight: false,
        // 是否显示确认按钮
        showConfirmButton: true,
        showCancelButton: true,
    },
    formRules: {
        walletType: [
            {
                required: true,
                trigger: 'blur',
            },
        ],
        money: [
            {
                required: true,
                validator(rule, value, callback) {
                    if (!value) {
                        return callback(new Error('请填写金额'))
                    }
                    if (Number(value) > 99999) {
                        return callback(new Error('金额过大'))
                    }
                    if (!/^([1-9]\d{0,}|0)(\.\d{1,2})?$/.test(value)) {
                        return callback(new Error('金额格式不正确'))
                    }
                    callback()
                },
                trigger: 'blur',
            },
        ],
    },
    formConfig: {
        labelWidth: '80px',
        labelSuffix: ':',
        defaultProps: {
            'el-select': {
                style: 'width: 100%',
            },
        },
    },
    formItems: [
        {
            label: '账户类型',
            prop: 'walletType',
            type: 'el-select',
            options: [
                {
                    label: '食客钱包',
                    value: 1,
                },
                {
                    label: '补贴钱包',
                    value: 2,
                },
            ],
            events: {
                change(v) {
                    if (v == 1) {
                        walletDialog.balance = walletDialog.row.amount
                    } else if (v == 2) {
                        walletDialog.balance = walletDialog.row.allowanceAmount
                    }
                    if (walletDialog.formType == 2 && Number(walletDialog.form.money) > Number(walletDialog.balance)) {
                        walletDialog.form.money = walletDialog.balance
                    }
                },
            },
        },
        {
            label: '充值金额',
            type: 'slot',
            slotName: 'money',
            prop: 'money',
        },
        {
            label: '调整备注',
            prop: 'remark',
            vIf: false,
            props: {
                type: 'textarea',
                rows: 3,
                maxlength: 30,
                showWordLimit: true,
            },
        },
    ],
    submitting: false,
    async submit() {
        if (!(await walletDialogEl.value?.validate())) return
        walletDialog.submitting = true
        let params = {
            organizationId: $storage.get('userInfo')?.organizationId,
            walletType: walletDialog.form.walletType,
            walletId: walletDialog.form.walletId,
            flowPlatform: 1,
        }
        if ([1, 2].includes(walletDialog.formType)) {
            params[walletTypeKeyMap[walletDialog.form.walletType]] = walletDialog.form.money
        }
        let res = null
        switch (walletDialog.formType) {
            case 1:
                {
                    res = await api.common.post('/userWallet/recharge',params)
                }
                break
            case 2:
                {
                    res = await api.common.post('/userWallet/withdrawal',params)
                }
                break
            case 3:
                {
                    params.adjustmentAmount = walletDialog.form.money
                    params.remark = walletDialog.form.remark
                    res = await api.common.post('/userWallet/adjustment',params)
                }
                break

            default:
                break
        }
        walletDialog.submitting = false
        if (!res.success) return
        $message.success(res.msg)

        walletDialog.visible = false
        walletDialogEl.value.resetFields()
        mainTable.getData()
    },
})

const moneyInput = v => {
    let numStr = walletDialog.form.money
        .replace(/[^.\d]/g, '')
        .replace(/\.{2,}/g, '.')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.')
        .replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
    walletDialog.form.money = numStr
    if (walletDialog.formType === 2) {
        if (Number(v) > Number(walletDialog.balance)) {
            walletDialog.form.money = walletDialog.balance
        }
    }
}

/* ----------- 补贴清零规则配置 ----------- */
const dialogClearRulesConfig = reactive({
    visible: false,
    open() {
        dialogClearRulesConfig.visible = true
    }
})

// 成员类型
const personTypeList = ref([])
const getPersonTypeList = async () => {
    const topOrganizationId = $storage.get('topInfo')?.topId || ''
    const params = { disabledStatus: '1', organizationId: topOrganizationId }
    const res = await api.manage.post('/busi/company/person/getAppointPersonType', params)
    if (res.success) {
        personTypeList.value = res.data
    }
}
/* ------------------- 生命周期 -------------------- */
onMounted(() => {
    getPersonTypeList()
    const storeData = $routeState.get()?.data
    if (storeData) {
        Object.assign(searchConditionForm.model, storeData.model)
        Object.assign(mainTable.pagination, storeData.pagination)
    }
    searchConditionForm.model.organizationId = $storage.get('userInfo')?.organizationId
    // 查询表格数据
    mainTable.getData()
})
</script>

<style lang="less" scoped></style>
