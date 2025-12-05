import type {IDocumentType} from "~/repository/document/types";

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
        create_tag(body){
            return appFetch('/api/document/document-tags/',{
                method: 'POST',
                body
            })
        },
        delete_type(id){
            return appFetch(`/api/document/document-types/${id}/`,{
                method: 'DELETE',
            })
        },
    }
}
