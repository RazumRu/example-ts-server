import {
    DataTransferObject,
    IsDefined,
    IsNumber,
    IsString,
    IsOptional,
    PropDescription, IsObjectId
} from '@example/server'
import {ICreateUserTransactionRequestDTO} from '../abstract/payment.abstract'
import {IsNotEmpty} from '@example/server'
import {IUserID} from '@modules/core/users'

export default class CreateUserTransactionRequestDTO extends DataTransferObject
    implements ICreateUserTransactionRequestDTO {
    @IsObjectId()
    @IsDefined()
    @IsNotEmpty()
    public userId: IUserID

    @IsNumber()
    @IsDefined()
    @PropDescription('Transfer amount in eth')
    public value: number

    @IsString()
    @IsOptional()
    public text?: string

    constructor(data: ICreateUserTransactionRequestDTO) {
        super()

        this.userId = data.userId
        this.value = data.value
        this.text = data.text
    }
}
