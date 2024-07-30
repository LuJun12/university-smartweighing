<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header"><span>发放范围</span></div>
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
    <DialogTagChoose :selectedList="chooseTagState.selectedIdList" :list="chooseTagState.tagList" v-model="chooseTagState.show" @confirm="chooseTagState.onConfirm" />
    <DialogMemberTypeChoose :selectedList="memberTypeState.selectedIdList" :list="memberTypeState.tagList" v-model="memberTypeState.show" @confirm="memberTypeState.onConfirm" />
    <DialogPeopleCheck @success="peopleState.onSuccess" :tagList="chooseTagState.tagList" :row="peopleState.selectedList" v-model="peopleState.show" />
</template>

<script setup lang="jsx">
import api from '@smartweighing/api'
import { useChooseTag } from './common/index'
import { inject, reactive, ref } from 'vue'
import DialogTagChoose from './DialogTagChoose.vue'
import DialogMemberTypeChoose from './DialogMemberTypeChoose.vue'
import DialogPeopleCheck from './DialogPeopleCheck.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    form: {},
})

const $storage = inject('$storage')
const $elIcons = inject('$elIcons')
const organizationId = $storage.get('userInfo')?.organizationId || ''
const topOrganizationId = $storage.get('topInfo')?.topId || ''
const refMainForm = ref()

const mainForm = reactive({
    // 表单配置
    config: {
        // 标签后缀
        labelSuffix: '：',
        labelWidth: '110',
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

    model: {
        type: 1,
        organizationId: [organizationId],
    },
    rules: {
        type: { required: true, message: '请选择发放方式' },
        organizationId: { required: true, message: '请选择所属组织' },
    },
    // 表单项配置
    items: [
        {
            label: '发放方式',
            prop: 'type',
            type: 'render',
            render: () => {
                return (
                    <el-select v-model={mainForm.model.type}>
                        <el-option label="按条件" value={1}></el-option>
                        <el-option label="按指定人" value={2}></el-option>
                    </el-select>
                )
            },
        },
        {
            labelWidth: '30px',
            type: 'render',
            respond: item => {
                item.vIf = mainForm.model.type == '2'
            },
            render: () => {
                const PeopleTable = (
                    <el-table data={peopleState.selectedList} border style={{ width: '100%', height: 'calc(100vh - 660px)' }}>
                        <el-table-column prop="userName" min-width="25%" align="center" label="姓名"></el-table-column>
                        <el-table-column prop="userTypeName" min-width="25%" align="center" label="类型">
                            {{
                                default: scope => <span>{scope.row.userTypeName || '--'}</span>,
                            }}
                        </el-table-column>
                        <el-table-column prop="organizationName" min-width="25%" align="center" label="所属组织"></el-table-column>
                        <el-table-column align="center" min-width="25%" label="操作">
                            {{
                                default: scope => (
                                    <el-button link type="primary" size="small" onClick={() => peopleState.selectedList.splice(scope.$index, 1)}>
                                        删除
                                    </el-button>
                                ),
                            }}
                        </el-table-column>
                    </el-table>
                )
                return (
                    <div class="table-main" style={{ width: '100%' }}>
                        <el-button onClick={() => peopleState.open()} icon={$elIcons.Plus} type="primary" text style={{ transform: 'translateY(-10px)' }}>
                            配置
                        </el-button>
                        {PeopleTable}
                    </div>
                )
            },
        },
        {
            label: '所属组织',
            prop: 'organizationId',
            type: 'render',
            respond: item => {
                item.vIf = mainForm.model.type == '1'
            },
            render: () => {
                return (
                    <>
                        <el-tree-select
                            multiple
                            collapse-tags
                            max-collapse-tags={1}
                            props={{ label: 'companyName' }}
                            value-key="organizationId"
                            node-key="organizationId"
                            placeholder="请选择组织"
                            check-strictly
                            show-checkbox
                            v-model={mainForm.model.organizationId}
                            data={state.organizationList}
                        ></el-tree-select>
                    </>
                )
            },
        },
        {
            label: '相关标签',
            type: 'render',
            respond: item => {
                item.vIf = mainForm.model.type == '1'
            },
            render: () => {
                return (
                    <div>
                        <el-button onClick={() => chooseTagState.open()} link type="primary">
                            添加标签
                        </el-button>
                        <br />
                        {selectedTagList.value.map((tag, i) => {
                            return (
                                <el-tag onClose={() => chooseTagState.close(i)} class="yq-ml-1 yq-mr-1" effect="dark" closable>
                                    {tag.name}
                                </el-tag>
                            )
                        })}
                    </div>
                )
            },
        },
        {
            label: '成员类型',
            type: 'render',
            respond: item => {
                item.vIf = mainForm.model.type == '1'
            },
            render: () => {
                return (
                    <div>
                        <el-button onClick={() => memberTypeState.open()} link type="primary">
                            添加标签
                        </el-button>
                        <br />
                        {selectedMemberList.value.map((tag, i) => {
                            return (
                                <el-tag onClose={() => memberTypeState.close(i)} class="yq-ml-1 yq-mr-1" effect="dark" closable>
                                    {tag.personTypeName}
                                </el-tag>
                            )
                        })}
                    </div>
                )
            },
        },
    ],
})

/* ------------ 指定人选择 --------- */
const peopleState = reactive({
    open() {
        peopleState.show = true
    },
    show: false,
    onSuccess(val) {
        peopleState.selectedList = val.list
    },
    selectedList: [],
})

/* ------------ 相关标签 --------- */
const { state: chooseTagState, selectedList: selectedTagList } = useChooseTag()
const { state: memberTypeState, selectedList: selectedMemberList } = useChooseTag()

/* ------------------- 获取所属组织下拉树方法 ------------------- */
const state = reactive({
    organizationList: [],
})
const getOrgTreeList = async () => {
    const params = { orgId: organizationId }
    const res = await api.common.post('/openframe/organization/sysOrganization/getOrgTreeByOrgId', params)
    if (res.success) {
        state.organizationList = res.data
    }
}

/* ------------------- 获取成员标签 ------------------- */
const getTagList = async () => {
    const params = {
        pageNo: 1,
        pageSize: 100000,
        organizationId: topOrganizationId,
        currentOrganizationId: organizationId,
    }
    const res = await api.common.post('/label/sysOrganizationLabel/pageList', params)
    if (res.success) {
        chooseTagState.tagList = res.data.records
    }
}

/* ------------------- 获取成员类型 ------------------- */
const getMemberTypeList = async () => {
    const params = { disabledStatus: '1', organizationId: topOrganizationId }
    const res = await api.manage.post('/busi/company/person/getAppointPersonType', params)
    if (res.success) {
        memberTypeState.tagList = res.data
    }
}

const getForm = () => {
    return {
        ...mainForm.model,
        peopleList: peopleState.selectedList,
        tagList: selectedTagList.value,
        memberTypeList: selectedMemberList.value,
    }
}

const validate = async () => {
    const res = await refMainForm.value.validate()
    return res
}

const setForm = () => {
    const { form } = props
    mainForm.model.type = form.type
    if (form.type == 1) {
        const organizationList = form.scopeList.filter(row => row.applyOrganizationId).map(row => row.applyOrganizationId)
        mainForm.model.organizationId = organizationList
        const tagList = form.scopeList.filter(row => row.labelId).map(row => row.labelId)
        chooseTagState.selectedIdList = tagList
        const memberTypeList = form.scopeList.filter(row => row.userType).map(row => row.userType)
        memberTypeState.selectedIdList = memberTypeList
    }
    if (form.type == 2) {
        const scopeList = form.scopeList.map(v => {
            return { id: v.dinersId, userName: v.dinersName, userType: v.userType, userTypeName: v.userTypeName, organizationName: v.applyOrganizationName }
        })
        peopleState.selectedList = scopeList
    }
}

const init = async () => {
    await Promise.all([getMemberTypeList(), getTagList(), getOrgTreeList()])
}

defineExpose({ validate, getForm, setForm, init })
</script>

<style lang="scss" scoped>
.box-card {
    flex: 1;
    margin-bottom: 20px;
    :deep(.el-card__header) {
        padding: 10px;
    }
    :deep(.el-card__body) {
        padding: 10px 24px;
        height: calc(100% - 43px);
        overflow: auto;
    }
}
</style>
