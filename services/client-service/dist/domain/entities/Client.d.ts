export interface ClientProps {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: Address;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export declare class Client {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone: string;
    readonly address: Address;
    readonly isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
    static create(props: ClientProps): Client;
    update(props: Partial<Omit<ClientProps, 'id' | 'createdAt'>>): Client;
    deactivate(): Client;
    activate(): Client;
}
