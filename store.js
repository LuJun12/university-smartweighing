import { defineStore } from 'pinia'
import storage from '@/tools/storage'

export const useSmartweighingStore = defineStore('smartweighing', {
    // 持久化
    persist: {
        /**
         * 缓存读写方式，默认：localStorage
         * 必须具有 getItem: (key: string) => string | null 和 setItem: (key: string, value: string) => void 方法
         * 考虑到需要加密存储，所有这里调用 storage 模块，
         */
        storage: {
            getItem: key => storage.get(key),
            setItem: (key, value) => storage.set(key, value, 720),
        },
        // 缓存名称
        key: 'smartweighingStore',
        /**
         * 需要持久化的属性路径，例如：['userId', 'userInfo.userName']
         * 为空数组时，认为不需要为任何属性做持久化
         * 为 undefined 或 null 时，认为需要为所有属性做持久化
         */
        paths: [],
    },
    state: () => ({

    }),
    getters: {},
    actions: {},
})()
