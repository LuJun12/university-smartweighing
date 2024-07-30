<template>
    <ElPlusDialog
        v-model="mainDialog.visible"
        @confirm="mainDialog.confirm"
        width="602px"
        title="添加成员类型"
        append-to-body
        confirmButtonText="确认选择"
        @open="mainDialog.onOpen"
        @close="mainDialog.onClose"
    >
        <el-transfer
            v-model="mainDialog.value"
            :props="{
                key: 'personTypeId',
                label: 'personTypeName',
            }"
            :titles="['可选择成员类型', '已选择成员类型']"
            filterable
            filter-placeholder="成员类型搜索"
            :data="list"
        />
    </ElPlusDialog>
</template>

<script setup>
import api from '@smartweighing/api'
import { inject, reactive, computed } from 'vue'

/* ----------------- props 和 emit ---------------- */
const props = defineProps({
    // 【双向绑定】是否显示对话框
    modelValue: {
        type: Boolean,
        default: false,
    },
    list: {
        type: Array,
        default: () => [],
    },
    selectedList: {
        type: Array,
        default: () => [],
    },
})
const emits = defineEmits(['confirm', 'update:modelValue'])

const $storage = inject('$storage')

const mainDialog = reactive({
    visible: computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emits('update:modelValue', value)
        },
    }),
    value: [],
    onOpen() {
        mainDialog.value = props.selectedList
    },
    onClose() {},
    confirm() {
        mainDialog.visible = false
        emits('confirm', mainDialog.value)
    },
})
</script>
