import {DataTransferObject, IsDefined} from '@example/server'
import {ILoginResponseDTO} from '../abstract'
import {IsLongDate, IsNotEmpty, IsObjectId, IsString} from '@example/server'
import {LongDate} from '@example/infra'
import {IUserID} from '@modules/core/users'

export default class LoginResponseDTO extends DataTransferObject implements ILoginResponseDTO {
    @IsObjectId()
    @IsDefined()
    @IsNotEmpty()
    public userId: IUserID

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    public jwt: string

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    public refresh: string

    @IsLongDate()
    @IsDefined()
    public refreshExpiredAt: LongDate

    @IsLongDate()
    @IsDefined()
    public jwtExpiredAt: LongDate

    constructor(data: ILoginResponseDTO) {
        super()

        this.jwt = data.jwt
        this.userId = data.userId
        this.refresh = data.refresh
        this.refreshExpiredAt = data.refreshExpiredAt
        this.jwtExpiredAt = data.jwtExpiredAt
    }
}
