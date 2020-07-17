import {IUserID} from '@modules/core/users'
import {AUTH_TOKEN_TYPE, ITokenInfo, LongDate, UUID} from '@example/infra'


export interface IUserSession {
    userId: IUserID
    uuid: UUID
    expiredAt: LongDate
    tokenType: AUTH_TOKEN_TYPE
}

export interface ILoginRequestDTO {
    email: string
    password: string
}

export interface IRefreshTokenRequestDTO {
    token: string
}

export interface IRegisterRequestDTO {
    email: string
    password: string
    name: string
}

export interface ICreatedToken {
    jwt: string
    refresh: string
    refreshExpiredAt: LongDate
    jwtExpiredAt: LongDate
}

export interface ILoginResponseDTO extends ICreatedToken {
    userId: IUserID
}

export interface IAuthService {
    login(data: ILoginRequestDTO): Promise<ILoginResponseDTO>

    register(data: IRegisterRequestDTO): Promise<ILoginResponseDTO>
}

export interface ISessionService {
    createSession(data: ITokenInfo): Promise<ICreatedToken>

    refreshSession(data: IRefreshTokenRequestDTO): Promise<ICreatedToken>
}
