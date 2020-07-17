import {DataTransferObject, IsDefined, IsNumber, IsUUID} from '@example/server'
import {ITempTransactionResponseDTO} from '../abstract/payment.abstract'
import {IsNotEmpty} from '@example/server'
import {UUID} from '@example/infra'

export default class TempTransactionResponseDTO extends DataTransferObject
    implements ITempTransactionResponseDTO {
    @IsUUID()
    @IsDefined()
    @IsNotEmpty()
    public id: UUID

    @IsNumber()
    @IsDefined()
    public tax: number

    constructor(data: ITempTransactionResponseDTO) {
        super()

        this.id = data.id
        this.tax = data.tax
    }
}
