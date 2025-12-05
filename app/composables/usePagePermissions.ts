import type {IExtraPermission} from "~/repository/auth/types";


export const usePagePermissions = () => {

    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()

    const { user } = authStore
    const { menuItems } = storeToRefs(settingsStore)

    const pagePermissions = ref({})
    const pageCanViewRoles = ref([])

    const route = useRoute()

    const user_is_admin = computed(() => user?.role?.is_franchise_admin)
    const role_id = computed(() => user?.role?.id)

    const extra_permissions: IExtraPermission = computed(() => {
        return {

        }
    })

    const findPermissionsByUrlAndRoleId = (url: string, roleId: number) => {
        const normalizedUrl = url.split('?')[0] // удаляем query параметры

        const searchInPage = (menuItem) => {
            if (menuItem.page?.url === normalizedUrl) {
                pageCanViewRoles.value = menuItem.role_can_view
                menuItem.page.permissions.forEach(permission => {
                    if (permission.role.id === roleId) {
                        // pagePermissions.value = permission.permissions[0]
                        const { can_edit, can_add, can_view, can_delete } = permission.permissions[0]
                        pagePermissions.value = { can_edit, can_add, can_view, can_delete }
                    }
                })
            }
        }

        menuItems.value.forEach(menuItem => {
            if (menuItem.page) {
                searchInPage(menuItem)
            }

            if (menuItem.menu_items && menuItem.menu_items.length > 0) {
                menuItem.menu_items.forEach(subMenuItem => {
                    if (subMenuItem.page) {
                        searchInPage(subMenuItem)
                    }
                })
            }
        })
    }

    const getPermission = () => {
        console.log('getPermission',user?.role?.id)
        const pathWithoutQuery = route.fullPath.split('?')[0]
        return findPermissionsByUrlAndRoleId(pathWithoutQuery, user?.role?.id)
    }

    watchEffect(() => {
        if (menuItems.value.length > 0 && user?.role?.id) {
            getPermission()
        }
    })

    getPermission()

    return{
        pagePermissions,
        pageCanViewRoles,
        getPermission,
        user_is_admin,
        role_id,
        extra_permissions
    }

}