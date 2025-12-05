import type { createAuthRepository } from '~/repository/auth'
import type { createCommonRepository } from '~/repository/common'
import type { createDocumentRepository } from "~/repository/document";
import type { createCompanyRepository } from "~/repository/company";

export type AuthRepository = ReturnType<typeof createAuthRepository>
export type CommonRepository = ReturnType<typeof createCommonRepository>
export type DocumentRepository = ReturnType<typeof createDocumentRepository>
export type CompanyRepository = ReturnType<typeof createCompanyRepository>

export interface IApi {
    auth: AuthRepository
    shared: CommonRepository
    document: DocumentRepository
    company: CompanyRepository
}