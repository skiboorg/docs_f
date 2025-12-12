import type {IDocumentType, IDocumentResponse, IVersionResponseResult} from "~/repository/document/types";
import type {ICompanyListResponse} from "~/repository/company/types";

export function createDocumentRepository(appFetch: typeof $fetch){

    return {
        types(){
            return appFetch<IDocumentType[]>('/api/document/document-types/')
        },
        tags(){
            return appFetch<IDocumentType[]>('/api/document/document-tags/')
        },
        create_type(body){
            return appFetch('/api/document/document-types/',{
                method: 'POST',
                body
            })
        },
        update_type(body){
            return appFetch(`/api/document/document-types/${body.id}/`,{
                method: 'PATCH',
                body
            })
        },
        create_tag(body){
            return appFetch('/api/document/document-tags/',{
                method: 'POST',
                body
            })
        },
        upload(body){
            return appFetch('/api/document/documents/upload/',{
                method: 'POST',
                body
            })
        },
        delete_type(id){
            return appFetch(`/api/document/document-types/${id}/`,{
                method: 'DELETE',
            })
        },
        all(params:{
            query: Record<string, any>,
        }){
            const formattedQueryString = getQueryString(params.query)
            return appFetch<IDocumentResponse>(`/api/document/documents/?${formattedQueryString}`)
        },
        versions(params:{
            query: Record<string, any>,
        }){
            const formattedQueryString = getQueryString(params.query)
            return appFetch<IVersionResponseResult>(`/api/document/document-versions/?${formattedQueryString}`)
        },
        version_action(params:{
            uuid:string
            action: 'approve' | 'reject',
        }){
            return appFetch(`/api/document/document-versions/${params.uuid}/${params.action}/`,{
                method: 'POST'
            })
        }
    }
}
