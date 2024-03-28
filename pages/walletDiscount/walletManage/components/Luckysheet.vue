<template>
    <div id="luckysheet-box" />
</template>

<script setup>
import { nextTick, inject, ref, onUnmounted } from 'vue'
import api from '@common/api'
const $storage = inject('$storage')
const organizationId = $storage.get('userInfo')?.maxOrgId || $storage.get('userInfo')?.organizationId

const props = defineProps({
    immediate: {
        type: Boolean,
        default: true,
    },
})
onUnmounted(() => {
    destroy()
})

const emit = defineEmits(['updateCellOne'])

const initExcelHandle = async () => {
    let options = {
        container: 'luckysheet-box', //容器id
        title: '成员导入',
        lang: 'zh',
        showtoolbar: false,
        showinfobar: false,
        showsheetbar: false,
        data: [
            {
                name: 'Cell', //工作表名称
                color: '', //工作表颜色
                index: 0, //工作表索引
                status: 0, //激活状态
                order: 0, //工作表的下标
                hide: 0, //是否隐藏
                row: 500, //行数
                column: 7, //列数
                defaultRowHeight: 30, //自定义行高
                defaultColWidth: 150, //自定义列宽
                celldata: [
                    { r: 0, c: 0, v: { v: '*成员Id', bg: 'yellow', ht: 0, } },
                    { r: 0, c: 1, v: { v: '*钱包充值金额', bg: 'yellow', ht: 0 } },
                    { r: 0, c: 2, v: { v: '*补贴钱包充值金额', bg: 'yellow', ht: 0 } },
                    { r: 0, c: 3, v: { v: '姓名', ht: 0 } },
                    { r: 0, c: 4, v: { v: '编号类型', ht: 0 } },
                    { r: 0, c: 5, v: { v: '证件编号', ht: 0 } },
                    { r: 0, c: 6, v: { v: '手机号', ht: 0 } },
                ], //初始化使用的单元格数据
                config: {
                    merge: {}, //合并单元格
                    rowlen: {}, //表格行高
                    columnlen: {}, //表格列宽
                    rowhidden: {}, //隐藏行
                    colhidden: {}, //隐藏列
                    borderInfo: [], //边框
                    authority: {
                        // sheet: 1, // sheet表下标。
                        // hintText: '这部分不可以进行修改', // 弹窗提示的文字
                        // allowRangeList: [
                        //     // { sqref: '$A$2:$A$2' }, //设置A2~D6为可编辑区域，其它区域不可编辑
                        // ],
                    }, //工作表保护
                },
            },
        ],
        showtoolbarConfig: {
            frozenMode: true,
        },
        hook: {
            cellUpdated: async (r, c, oldValue, newValue, isRefresh) => {
                emit('updateCellOne', { r, c, newValue })
                // 执行单元格修改后的操作
            },
            rangePasteBefore: async () => {
                await nextTick()
                emit('updateCellOne')
            },
        },
    }
    await nextTick()
    luckysheet.create(options)
    luckysheet.setHorizontalFrozen(false)
}

const destroy = () => {
    window.luckysheet?.destroy()
}

const checkTable = () => {
    const excelData = luckysheet.flowdata()
    excelData.map((item, index) => {
        if (item) {
            item.map(ll => {
                if (ll) {
                    ll.m = ll.v
                    ll.v = ll.v
                    ll.ct = {
                        fa: '@',
                        t: 's',
                    }
                }
            })
        }
    })
    const celldata = luckysheet.getAllSheets()[0].data
    let tableList = [],
        errorList = []
    for (let i = 1; i < celldata.length; i++) {
        if(celldata[i].some(item=>item!==null)){
            console.log(i+1, celldata[i])
        }
        if (
            celldata[i].some((item, idx) => {
                return [0, 1, 2,].includes(idx) && (!item || !item.v)
            })
        ) {
            if (celldata[i].every(item => item === null || !item.v)) continue
            if (!celldata[i][0]?.v)
                errorList.push({
                    indexSel: i + 1,
                    error: '成员Id不能为空',
                })
            if (!isNonEmptyValue(celldata[i][1]?.v))
                errorList.push({
                    indexSel: i + 1,
                    error: '钱包充值金额不能为空',
                })
            if (!isNonEmptyValue(celldata[i][2]?.v))
                errorList.push({
                    indexSel: i + 1,
                    error: '补贴钱包充值金额不能为空',
                })
        }

        if (
            celldata[i].filter((item, idx) => {
                return [0, 1, 2,].includes(idx) && item !== null && isNonEmptyValue(item.v)
            }).length === 3
        ) {
            tableList.push({
                dinersId: celldata[i][0]?.v,
                amount: celldata[i][1]?.v,
                allowanceAmount: celldata[i][2]?.v,
                userName: celldata[i][3]?.v,
                cardTypeName: celldata[i][4]?.v,
                idCard: celldata[i][5]?.v,
                phone: celldata[i][6]?.v,
                organizationId,
                seq: i + 1,
            })
        }
    }

    if (tableList.length > 500) {
        errorList.push({
            indexSel: 501,
            error: '单次最多提交五百条',
        })
    }
    console.log(tableList, errorList)
    return {
        tableList,
        errorList,
    }
}
function isNonEmptyValue(value) {
    return ![null, void 0, '', false].includes(value)
}
props.immediate && initExcelHandle()

defineExpose({
    destroy,
    initExcelHandle,
    checkTable,
})
</script>

<style lang="scss" scoped>
#luckysheet-box {
    // width: 100%;
    // height: 100%;
    position: absolute;
    overflow: hidden;
}
</style>
