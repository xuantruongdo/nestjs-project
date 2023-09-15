export interface IUser {
    _id: string,
    email: string,
    fullname: string,
    age: number,
    gender: string,
    address: string,
    role: string,
    permissions?: {
        _id: string;
        name: string;
        apiPath: string;
        module: string;
    }[]
}