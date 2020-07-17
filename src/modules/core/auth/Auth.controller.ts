import {INJECT_SERVICE, OPERATIONS, SPECS} from '@src/config'
import {inject} from 'inversify'
import {Body, Controller, Description, OperationID, Post, Response, Spec} from '@example/server'
import {ChildBaseController} from '@example/infra'
import {IAuthService, ILoginRequestDTO, IRegisterRequestDTO} from '@modules/core/auth/abstract'
import LoginRequestDTO from '@modules/core/auth/dto/LoginRequest.dto'
import RegisterRequestDTO from '@modules/core/auth/dto/RegisterRequest.dto'
import LoginResponseDTO from '@modules/core/auth/dto/LoginResponse.dto'

@Controller('auth')
@Spec(
    SPECS.AUTH,
    'Auth API'
)
export default class AuthController extends ChildBaseController {
    @inject(INJECT_SERVICE.AUTH_SERVICE)
    private readonly authService: IAuthService

    @Post('login')
    @Description('Login method')
    @OperationID(OPERATIONS.LOGIN)
    @Response(200, LoginResponseDTO)
    public async login(
        @Body(LoginRequestDTO) data: ILoginRequestDTO
    ) {
        return this.authService.login(data)
    }

    @Post('register')
    @Description('Register method')
    @OperationID(OPERATIONS.REGISTER)
    @Response(200, LoginResponseDTO)
    public async register(
        @Body(RegisterRequestDTO) data: IRegisterRequestDTO
    ) {
        return this.authService.register(data)
    }
}
