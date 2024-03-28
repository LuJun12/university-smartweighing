<template>
    <div class="yq-page-container">
        <cus-panel>
            <div class="staff_punishment" v-loading="loading">
                <div class="search_box" style="margin-top: 24px">
                    <div class="search_item">
                        <span>统计范围：</span>
                        <el-select v-model="organizationId" clearable style="width: 200px" placeholder="请选择" @change="clickHandle">
                            <el-option v-for="item in cateOptions" :key="item.value" :label="item.lable" :value="item.value" />
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
        <cus-panel>
            <div class="staff_punishment" v-loading="loading">
                <div class="flex-all">
                    <div class="flex-left">
                        <div class="title">累计收入</div>
                        <div class="mian-value">{{ orderStatistInfo.totalRevenue || 0 }}元</div>
                        <div class="botm-flex">
                            <span>销售{{ orderStatistInfo.totalOrderNum || 0 }}单</span>
                            <span class="center-c"></span>
                            <span>退款{{ orderStatistInfo.refundNum || 0 }}单</span>
                        </div>
                    </div>
                    <div class="flex-right">
                        <el-row>
                            <el-col :span="8" v-for="(e, i) in orderStatistiRight" :key="i">
                                <div class="mian-title-a">{{ e.name }}</div>
                                <div class="mian-value-a">{{ e.value }}元</div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </div>
        </cus-panel>
        <cus-panel title="销售统计" :titleCenter="'left'">
            <div class="staff_punishment" v-loading="loading">
                <div class="stepWare-m" v-if="isShowEchart">
                    <!-- <ECharts class="stepWare" ref="echartsRef" :option="stepData" /> -->
                    <BarEchart :echart-id="sampleID" :echart-data="stepData" />
                </div>
            </div>
        </cus-panel>
        <el-row :gutter="20">
            <el-col :span="12">
                <cus-panel title="单价分布" :titleCenter="'left'">
                    <div class="staff_punishment" v-loading="loading" style="height: 300px">
                        <div v-for="(e, i) in orderStatisticLeft" :key="i" class="explain_normal_left">
                            <!-- <span class="explain_name_before" :style="`background: ${e.color}`" /> -->
                            <span class="explain_name">{{ e.name }}</span>
                            <el-progress :text-inside="true" :stroke-width="26" :percentage="tatalAll ? +((e.value / tatalAll) * 100).toFixed(2) : 0" />
                            <span class="explain_value">{{ e.value }}单</span>
                            <span class="explain_value">{{ tatalAll ? ((e.value / tatalAll) * 100).toFixed(2) : 0 }}%</span>
                        </div>
                    </div>
                </cus-panel>
            </el-col>
            <el-col :span="12">
                <cus-panel title="餐次分布" :titleCenter="'left'">
                    <div class="staff_punishment" v-loading="loading">
                        <div class="orderStatistics_content_top_main">
                            <div class="erchart-mian">
                                <div class="echat-one">
                                    <div class="orderStatistics_content_top_main_echarts">
                                        <RingEchart
                                            echart-id="orderStatisticsId1"
                                            :color="orderStatisticsData1.color"
                                            :echart-data="orderStatisticsData1.data"
                                            :label="orderStatisticsData1.label"
                                            :legend="orderStatisticsData1.legend"
                                        />
                                    </div>
                                    <div class="orderStatistics_content_top_main_echarts_right">
                                        <div v-for="(e, i) in orderStatisticsData1.data" :key="i" class="explain_normal">
                                            <span class="explain_name_before" :style="`background: ${e.color}`" />
                                            <span class="explain_name">{{ e.name }}：</span>
                                            <span class="explain_value">{{ e.value }}单</span>
                                            <span class="explain_value">{{ tatalAllRight ? ((e.value / tatalAllRight) * 100).toFixed(2) : 0 }}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </cus-panel>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, watch, computed, onMounted } from 'vue'
// import CusPanel from '@/components/CusPanel'
import CusPanel from '@smartweighing/components/CusPanel.vue'
import * as echarts from 'echarts'
import BarEchart from '@/components/echarts/BarLineEchart.vue'
import RingEchart from '@/components/echarts/RingEchart.vue'
import dayjs from 'dayjs'
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

const cateOptions = ref([])

const organizationId = ref()
const datelist = ref([dayjs().add(-29, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])
const disabledDate = time => {
    const sixMonth = new Date().setMonth(new Date().getMonth() - 6)
    return time.getTime() > Date.now() || time.getTime() < sixMonth
}
const getOrganizationList = async () => {
    const res = await api.smartWeighing.post('/statistics/operatingStatistics/selectOperatingCanteenList', {
        organizationId: $storage.get('userInfo')?.maxOrgId || $storage.get('userInfo')?.organizationId,
    })
    cateOptions.value = res.data.map(v => {
        return {
            lable: v.companyName,
            value: v.organizationId,
        }
    })
    if(res.data&&res.data.length){
        organizationId.value = res.data[0].organizationId
    }
}

const clickHandle = () => {
    getTotalByMonth()
}

const sampleID = ref('')
const isShowEchart = ref(false)

const stepData = ref({
    legend: true,
    // title: {
    //     text: '各档口销售额统计',
    //     left: 'center',
    // },
    xList: [],
    carouselSize: 0,
    xAxisName: '日期',
    showDataZoom: true,
    yAxis: [
        {
            type: 'value',
            name: '收入(元)',
            nameTextStyle: {
                color: '#000',
                align: 'left',
                padding: [0, 0, 5, 0],
            },
            min: 0,
            max: 0,
            interval: 0,
            splitNumber: 6,
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#eee',
                },
            },
            axisLabel: {
                color: '#000',
            },
            axisTick: {
                show: false,
                alignWithLabel: true,
            },
            splitLine: {
                show: false,
                lineStyle: {
                    color: '#eee',
                },
            },
        },
        {
            type: 'value',
            name: '订单量(单)',
            nameTextStyle: {
                color: '#000',
                align: 'right',
                padding: [0, 0, 5, 0],
            },
            min: 0,
            max: 0,
            splitNumber: 6,
            interval: 0,
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#eee',
                },
            },
            axisLabel: {
                color: '#000',
            },
            axisTick: {
                show: false,
                alignWithLabel: true,
            },
            splitLine: {
                show: false,
                lineStyle: {
                    color: '#eee',
                },
            },
        },
    ],
    series: [
        {
            name: '收入',
            color: '#1890ff',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                offset: [-5, 0],
                align: 'right',
            },
            type: 'bar',
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 元'
                },
            },
            // stack: 'aaaa'
        },
        {
            name: '订单量',
            color: '#d88273',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                offset: [5, 0],
                align: 'left',
                // color: 'rgba(29, 242, 255, 1)'
            },
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 单'
                },
            },
            type: 'line',
            yAxisIndex: 1,
            // stack: 'aaaa'
        },
    ],
})

const orderStatisticsData1 = reactive({
    legend: {
        show: false,
        right: 10,
    },
    color: ['#ec85ce', '#6789f7', '#ede157', '#7ae98b'],
    data: [
        {
            name: '早餐',
            value: 0,
            color: '#ec85ce',
        },
        {
            name: '午餐',
            value: 0,
            color: '#6789f7',
        },
        {
            name: '晚餐',
            value: 0,
            color: '#ede157',
        },
        {
            name: '夜宵',
            value: 0,
            color: '#7ae98b',
        },
    ],
})

const orderStatisticLeft = ref([
    {
        name: '50元以上',
        value: 0,
    },
    {
        name: '30~50元',
        value: 0,
    },
    {
        name: '20~30元',
        value: 0,
    },
    {
        name: '10~20元',
        value: 0,
    },
    {
        name: '10元以下',
        value: 0,
    },
])

const orderStatistiRight = ref([
    {
        name: '订单总额',
        value: 0,
    },
    {
        name: '订单退款',
        value: 0,
    },
    {
        name: '优惠补贴',
        value: 0,
    },
    {
        name: '客单价',
        value: 0,
    },
    {
        name: '单均退款',
        value: 0,
    },
    {
        name: '单均补贴',
        value: 0,
    },
])

const tatalAll = ref(100)
const tatalAllRight = ref(100)

const orderStatistInfo = ref({})

const calMax = arr => {
    const max = Math.max.apply(null, arr) // 获取最大值方法
    const maxint = Math.ceil(max / 5) // 向上以5的倍数取整
    const maxval = maxint * 5 + 5 // 最终设置的最大值
    return maxval // 输出最大值
}
const calMin = arr => {
    const min = Math.min.apply(null, arr) // 获取最小值方法
    const minint = Math.floor(min / 1) // 向下以1的倍数取整
    const minval = minint * 1 - 5 // 最终设置的最小值
    return minval // 输出最小值
}

const getTotalByMonth = async () => {
    isShowEchart.value = false
    loading.value = true
    const params = {
        mealDateBegin: datelist.value && datelist.value.length ? datelist.value[0] : '',
        mealDateEnd: datelist.value && datelist.value.length ? datelist.value[1] : '',
        organizationId: organizationId.value,
    }

    const res = await api.smartWeighing.post('/statistics/operatingStatistics/selectOperatingStatisticsInfo', params)
    if (res.success) {
        orderStatistInfo.value = res.data
        orderStatistiRight.value[0].value = res.data.totalPrice || 0
        orderStatistiRight.value[1].value = res.data.refundPrice || 0
        orderStatistiRight.value[2].value = res.data.preferentialSubsidies || 0
        orderStatistiRight.value[3].value = res.data.userUnitPrice || 0
        orderStatistiRight.value[4].value = res.data.avgRefund || 0
        orderStatistiRight.value[5].value = res.data.avgSubsidies || 0

        tatalAll.value = (res.data.downShi || 0) + (res.data.ershiSanshi || 0) + (res.data.sanshiWushi || 0) + (res.data.shiErshi || 0) + (res.data.upWushi || 0)

        orderStatisticLeft.value[0].value = res.data.upWushi || 0
        orderStatisticLeft.value[1].value = res.data.sanshiWushi || 0
        orderStatisticLeft.value[2].value = res.data.ershiSanshi || 0
        orderStatisticLeft.value[3].value = res.data.shiErshi || 0
        orderStatisticLeft.value[4].value = res.data.downShi || 0

        tatalAllRight.value = (res.data.breakfastNum || 0) + (res.data.dinnerNum || 0) + (res.data.lunchNum || 0) + (res.data.midnightSnackNum || 0)

        orderStatisticsData1.data[0].value = res.data.breakfastNum || 0
        orderStatisticsData1.data[1].value = res.data.lunchNum || 0
        orderStatisticsData1.data[2].value = res.data.dinnerNum || 0
        orderStatisticsData1.data[3].value = res.data.midnightSnackNum || 0
        stepData.value.xList = res.data.operatingStatisticsVoList.map(v => dayjs(v.mealDate).format('MM-DD') + v.weeks)
        stepData.value.series[0].data = res.data.operatingStatisticsVoList.map(v => v.totalRevenue)
        stepData.value.series[1].data = res.data.operatingStatisticsVoList.map(v => v.totalOrderNum)
        stepData.value.yAxis[0].max = calMax(res.data.operatingStatisticsVoList.map(v => v.totalRevenue))
        stepData.value.yAxis[0].interval = (stepData.value.yAxis[0].max / 6).toFixed(0)
        stepData.value.yAxis[1].max = calMax(res.data.operatingStatisticsVoList.map(v => v.totalOrderNum))
        stepData.value.yAxis[1].interval = (stepData.value.yAxis[1].max / 6).toFixed(0)

        isShowEchart.value = true
        sampleID.value = 'sampleID001'
        loading.value = false
    }
}

/* ------------------- computed ------------------- */

/* --------------------- watch -------------------- */

/* -------------------- 初始化 -------------------- */

/* ------------------- 生命周期 ------------------- */
onMounted(async() => {
    await getOrganizationList()
    await getTotalByMonth()
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
    height: 600px;
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
.erchart-mian {
    display: flex;
}
.orderStatistics_content_top_main_echarts {
    width: 60%;
    height: 100%;
    min-height: 300px;
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
.explain_normal_left {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    :deep(.el-progress) {
        // flex: 1;
        width: 50%;
        // max-width: 400px;
    }
    .explain_name {
        height: 12px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: bold;
        color: #000000;
        margin-right: 10px;
        line-height: 12px;
        width: 60px;
    }
    .explain_value {
        height: 12px;
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: bold;
        color: #000000;
        line-height: 12px;
        margin-left: 10px;
    }
}
.flex-all {
    display: flex;
    padding-top: 20px;
    .flex-left {
        width: 300px;
        height: 146px;
        border-radius: 4px;
        background: var(--el-color-primary);
        color: white;
        padding: 12px;
        .title {
            margin-bottom: 16px;
        }
        .mian-value {
            font-weight: bold;
            font-size: 32px;
            margin-bottom: 10px;
        }
        .botm-flex {
            display: flex;
            align-items: center;
            .center-c {
                width: 2px;
                height: 20px;
                background: white;
                margin: 0 5px;
            }
        }
    }
    .flex-right {
        flex: 1;
    }
}
.mian-title-a {
    text-align: center;
    font-size: 18px;
}
.mian-value-a {
    text-align: center;
    font-weight: bold;
    font-size: 30px;
    margin-bottom: 10px;
}
</style>
