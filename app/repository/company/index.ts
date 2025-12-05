import type {ICompanyListResponse, ICompanyType} from "~/repository/company/types";

export function createCompanyRepository(appFetch: typeof $fetch){

    return {
        all(params:{
            query: Record<string, any>,
        }){
            const formattedQueryString = getQueryString(params.query)
            return appFetch<ICompanyListResponse>(`/api/company/companies/?${formattedQueryString}`)
        }
        ,types(){
            return appFetch<ICompanyType[]>('/api/company/company-types/')
        },
        create(body){
            return appFetch('/api/company/companies/',{
                method: 'POST',
                body
            })
        },
        delete(id){
            return appFetch(`/api/company/companies/${id}/`,{
                method: 'DELETE',
            })
        },
        update(body){
            return appFetch(`/api/company/companies/${body.id}/`,{
                method: 'PATCH',
                body
            })
        },
    }
}
