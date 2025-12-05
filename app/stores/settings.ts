import type {IMenuItem} from "~/repository/common/types";


export const useSettingsStore = defineStore('settings', () => {
    const { $api } = useNuxtApp()
    const menuItems = ref<IMenuItem[]>([])


    const fetchMainMenu = async () => {
        if (menuItems.value.length>0) return
        menuItems.value = await $api.shared.fetchMainMenu()
        console.log(menuItems.value)
    }

    return {
        menuItems,
        fetchMainMenu,

    }
})