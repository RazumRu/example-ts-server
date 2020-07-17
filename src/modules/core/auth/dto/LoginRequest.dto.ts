import {DataTransferObject, IsDefined} from '@example/server'
import {ILoginRequestDTO} from '../abstract'
import {IsEmail, IsNotEmpty, IsPassword} from '@example/server'

export default class LoginRequestDTO extends DataTransferObject implements ILoginRequestDTO {
    @IsEmail()
    @IsNotEmpty()
    @IsDefined()
    public email: string

    @IsPassword()
    @IsDefined()
    @IsNotEmpty()
    public password: string

    constructor(data: ILoginRequestDTO) {
        super()

        this.email = data.email
        this.password = data.password
    }
}
