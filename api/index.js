// 把所有api整合到一起
let api = {}
const moduleApis = import.meta.glob('./**.api.js', { eager: true })
for (const key in moduleApis) {
    const moduleApi = moduleApis[key]
    api = Object.assign(api, moduleApi)
}

export default {
    ...api
}
