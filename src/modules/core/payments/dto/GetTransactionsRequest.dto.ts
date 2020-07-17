import {
    DataTransferObject,
    IsNumber,
    IsOptional,
    IsObjectId, DefaultValue
} from '@example/server'
import {
    IGetTransactionsRequest
} from '../abstract/payment.abstract'
import {IUserID} from '@modules/core/users'

export default class GetTransactionsRequestDTO extends DataTransferObject
    implements IGetTransactionsRequest {
    @IsObjectId()
    @IsOptional()
    public beforeId?: IUserID

    @IsNumber()
    @IsOptional()
    @DefaultValue(50)
    public limit?: number

    constructor(data: IGetTransactionsRequest) {
        super()

        this.beforeId = data.beforeId
        this.limit = data.limit && +data.limit
    }
}
