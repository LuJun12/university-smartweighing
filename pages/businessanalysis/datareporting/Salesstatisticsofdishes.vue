<template>
    <div class="yq-page-container">
        <cus-panel>
            <div class="staff_punishment" v-loading="loading">
                <div class="search_box" style="margin-top: 24px">
                    <div class="search_item">
                        <span>统计范围：</span>
                        <el-select v-model="organizationId" :clearable="false" style="width: 200px" placeholder="请选择">
                            <el-option v-for="item in cateOptionsOrg" :key="item.value" :label="item.lable" :value="item.value" />
                        </el-select>
                    </div>
                    <div class="search_item">
                        <span>餐次：</span>
                        <el-select v-model="mealTimes" clearable style="width: 80px" placeholder="请选择">
                            <el-option v-for="item in cateOptions" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </div>
                    <div class="search_item">
                        <span>营业日期：</span>
                        <!-- <el-input style="flex: 1"  v-model="name" placeholder="请输入"></el-input> -->
                        <el-date-picker
                            v-model="datelist"
                            :clearable="false"
                            style="flex: 1"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="YYYY-MM-DD"
                            :disabled-date="disabledDate"
                        ></el-date-picker>
                    </div>
                    <div class="search_item">
                        <el-button type="primary" @click="clickHandle">查询</el-button>
                    </div>
                </div>
            </div>
        </cus-panel>
        <el-row :gutter="20">
            <el-col :span="10">
                <cus-panel title="菜品销售日均排行" :titleCenter="'left'">
                    <div class="el-button-radio">
                        <el-radio-group v-model="dimensionType" @change="getData(1)">
                            <el-radio-button :label="1">按单量</el-radio-button>
                            <el-radio-button :label="2">按重量</el-radio-button>
                        </el-radio-group>
                        <el-radio-group v-model="sortType" style="margin-left: 10px" @change="getData(1)">
                            <el-radio-button :label="1">畅销</el-radio-button>
                            <el-radio-button :label="2">滞销</el-radio-button>
                        </el-radio-group>
                    </div>
                    <div class="staff_punishment" v-loading="leftloading" style="height: 300px">
                        <!-- <div class="mq-m-c">由于菜品不是每天都有销售，所以仅计算菜品上架销售的当天计算平均值</div> -->
                        <el-row gutter="10">
                            <el-col :span="12">
                                <div class="staff_a" v-for="(item, index) in leftData" :key="index">
                                    <div class="staff_b">{{ index + 1 }}</div>
                                    <div class="staff_c">
                                        <div class="text-title">
                                            {{ item.dishName || '--' }},{{ dimensionType == 1 ? item.dayOrderNum : item.dayTotalWeight }}{{ dimensionType == 1 ? '单' : 'KG' }}
                                        </div>
                                        <el-progress :text-inside="true" :show-text="false" :stroke-width="16" :percentage="item.Percent" />
                                    </div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="staff_a" v-for="(item, index) in rightData" :key="index">
                                    <div class="staff_b">{{ index + 1 + 5 }}</div>
                                    <div class="staff_c">
                                        <div class="text-title">
                                            {{ item.dishName || '--' }},{{ dimensionType == 1 ? item.dayOrderNum : item.dayTotalWeight }}{{ dimensionType == 1 ? '单' : 'KG' }}
                                        </div>
                                        <el-progress :text-inside="true" :show-text="false" :stroke-width="16" :percentage="item.Percent" />
                                    </div>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </cus-panel>
            </el-col>
            <el-col :span="14">
                <cus-panel title="菜品销售占比" :titleCenter="'left'">
                    <div class="staff_punishment" v-loading="rightloading">
                        <div class="orderStatistics_content_top_main">
                            <div class="erchart-mian">
                                <div class="echat-one">
                                    <div class="orderStatistics_content_top_main_echarts">
                                        <PieEchart title="单量占比" :echart-data="ccpControlPieData" echart-id="ccp-control-center-li-echart-1"></PieEchart>
                                    </div>
                                    <div class="orderStatistics_content_top_main_echarts_right">
                                        <PieEchart title="销售额占比" :echart-data="ccpControlPieData2" echart-id="ccp-control-center-li-echart-2"></PieEchart>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </cus-panel>
            </el-col>
        </el-row>
        <cus-panel title="菜品销售信息" :titleCenter="'left'">
            <div class="staff_punishment">
                <div class="search_box" style="margin-top: 24px; margin-bottom: 24px">
                    <div class="search_item">
                        <span>菜品名称：</span>
                        <el-input style="flex: 1" v-model="dishName" placeholder="请输入" clearable @change="getData(3)"></el-input>
                    </div>
                </div>
                <ElPlusTable
                    :table-toolbar="mainTable.toolbar"
                    :table-data="mainTable.data"
                    :table-config="mainTable.config"
                    :table-columns="mainTable.columns"
                    :table-pagination="mainTable.pagination"
                />
            </div>
        </cus-panel>
    </div>
</template>

<script setup>
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, watch, computed, onMounted } from 'vue'
// import CusPanel from '@/components/CusPanel'
import CusPanel from '@smartweighing/components/CusPanel.vue'
import dayjs from 'dayjs'
import PieEchart from '@/components/echarts/PieEchart.vue'
import api from '@smartweighing/api'
/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $store = inject('$store')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')
const $routeState = inject('$routeState')

/* ----------------- props 和 emit ---------------- */
const props = defineProps({})

/* ------------------ 变量和方法 ------------------ */
const loading = ref(false)
const leftloading = ref(false)
const rightloading = ref(false)
const dimensionType = ref(1)
const sortType = ref(1)
const mealTimes = ref('')
const dishName = ref('')

const ccpControlPieData = ref([])
const ccpControlPieData2 = ref([])
const leftData = ref([])
const rightData = ref([])

const cateOptions = ref([
    {
        label: '全部',
        value: '',
    },
    {
        label: '早餐',
        value: '1',
    },
    {
        label: '午餐',
        value: '2',
    },
    {
        label: '晚餐',
        value: '3',
    },
    {
        label: '夜宵',
        value: '4',
    },
])

const mainTable = reactive({
    // 表格顶部操作
    // toolbar: {
    //     // title: '食材信息',
    // },
    // 表格数据
    data: [],
    // 表格配置
    config: {
        // 正在加载
        loading: false,
        // 高度
        height: '100%',
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
        { prop: 'dishName', label: '菜品名称', width: '' },
        // { prop: 'warnRoom', label: '菜品单价（元 / g）', width: '' },
        { prop: 'orderNum', label: '总销量（单）', width: '' },
        { prop: 'totalPrice', label: '总销售额（元）', width: '' },
        { prop: 'totalWeight', label: '总销售重量（kg）', width: '' },
        { prop: 'orderAvgPrice', label: '单均销售额（元）', width: '' },
        {
            prop: 'orderAvgWeight',
            label: '单均销售重量（kg）',
            width: '',
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
    // 选中的树数据
    categoryItem: {
        mainMaterialCategoryId: '',
        materialCategoryId: '',
    },
    // 获取数据
    getData: async pageNumber => {
        if (pageNumber) {
            mainTable.pagination.page = pageNumber
        }

        getData(3)
    },
})

const clickHandle = () => {
    // mainTable.pagination.page = 1
    getData()
}
const getData = async type => {
    if (!type) {
        loading.value = true
    }
    if (!type || type == 1) {
        leftloading.value = true
    }
    if (!type || type == 2) {
        rightloading.value = true
    }
    if (!type || type == 3) {
        mainTable.config.loading = true
    }
    const params = {
        pageNo: mainTable.pagination.page,
        pageSize: mainTable.pagination.pageSize,
        // pageNo: 1,
        // pageSize: 10,
        mealTimes: mealTimes.value,
        dishName: dishName.value,
        mealDateBegin: datelist.value && datelist.value.length ? datelist.value[0] : '',
        mealDateEnd: datelist.value && datelist.value.length ? datelist.value[1] : '',
        organizationId: organizationId.value,
        dimensionType: dimensionType.value,
        sortType: sortType.value,
    }
    const res = await api.common.post('/statistics/foodSalesStatistics/selectFoodStatisticsInfo', params)

    if (res.success) {
        if (!type) {
            loading.value = false
        }
        if (!type || type == 1) {
            leftloading.value = false
            if (res.data.daySalesRankVos && res.data.daySalesRankVos.length) {
                if (dimensionType.value == 1) {
                    // item.dayOrderNum : item.dayTotalWeight
                    const maxData = res.data.daySalesRankVos[0].dayOrderNum
                    const minData = res.data.daySalesRankVos[res.data.daySalesRankVos.length - 1].dayOrderNum
                    if (sortType.value == 1) {
                        leftData.value = res.data.daySalesRankVos.slice(0, 5).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayOrderNum / maxData) * 100).toFixed(2),
                            }
                        })
                        rightData.value = res.data.daySalesRankVos.slice(5, 10).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayOrderNum / maxData) * 100).toFixed(2),
                            }
                        })
                    } else {
                        leftData.value = res.data.daySalesRankVos.slice(0, 5).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayOrderNum / minData) * 100).toFixed(2),
                            }
                        })
                        rightData.value = res.data.daySalesRankVos.slice(5, 10).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayOrderNum / minData) * 100).toFixed(2),
                            }
                        })
                    }
                } else {
                    const maxData = res.data.daySalesRankVos[0].dayTotalWeight
                    const minData = res.data.daySalesRankVos[res.data.daySalesRankVos.length - 1].dayTotalWeight
                    if (sortType.value == 1) {
                        leftData.value = res.data.daySalesRankVos.slice(0, 5).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayTotalWeight / maxData) * 100).toFixed(2),
                            }
                        })
                        rightData.value = res.data.daySalesRankVos.slice(5, 10).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayTotalWeight / maxData) * 100).toFixed(2),
                            }
                        })
                    } else {
                        leftData.value = res.data.daySalesRankVos.slice(0, 5).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayTotalWeight / minData) * 100).toFixed(2),
                            }
                        })
                        rightData.value = res.data.daySalesRankVos.slice(5, 10).map(v => {
                            return {
                                ...v,
                                Percent: ((v.dayTotalWeight / minData) * 100).toFixed(2),
                            }
                        })
                    }
                }
            } else {
                leftData.value = []
                rightData.value = []
            }
        }
        if (!type || type == 2) {
            rightloading.value = false
            ccpControlPieData.value = res.data.foodSalesProportionVos.map(v => {
                return {
                    ...v,
                    name: v.categoryName,
                    value: v.orderNum,
                }
            })
            ccpControlPieData2.value = res.data.foodSalesProportionVos.map(v => {
                return {
                    ...v,
                    name: v.categoryName,
                    value: v.totalPrice,
                }
            })
        }
        if (!type || type == 3) {
            mainTable.config.loading = false
            mainTable.data = res.data.foodSalesRankVos.records || []
            mainTable.pagination.total = Number(res.data.foodSalesRankVos.total)
        }
    }
}

const datelist = ref([dayjs().add(-7, 'day').format('YYYY-MM-DD'), dayjs().add(-1, 'day').format('YYYY-MM-DD')])
const disabledDate = time => {
    const sixMonth = new Date().setMonth(new Date().getMonth() - 6)
    return time.getTime() > new Date().getTime() - 8.64e7 || time.getTime() < sixMonth
}
const organizationId = ref($storage.get('userInfo')?.organizationId)
const cateOptionsOrg = ref([])
const getOrganizationList = async () => {
    const res = await api.common.post('/sys/organization/getCanteenList', {
        orgId: $storage.get('userInfo')?.organizationId,
    })
    cateOptionsOrg.value = res.data.map(v => {
        return {
            lable: v.name,
            value: v.id,
        }
    })
}
/* ------------------- computed ------------------- */

/* --------------------- watch -------------------- */

/* -------------------- 初始化 -------------------- */

/* ------------------- 生命周期 ------------------- */
onMounted(() => {
    getOrganizationList()
    getData()
})
</script>

<style lang="less" scoped>
.yq-page-container {
    overflow-y: auto;
    overflow-x: hidden;
}
.staff_punishment {
    .search_box {
        display: flex;
        .search_item {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            margin-right: 30px;
        }
        :deep(.el-radio-group) {
            margin-right: 20px;
            .el-radio-button {
                margin-right: 30px;
                .el-radio-button__inner {
                    border-radius: 4px;
                    border: 1px solid #dcdfe6;
                }
            }
            .is-active {
                .el-radio-button__inner {
                    border-radius: 4px;
                    border: 1px solid var(--el-color-primary);
                }
            }
        }
    }
    .btn_box {
        display: flex;
        justify-content: space-between;
        color: #1890ff;
        cursor: pointer;
    }
}
.stepWare-m {
    width: 100%;
    height: 100%;
    margin-bottom: 20px;
}
.stepWare-c {
    width: 100%;
    height: 100%;
    margin: 20px 0px;
    display: flex;
    justify-content: space-between;
    .item-main {
        width: 24%;
        height: 236px;
        background: rgba(231, 231, 240, 0.33);
        border: 1px solid rgba(213, 213, 223, 0.33);
        .item-title {
            height: 20px;
            font-size: 14px;
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            color: #333333;
            margin-left: 12px;
            margin-top: 12px;
            line-height: 20px;
            display: flex;
            align-items: center;
            .title-left {
                display: inline-block;
                width: 4px;
                height: 16px;
                background: var(--el-color-primary);
                margin-right: 8px;
            }
        }
        .main-all {
            width: 241px;
            height: 95px;
            margin: 0 auto;
            margin-top: 55px;
            position: relative;
            .cpmain-t {
                width: 241px;
                height: 95px;
                display: flex;
                position: absolute;
                justify-content: space-between;
                top: -30px;
                font-size: 18px;
                font-family: PingFangSC-Medium, PingFang SC;
                font-weight: 500;
                color: #333333;
                left: 0px;
                padding-left: 14px;
                padding-right: 12px;
                .campany {
                    font-size: 14px;
                    font-family: PingFangSC-Regular, PingFang SC;
                    font-weight: 400;
                    color: #333333;
                }
                .cpxq {
                    &:first-child {
                        margin-top: 40px;
                    }
                    &:last-child {
                        margin-top: 25px;
                    }
                }
            }
            .img-c {
                width: 241px;
                height: 95px;
            }
            .cpmain {
                display: flex;
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
                color: #333333;
                justify-content: space-between;
                margin-top: 12px;
                padding-left: 10px;
                padding-right: 31px;
                .cpxq {
                    width: 30%;
                }
            }
        }
    }
}
.stepWare {
    width: 100%;
    height: 380px;
    overflow: hidden;
}
.orderStatistics_content_top_main_echarts {
    width: 50%;
    height: 100%;
    height: 300px;
    // padding: 0 24px;
}
.echat-one {
    width: 100%;
    display: flex;
    align-items: center;
    // margin-top: 20px;
}
.orderStatistics_content_top_main_echarts_right {
    width: 50%;
    height: 100%;
    height: 300px;
    // padding-top: 45px;
    .explain_normal {
        // width: 140px;
        text-align: left;
        margin-bottom: 10px;
        .explain_name_before {
            display: inline-block;
            width: 8px;
            height: 8px;
            content: '';
            border-radius: 4px;
            margin-right: 10px;
        }
        .explain_name {
            height: 12px;
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #000000;
            line-height: 12px;
            margin-right: 20px;
        }
        .explain_value {
            height: 12px;
            font-size: 16px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: bold;
            color: #000000;
            line-height: 12px;
            margin-right: 10px;
        }
    }
}
.el-button-radio {
    position: absolute;
    top: 12px;
    right: 24px;
}
.mq-m-c {
    color: red;
    font-size: 13px;
    margin-bottom: 20px;
}
.staff_a {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .staff_b {
        text-align: center;
        border: 1px solid #000000;
        border-radius: 100%;
        width: 20px;
        height: 20px;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
    }
    .staff_c {
        flex: 1;
        .text-title {
            font-size: 13px;
            margin-bottom: 5px;
        }
        .el-progress {
            .el-progress-bar {
                .el-progress-bar__outer {
                    background-color: #fff;
                }
            }
        }
    }
}
</style>
<style lang="less">
.staff_c {
    .el-progress {
        .el-progress-bar {
            .el-progress-bar__outer {
                background-color: #fff;
            }
        }
    }
}
</style>
