export interface ISummaryAPIResponse {
    count:    number;
    next:     null;
    previous: null;
    results:  ISummaryResults;
}

export interface ISummaryResults {
    columns: Column[];
    rows:    Row[];
    legend:  Legend;
}

export interface Column {
    key:  number;
    name: string;
}

export interface Legend {
    approved:      IStatus;
    expired:       IStatus;
    not_yet_valid: IStatus;
    on_approval:   IStatus;
    rejected:      IStatus;
    missing:       IStatus;
    not_required:  IStatus;
    valid:         IStatus;
}

export interface IStatus {
    color:   string;
    icon:    string;
    label:   string;
    status?: StatusLabel;
}

export enum StatusLabel {
    Approved = "approved",
    Missing = "missing",
    NotRequired = "not_required",
}

export interface Row {
    company:   RowCompany;
    documents: { [key: string]: DocumentValue };
}

export interface RowCompany {
    id:           number;
    uuid:         string;
    name:         string;
    inn:          string;
    company_type: string;
}

export interface DocumentValue {
    color:          string;
    icon:           string;
    label:          string;
    status?:        StatusLabel;
    company?:       DocumentCompany;
    document?:      DocumentDocument | null;
    document_type?: null;
    version?:       number;
    valid_from?:    null;
    valid_until?:   null;
}

export interface DocumentCompany {
    uuid:         string;
    name:         string;
    company_type: CompanyType;
    inn:          string;
}

export interface CompanyType {
    id:   number;
    name: string;
}

export interface DocumentDocument {
    uuid:               string;
    document_type:      number;
    document_type_name: string;
    company_name:       string;
    name:               string;
}
