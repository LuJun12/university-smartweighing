import { reactive, computed } from 'vue'

export const useChooseTag = () => {
    const state = reactive({
        show: false,
        tagList: [],
        selectedIdList: [],
        open() {
            state.show = true
        },
        onConfirm(e) {
            state.selectedIdList = e
        },
        close: i => {
            state.selectedIdList.splice(i, 1)
        },
    })
    const selectedList = computed(() => {
        const list = state.tagList.filter(tag => {
            return state.selectedIdList.includes(tag.id)
        })
        return list
    })

    return { state, selectedList }
}
