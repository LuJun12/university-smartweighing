<template>
    <ElPlusDialog
        ref="mainFormDialogRef"
        v-model="mainFormDialog.visible"
        v-bind="mainFormDialog.dialogConfig"
        :loading="mainFormDialog.loading"
        :submitting="mainFormDialog.submitting"
        @open="mainFormDialog.onOpen"
        @confirm="mainFormDialog.submit"
        @closed="mainFormDialog.onClosed"
    >
        <el-row :gutter="20">
            <el-col :span="17">
                <div class="slottitle">可选择成员</div>
                <div class="stock-table-content">
                    <div class="stock-table-search yq-bg-white yq-rounded-4">
                        <ElPlusForm
                            ref="searchConditionFormRef"
                            v-model="searchConditionForm.model"
                            :form-config="searchConditionForm.config"
                            :form-items="searchConditionForm.items"
                            :disabled="false"
                        />
                    </div>
                    <div class="stock-table-list yq-bg-white yq-rounded-4 yq-mt-16">
                        <ElPlusTable
                            ref="foodTableRef"
                            :table-toolbar="mainTable.toolbar"
                            :table-data="mainTable.data"
                            :table-config="mainTable.config"
                            :table-columns="mainTable.columns"
                            :table-pagination="mainTable.pagination"
                        />
                    </div>
                </div>
            </el-col>
            <el-col :span="7">
                <div class="slottitle">
                    已选择成员
                    <span v-if="dinersStatistic" class="selct">（{{ dinersStatistic }}）</span>
                </div>
                <div class="main-table">
                    <div v-for="(item, index) in dinersStatisticList" :key="index" class="main-one">
                        <div class="main-left">{{ item.userName }}（{{ item.organizationName }}）</div>
                        <el-icon class="yq-cursor-pointer" :size="16" @click="delItem(index, item)">
                            <el-icon-close />
                        </el-icon>
                    </div>
                </div>
            </el-col>
        </el-row>
    </ElPlusDialog>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, computed, nextTick } from 'vue'
import ElPlusDialog from '@/components/ElPlusDialog.vue'
import api from '@smartweighing/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $regular = inject('$regular')
const $message = inject('$message')
const $utils = inject('$utils')
const $storage = inject('$storage')

const $elIcons = inject('$elIcons')

const $store = inject('$store')
const $fakeRouter = inject('$fakeRouter')

/* ----------------- props 和 emit ---------------- */
const props = defineProps({
    // 【双向绑定】是否显示对话框
    modelValue: {
        type: Boolean,
        default: false,
    },
    //
    row: {
        type: [String, Number, Array],
        default: () => {
            return []
        },
    },
    // 只读模式
    readonlyMode: {
        type: Boolean,
        default: false,
    },
    tagList: {
        type: Array,
        default: () => [],
    },
})
const emit = defineEmits(['update:modelValue', 'success'])

const topOrganizationId = $storage.get('topInfo')?.topId || ''

const dinersStatisticList = ref([])
const delItem = (index, row) => {
    dinersStatisticList.value.forEach((n, index) => {
        if (n.id === row.id) {
            dinersStatisticList.value.splice(index, 1)
        }
    })
    // 操作“已选列表”删除按钮（index为删除行的索引值，row为删除行的数据对象）
    /*  第一步：获取 需要删除“查询列表”某个数据的索引值（根据es6的findIndex查找id来获取） */
    const indexs = mainTable.data.findIndex(value => value.id === row.id)
    // 第二步：使用 toggleRowSelection（需要切换状态行的数据，false/true） false为取消选中，true为选中
    if (indexs == -1) {
        nextTick(() => {
            foodTableRef.value.tableRef.toggleRowSelection(row, false)
        })
    } else {
        // 第二步：使用 toggleRowSelection（需要切换状态行的数据，false/true） false为取消选中，true为选中
        nextTick(() => {
            foodTableRef.value.tableRef.toggleRowSelection(mainTable.data[indexs], false)
        })
    }
}
const removeDuplicateObj = arr => {
    let obj = {}
    arr = arr.reduce((newArr, next) => {
        obj[next.id] ? '' : (obj[next.id] = true && newArr.push(next))
        return newArr
    }, [])
    return arr
}

const dinersStatistic = computed(() => {
    const typeMap = dinersStatisticList.value.reduce((acc, cur) => {
        const key = cur.userTypeName || '未知类型'
        if (!Object.hasOwn(acc, key)) {
            acc[key] = 0
        }
        acc[key] += 1
        return acc
    }, {})
    return Object.keys(typeMap)
        .map(key => `${key}${typeMap[key]}`)
        .join('，')
})

/* ------------------ 表单对话框 ------------------ */
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
        title: '添加成员',
        width: '1400px',
        topVh: 5,
    },
    // 打开前
    onOpen: async () => {
        await mainTable.getOrganizationList()
    },
    // 表单初始数据（用于重置表单）
    originalFormModel: {},
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    formModel: {},
    selectRow: [],

    // 获取数据
    loading: false,
    // 提交表单
    submitting: false,
    submit: async () => {
        // 选中的权限
        mainFormDialog.submitting = true
        mainFormDialog.submitting = false
        $message.success('操作成功')
        mainFormDialog.visible = false
        emit('success', {
            list: dinersStatisticList.value,
        })
    },
    // 关闭后
    onClosed: () => {
        searchConditionFormRef.value.resetFields()
        mainTable.pagination.page = 1
        mainTable.pagination.pageSize = 10
    },
})

/* --------------------- 表单 --------------------- */
const searchConditionFormRef = ref(null)

const searchConditionForm = reactive({
    // 表单数据（参数可以不赘述，'v-model' 会自动产生值）
    model: {
        userName: '',
        searchOrganizationId: '',
        userType: '',
        labelIdList: [],
    },
    // 表单配置
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
        // 为指定类型的表单项设置默认事件
        defaultEvents: {
            // 'el-input': { change: () => mainTable.getData(1) },
        },
    },
    // 表单项配置
    items: [
        {
            label: '姓名',
            prop: 'userName',
            props: {
                width: '150px',
            },
        },
        {
            label: '组织',
            prop: 'searchOrganizationId',
            type: 'render',
            render: () => (
                <>
                    <el-tree-select
                        props={{ label: 'companyName' }}
                        value-key="organizationId"
                        node-key="organizationId"
                        placeholder="请选择组织"
                        check-strictly
                        show-checkbox
                        clearable
                        render-after-expand={false}
                        v-model={searchConditionForm.model.searchOrganizationId}
                        data={orgTree.value}
                    ></el-tree-select>
                </>
            ),
        },
        {
            label: '类型',
            prop: 'userType',
            type: 'el-select',
            valueField: 'id',
            labelField: 'personTypeName',
            options: computed(() => personTypeList.value),
            props: {
                style: { width: '130px' },
                clearable: true,
            },
        },
        {
            label: '标签',
            prop: 'labelIdList',
            type: 'el-select',
            valueField: 'id',
            labelField: 'name',
            options: computed(() => props.tagList),
            props: {
                style: { width: '130px' },
                clearable: true,
                multiple: true,
                collapseTags: true,
                maxCollapseTags: 1,
            },
        },
        {
            // 类型为渲染函数
            type: 'render',
            render: () => (
                <>
                    <el-button
                        type="primary"
                        loading={false}
                        icon={$elIcons.Search}
                        onclick={() => {
                            mainTable.getData(1)
                        }}
                    >
                        查询
                    </el-button>
                </>
            ),
        },
    ],
    // 重置
    reset: () => {
        searchConditionFormRef.value.resetFields()
        mainTable.pagination.page = 1
        mainTable.pagination.pageSize = 10
        mainTable.getData()
    },
})

const query = ref(false)

const foodTableRef = ref()

const beforeSelect = ref([])
// 商品管理table
const mainTable = reactive({
    // 表格顶部操作
    // 表格数据
    data: [],
    selectData: [],
    // 表格配置
    config: {
        // 正在加载
        loading: false,
        // 高度
        maxHeight: '400px',
        // 斑马纹
        stripe: true,
        // 边框
        border: true,
        rowKey: 'id',
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
        selectionChange(val, row) {
            // 判断是全选还是查询
            if (query.value) {
                dinersStatisticList.value = removeDuplicateObj([...dinersStatisticList.value, ...val])
                beforeSelect.value = val
            } else {
                //  判断全选和全不全
                val.forEach((m, i) => {
                    if (!m) {
                        val.splice(i, 1)
                    }
                })
                const ids = []
                if (dinersStatisticList.value.length > 0) {
                    if (val.length > beforeSelect.value.length) {
                        const selcetForObjArr = val.filter(item => !beforeSelect.value.some(ele => ele.id === item.id))
                        dinersStatisticList.value.forEach(m => {
                            ids.push(m.id)
                        })
                        val.forEach(n => {
                            if (ids.indexOf(n.id) === -1) {
                                dinersStatisticList.value.push(n)
                            }
                        })
                    } else {
                        const selcetForObjArr = beforeSelect.value.filter(item => !val.some(ele => ele.id === item.id)).map(v => v.id)
                        for (let i = dinersStatisticList.value.length - 1; i >= 0; i -= 1) {
                            const idx = selcetForObjArr.findIndex(item => item === dinersStatisticList.value[i].id)
                            if (idx !== -1) {
                                dinersStatisticList.value.splice(i, 1)
                            }
                        }
                    }
                    beforeSelect.value = val
                } else {
                    dinersStatisticList.value = val
                    beforeSelect.value = val
                }
            }

            // mainTable.selectData = selection
            // dinersStatisticList.value = removeDuplicateObj([...mainTable.selectData,...dinersStatisticList.value])
            // dinersStatisticList.value = mainTable.selectData
        },
        selectAll() {
            query.value = false
        },
        select(all, val) {
            query.value = false
            const selected = all.length && all.indexOf(val) !== -1
            if (!selected) {
                console.log(dinersStatisticList.value)
                dinersStatisticList.value.forEach((m, index) => {
                    if (m.id === val.id) {
                        dinersStatisticList.value.splice(index, 1)
                    }
                })
            }
        },
    },
    // 字段配置
    columns: [
        {
            label: '',
            type: 'selection',
            reserveSelection: true,
        },
        {
            label: '姓名',
            prop: 'userName',
            minWidth: 120,
        },
        {
            label: '类型',
            prop: 'userTypeName',
            minWidth: 120,
        },
        {
            label: '标签',
            prop: 'labelIdList',
            minWidth: 120,
            formatter(...args){
                return args[2]?.length ? args[2].map(item => item.labelName).join() : '--'
            }
        },
        {
            label: '所属组织',
            prop: 'organizationName',
            minWidth: 120,
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
    getData: async (pageNumber, type) => {
        if (pageNumber) {
            mainTable.pagination.page = pageNumber
        }

        mainTable.config.loading = true

        const res = await api.common.post('/canteen/sysUserDiners/pageListNew', {
            ...searchConditionForm.model,
            pageNo: mainTable.pagination.page,
            pageSize: mainTable.pagination.pageSize,
            organizationId: $storage.get('userInfo')?.organizationId,
        })

        mainTable.config.loading = false

        if (res.success) {
            mainTable.data = res.data.records

            mainTable.pagination.total = Number(res.data.total)
            if (type) {
                query.value = true
                console.log(props.row, 'props.row')
                // dinersStatistic.value = res.data.statisticVo.dinersStatistic
                dinersStatisticList.value = [...props.row]
            }
            const arr = dinersStatisticList.value
            if (arr.length > 0) {
                // const idAll = this.schemlTable.forEach((value) => value.id);
                for (let i = 0; i < arr.length; i += 1) {
                    /*  第一步：获取 需要删除“查询列表”某个数据的索引值（根据es6的findIndex查找id来获取） */
                    const indexs = mainTable.data.findIndex(value => value.id === arr[i].id)
                    if (indexs > -1) {
                        // 第二步：使用 toggleRowSelection（需要切换状态行的数据，false/true） false为取消选中，true为选中
                        nextTick(() => {
                            foodTableRef.value.tableRef.toggleRowSelection(mainTable.data[indexs], true)
                        })
                    }
                }
                nextTick(() => {
                    query.value = false
                })
            }
        }
    },
    getOrganizationList: async () => {
        const res = await api.common.post('/openframe/organization/sysOrganization/getOrgTreeByOrgId', {
            orgId: $storage.get('userInfo')?.organizationId,
        })
        if (res.success && res.data) {
            orgTree.value = res.data
        }
        mainTable.getData(1, true)
    },
})
const orgTree = ref([])
//获取成员类型
const personTypeList = ref([])
/* ------------------- 获取成员类型 ------------------- */
const getPersonTypeList = async () => {
    const params = { disabledStatus: '1', organizationId: topOrganizationId }
    const res = await api.manage.post('/busi/company/person/getAppointPersonType', params)
    if (res.success) {
        personTypeList.value = res.data
    }
}
getPersonTypeList()
</script>

<style lang="less" scoped>
.slottitle {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;

    .selct {
        font-size: 12px;
        font-weight: 0;
    }
}

.main-table {
    max-height: 460px;
    overflow-y: auto;
}

.main-one {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
}
</style>
