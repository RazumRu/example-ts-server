import {
    DataTransferObject,
    IsDefined,
    IsUUID
} from '@example/server'
import {IApproveTransactionRequestDTO} from '../abstract/payment.abstract'
import {IsNotEmpty} from '@example/server'
import {UUID} from '@example/infra'

export default class ApproveTransactionRequestDTO extends DataTransferObject
    implements IApproveTransactionRequestDTO {
    @IsUUID()
    @IsDefined()
    @IsNotEmpty()
    public id: UUID

    constructor(data: IApproveTransactionRequestDTO) {
        super()

        this.id = data.id
    }
}
