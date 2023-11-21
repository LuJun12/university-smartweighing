<template>
    <div class="cus_panel">
        <div class="panel">
            <div class="title" :class="{ 'show-border': title }" v-if="title">
                <p :style="{textAlign: titleCenter}" v-if="title">{{ title }}</p>
                <!-- <div>
                    <el-button size="small" type="primary" @click="$emit('historyHandle')" v-if="showHistory">查看历史台账</el-button>
                    <el-button size="small" type="primary" @click="goCommit()" v-if="commitBtn">评价</el-button>
                    <el-button size="small" type="primary" @click="goBack()" v-if="showBack">返回</el-button>
                </div> -->
            </div>
            <slot></slot>
        </div>
        <div class="cus_panel_btns" v-if="showBtn">
            <el-button size="small" type="primary" @click="submit">提交</el-button>
            <el-button size="small" @click="cancel">取消</el-button>
        </div>
    </div>
</template>

<script setup>
/* --------------------- 引用 --------------------- */
import { ref, inject } from 'vue'
const $message = inject('$message')
/* ----------------- props 和 emit ---------------- */
const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    titleCenter:{
        type: String,
        default: 'center',
    },
    showBtn: {
        type: Boolean,
        default: false,
    },
    commitBtn: {
        type: Boolean,
        default: false,
    },
    showBack: {
        type: Boolean,
        default: false,
    },
    gotoBack: {
        type: Boolean,
        default: false,
    },
    showHistory: {
        type: Boolean,
        default: false,
    },
    goBackFn: {
        type: Function,
    },
})
const emit = defineEmits(['commitInfo'])

/* ----------------- 方法 ---------------- */

const goCommit = () => {
    emit('commitInfo')
}

const goBack = () => {
    if (props.goBackFn) {
        props.goBackFn()
        return
    }
}
const submit = () => {
    emit('submit')
}
const cancel = () => {
    $message.confirm('确认取消吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        goBack()
    })
}
</script>

<style lang="scss" scoped>
.panel {
    margin: 24px 0;
    margin-top: 0;
    background: #fff;
    padding: 24px;
    padding-top: 0;
    overflow: hidden;
    clear: both;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    .show-border {
        border-bottom: 1px solid #f2f2f2;
    }
    .title {
        border-bottom: 1px solid #f2f2f2;
        width: 100%;
        height: 55px;
        display: flex;
        align-items: center;
        margin-bottom: 24px;
        margin-left: -24px;
        padding-left: 24px;
        box-sizing: content-box;
        padding-right: 24px;
        p {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.85);
            line-height: 55px;
            font-weight: bold;
            flex: 1;
            text-align: center;
        }
    }
}
.cus_panel {
    position: relative;
    .cus_panel_btns {
        margin-left: 24px;
        padding-bottom: 24px;
        button {
            width: 140px;
        }
    }
}
</style>
