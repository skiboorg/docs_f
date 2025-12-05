import type {ILoginPayload, ILoginResponse, IUser} from "~/repository/auth/types";
import {useAuthStore} from "~/stores/auth";

export function createAuthRepository(appFetch: typeof $fetch){
  const {setUser} = useAuthStore()
  const authCookie = useCookie('auth_token')

  return {

    login(body: ILoginPayload){
      return appFetch<ILoginResponse>('/auth/token/login/', {
        method: 'post',
        body
      });
    },
    async logout(){
      await appFetch('/api/auth/logout',{method:'POST'})
      authCookie.value = null
      window.location.reload()
    },
    async me(){
      try{
        const response =  await appFetch<IUser>('/api/auth/me')
        setUser(response)
      }catch(error){
        console.log(error)
        //authCookie.value = null
        //window.location.reload()
      }

    }

  }
}
