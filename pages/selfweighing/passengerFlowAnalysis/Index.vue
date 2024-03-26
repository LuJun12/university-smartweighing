<template>
    <div class="yq-page-container">
        <div class="title yq-flex-row-align yq-flex-row-space-between">
            <div class="left">
                当前客流情况
            </div>
            <div class="right">
                <el-button
                    type="primary"
                    @click="mainTable.getData(1)"
                >
                    刷新数据
                </el-button>
            </div>
        </div>
        <div class="yq-h-200 yq-mt-16 yq-mb-16 yq-rounded-4 yq-bg-white">
            <ElPlusTable
                :table-toolbar="mainTable.toolbar"
                :table-data="mainTable.data"
                :table-config="mainTable.config"
                :table-columns="mainTable.columns"
                :table-pagination="mainTable.pagination"
            />
        </div>
        <div class="search_box">
            <div class="search_item">
                <span>统计范围：</span>
                <el-select
                    v-model="canteenId"
                    clearable
                    style="width: 200px"
                    placeholder="请选择"
                    @change="canteenIdChange"
                >
                    <el-option
                        v-for="item in cateOptions"
                        :key="item.value"
                        :label="item.lable"
                        :value="item.value"
                    />
                </el-select>
            </div>
        </div>
        <div class="title yq-flex-row-align yq-mt-16 yq-mb-16 yq-flex-row-space-between">
            <div class="left">
                全时段客流分析
                <el-date-picker
                    v-model="searchConditionForm.dayDate"
                    :clearable="false"
                    value-format="YYYY-MM-DD"
                    type="date"
                    format="YYYY-MM-DD"
                    placeholder="请选择"
                    style="width: 200px"
                    @change="getHourPassengerFlowChart"
                />
                <!-- <el-select v-model="organizationId" clearable style="width: 200px" placeholder="请选择">
                    <el-option v-for="item in cateOptionst" :key="item.value" :label="item.lable" :value="item.value" />
                    </el-select>-->
            </div>
            <div class="right" />
        </div>
        <div class="yq-h-400-i">
            <BarLineEchart
                echart-id="10001"
                :echart-data="stepData"
            />
        </div>
        <el-row :gutter="20">
            <el-col :span="12">
                <div class="title yq-flex-row-align yq-mt-16 yq-mb-16 yq-flex-row-space-between">
                    <div class="left">
                        今日昨日客流对比
                    </div>
                    <div class="right" />
                </div>
                <div class="yq-h-400">
                    <BarLineEchart
                        echart-id="10002"
                        :echart-data="stepDataDay"
                    />
                </div>
            </el-col>
            <el-col :span="12">
                <div class="title yq-flex-row-align yq-mt-16 yq-mb-16 yq-flex-row-space-between">
                    <div class="left">
                        近12周客流最多工作周排名
                    </div>
                    <div class="right" />
                </div>
                <div class="yq-h-400">
                    <BarLineEchart
                        echart-id="10003"
                        :echart-data="stepDataDayF"
                    />
                </div>
            </el-col>
        </el-row>
        <div class="title yq-flex-row-align yq-mt-16 yq-mb-16 yq-flex-row-space-between">
            <div class="left">
                年度累计客流统计
            </div>
            <div class="right" />
        </div>
        <div class="yq-h-400-i">
            <BarLineEchart
                echart-id="10004"
                :echart-data="stepDataSay"
            />
        </div>
    </div>
</template>

<script setup lang="jsx">
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, onMounted } from 'vue'
// import OrderDetail from './OrderDetail.vue'
import api from '@smartweighing/api'
import * as echarts from 'echarts'
import BarLineEchart from '@/components/echarts/BarLineEchart.vue'
import dayjs from 'dayjs'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')
const $elIcons = inject('$elIcons')
const $message = inject('$message')
const $store = inject('$store')
const $fakeRouter = inject('$fakeRouter')
const $storage = inject('$storage')

/* ------------------- 查询条件 -------------------- */
const canteenId = ref('')
const searchConditionForm = reactive({
    dayDate:dayjs().format('YYYY-MM-DD')
})
const canteenIdChange = async(val)=>{
    await getHourPassengerFlowChart()
    await getTodayYesterdayPassengerFlowChart()
    await getWeekPassengerFlowChartChart()
    await getMonthPassengerFlowChartVOChart()
}
const cateOptions = ref([])
const cateOptionst = ref([])
const stepData = ref({
    legend: true,
    // title: {
    //     text: '各档口销售额统计',
    //     left: 'center',
    // },
    xList: [],
    carouselSize: 12,
    xAxisName: '',
    showDataZoom: true,
    yAxis: [
        {
            type: 'value',
            nameTextStyle: {
                color: '#000',
                align: 'left',
                padding: [0, 0, 5, 0],
            },
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
                show: true,
                lineStyle: {
                    color: '#eee',
                },
            },
        },
    ],
    series: [
        {
            name: '进入食堂人数',
            color: '#1890ff',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                align: 'center',
            },
            type: 'line',
            smooth: true, // 是否平滑曲线显示
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 人'
                },
            },
            // stack: 'aaaa'
        },
        {
            name: '离开食堂人数',
            color: '#52c41a',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                align: 'center',
            },
            type: 'line',
            smooth: true, // 是否平滑曲线显示
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 人'
                },
            },
            // stack: 'aaaa'
        },
    ],
})

const stepDataDay = ref({
    legend: true,
    // title: {
    //     text: '各档口销售额统计',
    //     left: 'center',
    // },
    xList: [],
    carouselSize: 12,
    xAxisName: '',
    showDataZoom: true,
    yAxis: [
        {
            type: 'value',
            nameTextStyle: {
                color: '#000',
                align: 'left',
                padding: [0, 0, 5, 0],
            },
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
                show: true,
                lineStyle: {
                    color: '#eee',
                },
            },
        },
    ],
    series: [
        {
            name: '今日',
            color: '#1890ff',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                align: 'center',
            },
            type: 'line',
            smooth: true, // 是否平滑曲线显示
            areaStyle: {},
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 人'
                },
            },
            // stack: 'aaaa'
        },
        {
            name: '昨日',
            color: '#52c41a',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                align: 'center',
            },
            type: 'line',
            areaStyle: {},
            smooth: true, // 是否平滑曲线显示
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 人'
                },
            },
            // stack: 'aaaa'
        },
    ],
})

const stepDataSay = ref({
    legend: true,
    // title: {
    //     text: '各档口销售额统计',
    //     left: 'center',
    // },
    xList: [],
    carouselSize: 12,
    xAxisName: '',
    showDataZoom: true,
    yAxis: [
        {
            type: 'value',
            nameTextStyle: {
                color: '#000',
                align: 'left',
                padding: [0, 0, 5, 0],
            },
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
                show: true,
                lineStyle: {
                    color: '#eee',
                },
            },
        },
    ],
    series: [
        {
            name: '进入人数',
            color: '#1890ff',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                align: 'center',
            },
            type: 'bar',
            smooth: true, // 是否平滑曲线显示
            areaStyle: {},
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 人'
                },
            },
            // stack: 'aaaa'
        },
    ],
})

const stepDataDayF= ref({
    legend: true,
    // title: {
    //     text: '各档口销售额统计',
    //     left: 'center',
    // },
    xList: [],
    carouselSize: 12,
    xAxisName: '',
    showDataZoom: true,
    yAxis: [
        {
            type: 'value',
            nameTextStyle: {
                color: '#000',
                align: 'left',
                padding: [0, 0, 5, 0],
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#eee',
                },
            },
            axisLabel: {
                color: '#000',
                // interval: 0,  
                // formatter:function(value,index) {  
                //     if (index % 2 != 0) {  
                //         return '\n\n' + value  
                //     }  
                //     else {  
                //         return value  
                //     }  
                // }  
            },
            axisTick: {
                show: false,
                alignWithLabel: true,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#eee',
                },
            },
            // grid: {  
            //     left: '10%',  
            //     bottom: '35%' 
            // }, 
        },
    ],
    series: [
        {
            // name: '进入人数',
            color: '#1890ff',
            data: [],
            label: {
                show: true,
                position: 'top',
                color: '#000',
                align: 'center',
            },
            type: 'bar',
            smooth: true, // 是否平滑曲线显示
            areaStyle: {},
            tooltip: {
                valueFormatter: function (value) {
                    return value + ' 人'
                },
            },
            // stack: 'aaaa'
        },
    ],
})


/* --------------------- 表格 --------------------- */
const mainTable = reactive({
    // 工具栏
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
                if (cellValue == 0) {
                    return '0'
                }
                if (!cellValue) {
                    return '--'
                }
                return cellValue
            },
        },
    },
    // 字段配置
    columns: [
        {
            label: '食堂名称',
            prop: 'canteenName',
            minWidth: 200,
        },
        {
            label: '最大可容纳人数',
            prop: 'maximumDiningCapacity',
            minWidth: 200,
        },
        {
            label: '当前食堂人数',
            prop: 'currentPersonNum',
            minWidth: 200,
        },
        {
            label: '客流分析',
            type: 'buttons',
            width: 200,
            buttons: [
                {
                    label: '空闲',
                    type: 'success',
                    link: true,
                    show: row => {
                        return row.passengerFlowStatus === 1 ? true : false
                    },
                },
                {
                    label: '忙碌',
                    type: 'warning',
                    link: true,
                    show: row => {
                        return row.passengerFlowStatus === 2 ? true : false
                    },
                },
                {
                    label: '拥挤',
                    type: 'danger',
                    link: true,
                    show: row => {
                        return row.passengerFlowStatus === 3 ? true : false
                    },
                },
            ],
        },
    ],
    // 获取数据
    getData: async pageNumber => {
        // if (pageNumber) {
        //     mainTable.pagination.page = pageNumber
        // }
        mainTable.config.loading = true
        const res = await api.device.post('/passenger/devicePassengerFlow/getCurrentPassengerFlowList', {
            // 组织（接口必须，这里传一个固定值）
            organizationId: $storage.get('userInfo')?.organizationId,
        })
        mainTable.config.loading = false
        if (res.success) {
            mainTable.data = res.data||[]
            if(res.data&&res.data.length && !pageNumber){
                canteenId.value = res.data[0].canteenId
                cateOptions.value = res.data.map(v=>{
                    return {
                        lable:v.canteenName,
                        value:v.canteenId,
                    }
                })
            }
            // mainTable.pagination.total = Number(res.data.total)
        }
    },
})

const getHourPassengerFlowChart = async()=>{
    const res = await api.device.post('/passenger/devicePassengerFlow/getHourPassengerFlowChart', {
        // 组织（接口必须，这里传一个固定值）
        canteenId: canteenId.value,
        dayDate:searchConditionForm.dayDate,
    })
    if (res.success) {
        stepData.value.xList = res.data.hourList
        stepData.value.series[0].data = res.data.entryNumList
        stepData.value.series[1].data = res.data.exitNumList
    }
}

const getTodayYesterdayPassengerFlowChart = async()=>{
    const res = await api.device.post('/passenger/devicePassengerFlow/getTodayYesterdayPassengerFlowChart', {
        // 组织（接口必须，这里传一个固定值）
        canteenId: canteenId.value,
    })
    if (res.success) {
        stepDataDay.value.xList = res.data.hourList
        stepDataDay.value.series[0].data = res.data.todayNumList
        stepDataDay.value.series[1].data = res.data.yesterdayNumList
    }
}

const getWeekPassengerFlowChartChart = async()=>{
    const res = await api.device.post('/passenger/devicePassengerFlow/getWeekPassengerFlowChartChart', {
        // 组织（接口必须，这里传一个固定值）
        canteenId: canteenId.value,
    })
    if (res.success) {
        stepDataDayF.value.xList = res.data.weekList
        stepDataDayF.value.series[0].data = res.data.numList
    }
}

const getMonthPassengerFlowChartVOChart = async()=>{
    const res = await api.device.post('/passenger/devicePassengerFlow/getMonthPassengerFlowChartVOChart', {
        // 组织（接口必须，这里传一个固定值）
        canteenId: canteenId.value,
    })
    if (res.success) {
        stepDataSay.value.xList = res.data.monthList
        stepDataSay.value.series[0].data = res.data.numList
    }
}

/* ------------------- 生命周期 -------------------- */
onMounted(async() => {
    // 查询表格数据
    await mainTable.getData()
    await getHourPassengerFlowChart()
    await getTodayYesterdayPassengerFlowChart()
    await getWeekPassengerFlowChartChart()
    await getMonthPassengerFlowChartVOChart()
})
</script>

<style lang="less" scoped>
.title {
    .left {
        font-size: 20px;
        font-weight: bold;
    }
}
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
</style>
