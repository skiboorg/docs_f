import type {IMenuItem} from "~/repository/common/types";

export function createCommonRepository(appFetch: typeof $fetch){

    return {
        fetchMainMenu(){
            return appFetch<IMenuItem[]>('/api/shared/main_menu')
        },
    }
}
