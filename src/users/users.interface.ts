export interface IUser {
    _id: string,
    email: string,
    fullname: string,
    role: string,
    permissions?: {
        _id: string;
        name: string;
        apiPath: string;
        module: string;
    }[]
}