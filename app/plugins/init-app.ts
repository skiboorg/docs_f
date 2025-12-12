// import ToastService from 'primevue/toastservice';
// export default defineNuxtPlugin({
//   name: 'init-app',
//   dependsOn: ['fetch'],
//   parallel: true,
//   async setup(app){
//     const { $api } = useNuxtApp();
//     const settingsStore = useSettingsStore()
//     const {fetchMainMenu} = settingsStore
//
//     const auth_token = useCookie('auth_token')
//     if (auth_token.value){
//       await $api.auth.me()
//       await fetchMainMenu()
//     }
//   }
// });

import ToastService from 'primevue/toastservice';
export default defineNuxtPlugin(async (nuxtApp):Promise<any> => {
  nuxtApp.vueApp.use(ToastService)
  const { $api } = useNuxtApp();
  const settingsStore = useSettingsStore()
  const {fetchMainMenu} = settingsStore

  const auth_token = useCookie('auth_token')
  if (auth_token.value){
    await $api.auth.me()
    await fetchMainMenu()
  }
})