import {IMongoModel, IObjectID, QueryProjection} from '@example/mongoose'

export interface IUserID extends IObjectID {}

export interface IUser {
    name: string
    password: string
    email: string
}

export interface IUserModel extends IMongoModel, IUser {}

export interface IUserService {
    createUser(data: IUser): Promise<IUserModel>
    getUserById(userId: IUserID, projection?: QueryProjection): Promise<IUserModel>
    getUserByCriteria(data: any, projection?: QueryProjection): Promise<IUserModel>
    encryptPass(pass: string): string
    checkPass(pass: string, hash: string): void
}
