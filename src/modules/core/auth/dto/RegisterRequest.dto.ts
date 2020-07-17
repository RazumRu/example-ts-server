import {DataTransferObject, IsDefined, IsValidEmail} from '@example/server'
import {IRegisterRequestDTO} from '../abstract'
import {IsNotEmpty, IsPassword, IsString, PropDescription} from '@example/server'

export default class RegisterRequestDTO extends DataTransferObject implements IRegisterRequestDTO {
    @IsValidEmail()
    @IsNotEmpty()
    @IsDefined()
    public email: string

    @IsPassword()
    @IsDefined()
    @IsNotEmpty()
    public password: string

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    @PropDescription('Just name and surname')
    public name: string

    constructor(data: IRegisterRequestDTO) {
        super()

        this.email = data.email
        this.password = data.password
        this.name = data.name
    }
}
