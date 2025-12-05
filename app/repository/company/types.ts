// Базовые интерфейсы
interface BaseEntity {
    id: number;
    created_at: string; // ISO 8601 дата-время
    updated_at: string; // ISO 8601 дата-время
    uuid: string;
}

export interface ICompanyType extends BaseEntity {
    name: string;
}

// Основной интерфейс компании
export interface ICompany {
    uuid: string;
    inn: string;
    name: string;
    company_type: ICompanyType;
    director_name: string;
    founding_date: string; // YYYY-MM-DD
    authorized_capital: string; // Форматированная строка
}

// Интерфейс для ответа API с пагинацией
export interface ICompanyListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ICompany[];
}