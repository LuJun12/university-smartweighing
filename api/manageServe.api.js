import {
    axiosInstanceJSON,
    axiosInstanceForm,
    axiosInstanceFile,
    axiosInstanceFormData,
    handleAxiosPromise,
    axiosInstanceJSONDownload,
    axiosInstanceFormDownload,
    axiosInstanceFileDownload,
} from '@/tools/axiosInstance'

const apiServeUrl = import.meta.env.VITE_MANAGE_SERVER

export const manage = {
    async get(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceJSON({ method: 'get', url: apiServeUrl + url, params, headers, timeout }), showMessage)
    },
    async getDownload(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceJSONDownload({ method: 'get', url: apiServeUrl + url, params, headers, timeout }), showMessage)
    },
    async post(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceJSON.post(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async postDownload(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceJSONDownload.post(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async put(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceJSON.put(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async delete(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceJSON.delete(apiServeUrl + url, { data: params, headers, timeout }), showMessage)
    },
    async getF(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceForm({ method: 'get', url: apiServeUrl + url, params, headers, timeout }), showMessage)
    },
    async getFDownload(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFormDownload({ method: 'get', url: apiServeUrl + url, params, headers, timeout }), showMessage)
    },
    async postF(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceForm.post(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async postFDownload(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFormDownload.post(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async putF(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceForm.put(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async deleteF(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceForm.delete(apiServeUrl + url, { data: params, headers, timeout }), showMessage)
    },
    async getFD(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFormData({ method: 'get', url: apiServeUrl + url, params, headers, timeout }), showMessage)
    },
    async postFD(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFormData.post(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async putFD(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFormData.put(apiServeUrl + url, params, { headers, timeout }), showMessage)
    },
    async deleteFD(url, params, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFormData.delete(apiServeUrl + url, { data: params, headers, timeout }), showMessage)
    },
    async upload(url, formData, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFile.post(apiServeUrl + url, formData, { headers, timeout }), showMessage)
    },
    async uploadDownload(url, formData, headers, timeout, showMessage = true) {
        return await handleAxiosPromise(axiosInstanceFileDownload.post(apiServeUrl + url, formData, { headers, timeout }), showMessage)
    }
}
