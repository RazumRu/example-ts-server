import {ChildMongooseModel, Field, mongoose, Schema} from '@example/mongoose'
import {IUserID} from '@modules/core/users'
import {IPaymentAccount} from '@modules/core/payments/abstract/payment.abstract'
import {ACCOUNT_TYPE} from '@modules/core/payments/config'

@Schema()
class PaymentAccountModelContainer extends ChildMongooseModel implements IPaymentAccount {
    @Field({
        required: true,
        unique: true
    })
    public address: string

    @Field({
        required: true,
        unique: true
    })
    public privateKey: string

    @Field({
        required: true,
        type: Number
    })
    public type: ACCOUNT_TYPE

    @Field({
        required: true,
        type: mongoose.Schema.Types.ObjectId
    })
    public userId: IUserID
}

const PaymentAccountModel
    = PaymentAccountModelContainer.createModel<IPaymentAccount>('PaymentAccount')

export { PaymentAccountModel }
