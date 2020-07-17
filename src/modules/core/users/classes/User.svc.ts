import {IUser, IUserID, IUserModel, IUserService} from '@modules/core/users'
import {injectable} from 'inversify'
import {UserModel} from '@src/models/User.model'
import {NotFoundError, ValidationError} from '@example/errors'
import {ERROR_CODE} from '@src/config'
import {QueryProjection} from '@example/mongoose'
import bcrypt from 'bcrypt-nodejs'

@injectable()
export default class UserService implements IUserService {
    public async createUser(data: IUser): Promise<IUserModel> {
        return UserModel.create(data)
    }

    public async getUserById(userId: IUserID, projection?: QueryProjection): Promise<IUserModel> {
        const user = await UserModel
            .findById(userId, projection)
            .lean().exec()

        if (!user) {
            throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND)
        }

        return user
    }

    public async getUserByCriteria(data: any, projection?: QueryProjection): Promise<IUserModel> {
        const user = await UserModel
            .findOne(data, projection)
            .lean().exec()

        if (!user) {
            throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND)
        }

        return user
    }

    public encryptPass(pass: string): string {
        return bcrypt.hashSync(pass)
    }

    public checkPass(pass: string, hash: string): void {
        if (!bcrypt.compareSync(pass, hash)) {
            throw new ValidationError(ERROR_CODE.PASSWORD_INCORRECT)
        }
    }
}
