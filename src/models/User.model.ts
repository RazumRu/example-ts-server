import {ChildMongooseModel, Field, Schema} from '@example/mongoose'
import {IUserModel} from '@modules/core/users'

@Schema()
class UserModelContainer extends ChildMongooseModel implements IUserModel {
    @Field({
        required: true
    })
    public name: string

    @Field({
        required: true
    })
    public password: string

    @Field({
        required: true,
        unique: true
    })
    public email: string
}

const UserModel = UserModelContainer.createModel<IUserModel>('User')

export { UserModel }
