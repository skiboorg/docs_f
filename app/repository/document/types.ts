// Интерфейс для тега/алиаса
import type {ICompanyType, ICompany} from "~/repository/company/types";

export interface IDocumentTag {
    id: number;
    name: string;
}


// Интерфейс для типа документа
export interface IDocumentType {
    id: number;
    name: string;
    aliases: IDocumentTag[];
    applicable_company_types: ICompanyType[];
}

export interface IDocumentResponse {
    count: number
    next: any
    previous: any
    results: IDocumentResponseResult[]
}

export interface IDocumentResponseResult {
    id: number
    name: string
    company: ICompany
    document_type: number
    document_type_name: string
    versions: IVersion[]
}

export interface IDocumentShort {
    id: number
    name: string
    company_name:string
    document_type: number
    document_type_name: string
}


export interface IVersion {
    uuid: string
    version: number
    file: string
    file_size: string
    status: IVersionStatus
    upload_date: string
    valid_from: any
    valid_until: any
    uploaded_by: UploadedBy
    reviewed_by: UploadedBy
    review_date: any
    comment: string
    rejection_reason: string
    is_active: boolean
    is_current: boolean
    document: IDocumentShort
}

export interface IVersionStatus {
    code: string
    color: string
    icon: string
    label: string
}

export interface UploadedBy {
    uuid: string
    email: string
}



export interface IVersionResponseResult {
    count: number
    next: any
    previous: any
    results: IVersion[]
    document: IDocumentShort
}

