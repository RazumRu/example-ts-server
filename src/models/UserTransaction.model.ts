import {ChildMongooseModel, Field, mongoose, Schema} from '@example/mongoose'
import {IUserID} from '@modules/core/users'
import {IUserTransaction} from '@modules/core/payments/abstract/payment.abstract'
import {TRANSACTION_TYPE} from '@modules/core/payments/config'

@Schema()
class UserTransactionModelContainer extends ChildMongooseModel implements IUserTransaction {
    @Field({
        required: true,
        unique: true
    })
    public hash: string

    @Field({
        required: true,
        type: Number
    })
    public type: TRANSACTION_TYPE

    @Field({
        required: true,
        index: true,
        type: mongoose.Schema.Types.ObjectId
    })
    public senderId: IUserID

    @Field({
        required: true,
        index: true,
        type: mongoose.Schema.Types.ObjectId
    })
    public receiverId: IUserID
}

const UserTransactionModel
    = UserTransactionModelContainer.createModel<IUserTransaction>('UserTransaction')

export { UserTransactionModel }
