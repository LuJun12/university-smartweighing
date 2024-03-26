<template>
    <div class="yq-page-container yq-page-container--no-padding yq-flex-row-align basicInformation-page">
        <div v-loading="orgTree.loading" class="part-left">
            <el-tree
                ref="orgTreeRef"
                class="tree-wrapper"
                :data="orgTree.data"
                default-expand-all
                highlight-current
                node-key="id"
                :props="{
                    label: 'companyName',
                    children: 'children',
                }"
                :current-node-key="orgTree.currentNodeKey"
                :indent="0"
                :expand-on-click-node="false"
                @node-click="orgTree.onCheckChange"
            >
                <template #default="{ node, data }">
                    <span class="custom-tree-node">
                        <span class="yq-flex-row-align">
                            <el-tag class="ml-2 yq-pl-6-i yq-pr-6-i" :type="getCompanyTypeNameColor(data.companyType)">{{ getCompanyTypeName(data.companyType) }}</el-tag>
                        </span>
                        <el-tooltip effect="dark" :show-after="500" :content="node.label" placement="top-start">
                            <span :style="getFontStyle(data.companyType)" class="yq-wl yq-text-ellipsis">{{ node.label }}</span>
                        </el-tooltip>
                    </span>
                </template>
            </el-tree>
        </div>

        <div ref="partRightRef" class="part-right yq-flex-1 yq-ml-16 yq-hp-100 yq-bg-white yq-flex-column">
            <div class="yq-flex-row-align yq-pl-16 yq-pr-16 yq-pt-16 yq-flex-row-space-between">
                <div class="left yq-flex-row-align">
                    最大可容纳就餐人数：{{maximumDiningCapacity}}人
                    <el-link class="yq-ml-16" :underline="false" @click="maxiDialog.visible = true" type="warning">修改</el-link>
                </div>
                <div class="right">
                    <el-button type="primary" @click="addDig()">添加点位</el-button>
                </div>
            </div>
            <div class="yq-flex-1 yq-p-16 yq-rounded-4 yq-bg-white">
                <ElPlusTable
                    :table-toolbar="mainTable.toolbar"
                    :table-data="mainTable.data"
                    :table-config="mainTable.config"
                    :table-columns="mainTable.columns"
                    :table-pagination="mainTable.pagination"
                />
            </div>
        </div>
        <InspectUnqualifiedDescriptionDialog v-model="confrimDialog.visible" @success="confrimDialog.success" />
        <maximumDiningCapacityDialog v-model="maxiDialog.visible" @success="mainTable.editMaximumDiningCapacity" />
    </div>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted, watch, nextTick, shallowRef, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InspectUnqualifiedDescriptionDialog from './components/InspectUnqualifiedDescriptionDialog.vue'
import maximumDiningCapacityDialog from './components/maximumDiningCapacityDialog.vue'
import api from '@common/api'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $storage = inject('$storage')
const $utils = inject('$utils')

const confrimDialog = reactive({
    // 是否显示
    visible: false,
    // 订单拒绝
    success: () => {
        mainTable.getData()
        // detailForm.getOrderDetailInfo()
        // $fakeRouter.back()
    },
})

const maxiDialog = reactive({
    // 是否显示
    visible: false,
})
const addDig = ()=>{
    confrimDialog.visible = true
} 

// const componentsPools = shallowRef({
//     'school': School,
//     'campus': Campus,
//     'canteen': Canteen,
// })
// const companyTypeEnum = {
//     10: 'school',
//     20: 'school',
//     30: 'school',
//     2: 'school',
//     11: 'campus',
//     21: 'campus',
//     3: 'campus',
//     6: 'canteen',
// }

const curOrgId = ref('')
const currentComponent = shallowRef(null)
const partRightRef = ref()

const propInfo = reactive({
    companyType: '',
    id: '',
    canteenId: '',
})

// 获取除集团外的第一个有效组织
const findVaildOrg = list => {
    if (!list.length) return null
    if (list[0].companyType === 1) {
        return findVaildOrg(list[0]?.children || [])
    } else {
        return list[0]
    }
}

// 剔除档口一级数据
const processTreeData = list => {
    if (!Array.isArray(list)) return []
    let rest = []
    for (let i = 0; i < list.length; i++) {
        if (list[i].companyType !== 8) {
            if (list[i].children) {
                list[i].children = processTreeData(list[i].children)
            }
            rest.push(list[i])
        }
    }
    return rest
}

// 组织树相关
const orgTreeRef = ref(null)
const orgTree = reactive({
    loading: false,
    data: [],
    checkedId: '',
    currentNodeKey: '',
    getData: async (targetId) => {
        orgTree.loading = true
        const res = await api.common.post('/openframe/organization/sysOrganization/getOrgTreeByOrgId', {
            orgId: curOrgId.value,
        })
        if (res.success && Array.isArray(res.data)) {
            const list = processTreeData(res.data)
            $utils.forEachTree(
                list,
                item => {
                    item.id = item.organizationId
                    item.disabled = (item.companyType== 6||item.enterpriseType== 24400)?false:true
                },
                'children'
            )
            orgTree.data = list

            if (targetId) {
                await nextTick()
                orgTreeRef.value.setCurrentKey(targetId)
                orgTree.checkedId = targetId
                orgTree.currentNodeKey = targetId
            } else {
                // const checked = findVaildOrg(list)
                // console.log('checked--->', checked)
                // if (checked) {
                const findTree = $utils.findTree(orgTree.data, item => item.companyType== 6||item.enterpriseType== 24400, 'children')
                console.log(findTree,'findTree')
                await nextTick()
                orgTreeRef.value.setCurrentKey(findTree.id)
                orgTree.checkedId = findTree.id
                orgTree.currentNodeKey = findTree.id
                propInfo.id = findTree.parentId
                propInfo.canteenId = findTree.id
                propInfo.companyType = findTree.companyType
                mainTable.getData()
                mainTable.getCanteenById()
                // }
            }
        }
        orgTree.loading = false
    },
    onCheckChange: async (data, node) => {
        // console.log('node--->', node)
        const { companyType } = data
        if (companyType !== 6) {
            propInfo.id = data.parentId
            propInfo.canteenId = data.id
            node.isCurrent = false
            orgTree.currentNodeKey = ''
            await nextTick()
            orgTree.currentNodeKey = orgTree.checkedId
            return
        } else {
            propInfo.id = data.parentId
            propInfo.canteenId = data.id
            propInfo.companyType = data.companyType
            orgTree.checkedId = data.id
            mainTable.getData()
            mainTable.getCanteenById()
            partRightRef.value.scrollTo(0, 0)
        }
        // propInfo.companyType = data.companyType
        // orgTree.checkedId = data.id

        // if (companyTypeEnum[companyType]) {
        //     currentComponent.value = componentsPools.value[companyTypeEnum[companyType]]
        // }
    },
})


/* --------------------- 表格 --------------------- */
const maximumDiningCapacity = ref(0)

const mainTable = reactive({
    // 工具栏
    // toolbar: {
    //     title: '订单列表',
    //     render: scope => {},
    // },
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
                if (!cellValue) {
                    return '--'
                }
                return cellValue
            },
        },
        empty: 'custom'
    },
    // 字段配置
    columns: [
        {
            label: '点位名称',
            prop: 'orderNo',
            minWidth: 100,
        },
        {
            label: '客流摄像头MAC地址',
            prop: 'orderStatusName',
            minWidth: 160,
        },
        {
            label: '添加时间',
            prop: 'itemNames',
            minWidth: 150,
        },
        {
            label: '更新时间',
            prop: 'paymentMethod',
            width: 180,
        },
       
        {
            label: '操作',
            type: 'buttons',
            width: 200,
            fixed: 'right',
            buttons: [
                {
                    label: '编辑',
                    type: 'primary',
                    link: true,
                    click: row => {
                        
                    },
                },
                {
                    label: '删除',
                    type: 'primary',
                    link: true,
                    click: row => {
                        
                    },
                },
            ],
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
        const res = await api.common.post('/order/mealSmartOrder/list/canteen', {
            // ...searchConditionForm.model,
            pageNo: mainTable.pagination.page,
            pageSize: mainTable.pagination.pageSize,
            // orderBeginTime: searchConditionForm.model.orderTime && searchConditionForm.model.orderTime.length ? searchConditionForm.model.orderTime[0] : '',
            // orderEndTime: searchConditionForm.model.orderTime && searchConditionForm.model.orderTime.length ? searchConditionForm.model.orderTime[1] : '',
            // 组织（接口必须，这里传一个固定值）
            organizationId: $storage.get('userInfo')?.organizationId,
        })
        mainTable.config.loading = false
        if (res.success) {
            mainTable.data = res.data.records
            mainTable.pagination.total = Number(res.data.total)
        }
    },
    getCanteenById: async ()=>{
        const res = await api.common.post('/openframe/canteen/sysCanteen/getCanteenById', {
            id: propInfo.canteenId,
        })
        if (res.success) {
            maximumDiningCapacity.value = res.data.maximumDiningCapacity||0
        }
    },
    editMaximumDiningCapacity: async (maximumDiningCapacity)=>{
        const res = await api.common.post('/openframe/canteen/sysCanteen/editMaximumDiningCapacity', {
            id: propInfo.canteenId,
            maximumDiningCapacity
        })
        if (res.success) {
            mainTable.getCanteenById()
        }
    }
})


const getCompanyTypeName = (type) => {
    if (type == 1) {
        return '集团'
    } else if (type == 10) {
        return '学校'
    } else if (type == 11) {
        return '校区'
    } else if (type == 20) {
        return '医院'
    } else if (type == 21) {
        return '院区'
    } else if (type == 2) {
        return '品牌'
    } else if (type == 3) {
        return '门店'
    } else if (type == 6) {
        return '食堂'
    } else if (type == 8) {
        return '档口'
    } else if (type == 30) {
        return '企业'
    }
}
const getCompanyTypeNameColor = (type) => {
    if (type == 1) {
        return 'danger'
    } else if (type == 10 || type == 20 || type == 2 || type == 30) {
        return 'success'
    } else if (type == 11 || type == 21 || type == 3) {
        return 'warning'
    } else if (type == 6) {
        return ''
    } else if (type == 8) {
        return 'info'
    }
}
const getFontStyle = (type) => {
    if (type == 1) {
        return {
            color: '#000',
            fontSize: '16px',
            fontWeight: 900
        }
    } else if (type == 10 || type == 20 || type == 2 || type == 30) {
        return {
            color: '#111',
            fontSize: '15px',
            fontWeight: 800
        }
    } else if (type == 11 || type == 21 || type == 3) {
        return {
            color: '#222',
            fontSize: '14px',
            // fontWeight: 700
        }
    } else if (type == 6) {
        return {
            color: '#333',
            fontSize: '13px',
            // fontWeight: 600
        }
    } else if (type == 8) {
        return {
            color: '#444',
            fontSize: '12px',
            // fontWeight: 500
        }
    }
}

const refreshTree = (e) => {
    console.log('组织树更新', e)
    if (e?.checkedId) {
        orgTree.getData(e.checkedId)
    }
}

// 初始化
const init = async () => {
    const sysOrganization = $storage.get('sysOrganization') || {}
    console.log('当前企业信息--->', sysOrganization)
    const { companyType = '', id = '', parentId = '' } = sysOrganization
    curOrgId.value = companyType === 8 ? parentId : id
    await nextTick()
    orgTree.getData()
}


/* ------------------- 生命周期 ------------------- */
onMounted(() => {

})

init()

</script>

<style lang="less" scoped>
.basicInformation-page {
    overflow: hidden;
}

.part-left {
    padding: 12px 0;
    width: 300px;
    height: 100%;
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
}

.tree-wrapper {
    margin-left: -10px;
    width: 300px;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    :deep(.el-tree-node__content) {
        height: 38px;

        .el-icon {
            font-size: 20px;
        }
    }
    :deep(.el-tree-node) {
        position: relative;
        padding-left: 18px; // 缩进量
    }

    :deep(.el-tree-node__children) {
        padding-left: 12px; // 缩进量
    }

    // 竖线
    :deep(.el-tree-node::before) {
        content: '';
        height: 100%;
        width: 1px;
        position: absolute;
        left: 3px;
        top: -40px;
        border-width: 1px;
        border-left: 1px dashed #52627c;
    }

    // 当前层最后一个节点的竖线高度固定
    :deep(.el-tree-node:last-child::before) {
        height: 60px; // 可以自己调节到合适数值
    }

    // 横线
    :deep(.el-tree-node::after) {
        content: '';
        width: 16px;
        height: 30px;
        position: absolute;
        left: 3px;
        top: 20px;
        border-width: 1px;
        border-top: 1px dashed #52627c;
    }

    // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
    & > :deep(.el-tree-node::after) {
        border-top: none;
    }

    & > :deep(.el-tree-node::before) {
        border-left: none;
    }

    // 展开关闭的icon
    :deep(.el-tree-node__expand-icon) {
        font-size: 20px;

        // 叶子节点（无子节点）
        &.is-leaf {
            color: transparent;
            // display: none; // 也可以去掉
            margin-left: -26px;
        }
    }

    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
        line-height: 38px;
        overflow: hidden;
        overflow-y: visible;

        .ml-2 {
            margin-right: 5px;
        }

        .yq-wl {
            display: block;
            flex: 1;
            // width: calc(100% - 200px);
        }

        .icon-d {
            display: flex;
            align-items: center;
        }
    }
}

// :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
//     background-color: yellow!important;
// }

.part-right {
    overflow-y: auto;
}
</style>
