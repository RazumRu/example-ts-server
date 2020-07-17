import {DataTransferObject, IsDefined, IsNumber, IsNumberEnum} from '@example/server'
import {IPaymentAccountResponseDTO} from '../abstract/payment.abstract'
import {IsNotEmpty, IsString} from '@example/server'
import {ACCOUNT_TYPE} from '@modules/core/payments/config'

export default class PaymentAccountResponseDTO extends DataTransferObject
    implements IPaymentAccountResponseDTO {
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    public address: string

    @IsNumber()
    @IsDefined()
    public balance: number

    @IsNumberEnum(ACCOUNT_TYPE)
    @IsDefined()
    public type: ACCOUNT_TYPE

    constructor(data: IPaymentAccountResponseDTO) {
        super()

        this.address = data.address
        this.balance = data.balance
        this.type = data.type
    }
}
