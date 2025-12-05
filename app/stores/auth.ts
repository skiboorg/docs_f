import type {IUser} from "~/repository/auth/types";

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IUser | null>(null)

  const  setUser = async (currentUser: IUser | null)=> {
    user.value = currentUser;
  }


  return {
    user,
    setUser };
})
