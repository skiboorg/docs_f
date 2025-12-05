// Интерфейс для тега/алиаса
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

