
export interface IMenuItem {
    id:            number;
    menu_items?:   IMenuItem[];
    page:          Page | null;
    order_num:     number;
    label:         string;
    icon:          null;
    role_can_view: number[];
    menu_item?:    number;
}

export interface Page {
    id:          number;
    permissions: PagePermission[];
    label:       string;
    url:         string;
}

export interface PagePermission {
    id:          number;
    role:        Role;
    permissions: PermissionPermission[];
    page:        number;
}

export interface PermissionPermission {
    id:         number;
    name:       string;
    slug:       string;
    can_edit:   boolean;
    can_add:    boolean;
    can_view:   boolean;
    can_delete: boolean;
}

export interface Role {
    id:                 number;
    permission:         null;
    name:               string;
    slug:               string;
    is_franchise_admin: boolean;
}


