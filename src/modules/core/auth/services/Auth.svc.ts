import {inject, injectable} from 'inversify'
import {INJECT_SERVICE} from '@src/config'
import {
    IAuthService,
    ILoginRequestDTO, ILoginResponseDTO,
    IRegisterRequestDTO,
    ISessionService
} from '@modules/core/auth'
import {IUserService} from '@modules/core/users'
import {AUTH_TOKEN_TYPE} from '@example/infra'
import LoginResponseDTO from '@modules/core/auth/dto/LoginResponse.dto'

@injectable()
export default class AuthService implements IAuthService {
    @inject(INJECT_SERVICE.SESSION_SERVICE)
    private readonly sessionService: ISessionService

    @inject(INJECT_SERVICE.USER_SERVICE)
    private readonly userService: IUserService

    public async login(data: ILoginRequestDTO): Promise<ILoginResponseDTO> {
        const user = await this.userService.getUserByCriteria({
            email: data.email
        }, 'password')

        this.userService.checkPass(data.password, user.password)

        const token = await this.sessionService.createSession({
            tokenType: AUTH_TOKEN_TYPE.USER,
            userId: user._id
        })

        return new LoginResponseDTO({
            ...token,
            userId: user._id
        })
    }

    public async register(data: IRegisterRequestDTO): Promise<ILoginResponseDTO> {
        data.password = this.userService.encryptPass(data.password)
        const user = await this.userService.createUser(data)

        const token = await this.sessionService.createSession({
            tokenType: AUTH_TOKEN_TYPE.USER,
            userId: user._id
        })

        return new LoginResponseDTO({
            ...token,
            userId: user._id
        })
    }
}
