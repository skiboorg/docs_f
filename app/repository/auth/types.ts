import type {IFranchise} from "~/repository/common/types";
import type {IDiscountGroup} from "~/repository/franchise/types";

export interface IExtraPermission{
    is_franchise_admin: boolean;
    can_create_tender_user: boolean;
    can_give_away_order: boolean;
    can_use_kkm: boolean;
    can_see_all_orders: boolean;
    can_see_all_clients: boolean;
    can_see_all_bills: boolean;
    can_add_new_articles: boolean;
    can_add_bulk_new_articles: boolean;
}

export interface IRole {
    id:                     number;
    permission:             null;
    name:                   string;
    slug:                   string;
    is_franchise_admin:     boolean;
    can_see_all_orders:     boolean;
    can_see_all_clients:    boolean;
    can_see_all_bills:      boolean;
    can_create_tender_user: boolean;
    can_give_away_order:    boolean;
    can_use_kkm:            boolean;
    can_add_new_articles:   boolean;
    can_add_bulk_new_articles:   boolean;
}


export interface IUserResponse {
    results:IUser[]
    count: number
    next: string | null
    previous: string |  null
}

export interface IUser {
    id?:                               number;
    notifications?:                    number;
    profile?:                          IProfile | null;
    organization?:                     IOrganization | null;
    franchise?:                        IFranchise;
    role?:                             IRole;
    manager:                          IManager;
    cars?:                             any[];
    discount_group:                   IDiscountGroup;
    confirm_id?:                       string;
    last_login?:                       Date;
    is_superuser?:                     boolean;
    is_staff?:                         boolean;
    is_active?:                        boolean;
    date_joined?:                      Date;
    photo?:                            string;
    fio:                              string;
    phone:                            string;
    uuid?:                             string;
    email:                            string;
    order_action?:                     null;
    credit_limit?:                     string;
    auto_generate_invoice?:            boolean;
    send_email?:                       boolean;
    display_second_pricelist_name?:    boolean;
    send_sms?:                         boolean;
    show_warehouse_info?:              boolean;
    prevent_auto_discount_assignment?: boolean;
    max_api_requests?:                 number;
    balance?:                          string;
    moderated_balance?:                string;
    in_work_balance?:                  string;
    to_issue_balance?:                 string;
    turnover_mt?:                      string;
    turnover_mp?:                      string;
    turnover_total?:                   string;
    is_online?:                        boolean;
    is_franchise_staff?:               boolean;
    is_default_manager?:               boolean;
    is_organization_member?:           boolean;
    is_tender_member?:                 boolean;
    is_tender_manager?:                boolean;
    can_edit_profile?:                 boolean;
    comment?:                          null;
    user_type?:                        null;
    city?:                             null;
    groups?:                           any[];
    user_permissions?:                 any[];
    extra_managers?:                   number[];
    password?:                      string;
    repeat_password?:                      string;
}


export interface ILoginPayload {
    login:string | null
    password:string | null
}

export interface ILoginResponse {
    auth_token:string
}


export interface IManager {
    id:                 number;
    uuid:               string;
    photo:              null;
    fio:                null;
    phone:              null;
    email:              string;
    role:               null;
    is_default_manager: boolean;
    franchise:          null;
    is_franchise_staff: boolean;
    role_name:          string;
}


export interface IProfile {
    id:                                    number;
    uuid:                                  string;
    created_at:                            Date;
    updated_at:                            Date;
    alt_phone:                             null;
    skype:                                 null;
    www_url:                               null;
    registration_address:                  null;
    registration_address_latitude:         null;
    registration_address_longitude:        null;
    registration_address_index:            null;
    registration_address_region:           null;
    registration_address_city:             null;
    registration_address_street:           null;
    registration_address_house:            null;
    registration_address_apartment_office: null;
    delivery_address:                      null;
    delivery_address_latitude:             null;
    delivery_address_longitude:            null;
    delivery_address_index:                null;
    delivery_address_region:               null;
    delivery_address_city:                 null;
    delivery_address_street:               null;
    delivery_address_house:                null;
    delivery_address_apartment_office:     null;
    basis:                                 null;
    discount_card_number:                  null;
    comment:                               null;
}

export interface IOrganization {
    id:                      number;
    uuid:                    string;
    created_at:              Date;
    updated_at:              Date;
    ownership_type:          string;
    company_name:            string;
    company_name_alt:        string;
    INN:                     string;
    KPP:                     string;
    bank_name:               string;
    BIK:                     string;
    OGRN:                    string;
    OKPO:                    string;
    correspondent_account:   string;
    account_number:          string;
    works_with_VAT:          boolean;
    email_copy:              null;
    latitude_legal:          null;
    longitude_legal:         null;
    index_legal:             string;
    region_legal:            string;
    city_legal:              string;
    street_legal:            string;
    house_legal:             string;
    apartment_office_legal:  string;
    latitude_actual:         null;
    longitude_actual:        null;
    index_actual:            string;
    region_actual:           string;
    city_actual:             string;
    street_actual:           string;
    house_actual:            string;
    apartment_office_actual: string;
    members:                 number[];
}