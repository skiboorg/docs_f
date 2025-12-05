export default defineNuxtRouteMiddleware(async (to, from) => {
  if(to.meta.auth || to.meta.guest){
    const authStore = useAuthStore();

    if(to.meta.auth && !authStore.user){
      return navigateTo({ name: 'index' })
    }
    else if(to.meta.guest && authStore.user){
      return navigateTo({ name: 'workspace' })
    }
  }
})
