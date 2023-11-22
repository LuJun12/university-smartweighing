<template>
    <div class="yq-page-container yq-page-container--no-padding yq-flex-column">
        <CardPanel class="yq-flex-1" size="small">
            <Building></Building>
        </CardPanel>
    </div>
</template>
<script setup>
/* --------------------- 引用 --------------------- */
import { ref, reactive, inject, watch, computed, onMounted } from 'vue'

/* ----------------- 实例化和注入 ------------------ */
const $api = inject('$api')

/* ----------------- props 和 emit ---------------- */
const props = defineProps({})

/* ------------------ 变量和方法 ------------------ */

/* ------------------- computed ------------------- */

/* --------------------- watch -------------------- */

/* -------------------- 初始化 -------------------- */

/* ------------------- 生命周期 ------------------- */
onMounted(() => {})
</script>

<style lang="less" scoped></style>
