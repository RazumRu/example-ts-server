import {DataTransferObject, IsDefined, IsNumber, IsNumberEnum, IsOptional} from '@example/server'
import {ITransactionResponseDTO} from '../abstract/payment.abstract'
import {IsNotEmpty, IsString} from '@example/server'
import {TRANSACTION_TYPE} from '@modules/core/payments/config'

export default class TransactionResponseDTO extends DataTransferObject
    implements ITransactionResponseDTO {
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    public hash: string

    @IsNumberEnum(TRANSACTION_TYPE)
    @IsDefined()
    public type: TRANSACTION_TYPE

    @IsNumber()
    @IsDefined()
    public value: number

    @IsString()
    @IsOptional()
    public text?: string

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    public from: string

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    public to: string

    @IsNumber()
    @IsDefined()
    public gas: number

    @IsNumber()
    @IsDefined()
    public gasPrice: number

    constructor(data: ITransactionResponseDTO) {
        super()

        this.hash = data.hash
        this.type = data.type
        this.value = data.value
        this.text = data.text
        this.from = data.from
        this.to = data.to
        this.gas = data.gas
        this.gasPrice = data.gasPrice
    }
}
