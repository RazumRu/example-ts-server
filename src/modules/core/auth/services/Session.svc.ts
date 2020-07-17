import {ERROR_CODE, INJECT_SERVICE} from '@src/config'
import {inject, injectable} from 'inversify'
import jsonwebtoken from 'jsonwebtoken'
import ms from 'ms'
import * as uuid from 'uuid'
import {
    ICreatedToken,
    IRefreshTokenRequestDTO,
    ISessionService,
    IUserSession
} from '@modules/core/auth'
import {IRedisClient, ITokenInfo} from '@example/infra'
import {IAppConfigService} from '@modules/common/config/abstract'
import {NotFoundError} from '@example/errors'

@injectable()
export default class SessionService implements ISessionService {
    private redisClient: IRedisClient

    @inject(INJECT_SERVICE.APP_CONFIG_SERVICE)
    private readonly appConfigService: IAppConfigService

    constructor(
        @inject(INJECT_SERVICE.REDIS_FACTORY)
        redisFactory: () => IRedisClient
    ) {
        this.redisClient = redisFactory()
    }

    public async createSession(data: ITokenInfo): Promise<ICreatedToken> {
        const token = await this.createToken(data)

        const session: IUserSession = {
            userId: data.userId,
            uuid: token.refresh,
            expiredAt: token.refreshExpiredAt,
            tokenType: data.tokenType
        }

        await this.redisClient.set(
            token.refresh,
            JSON.stringify(session),
            'ex',
            Math.ceil((token.refreshExpiredAt - Date.now()) / 1000)
        )

        return token
    }

    public async refreshSession(
        tokenData: IRefreshTokenRequestDTO
    ): Promise<ICreatedToken> {
        const sessionJson = await this.redisClient.get(tokenData.token)

        if (!sessionJson) {
            throw new NotFoundError(ERROR_CODE.SESSION_NOT_FOUND)
        }

        const session: IUserSession = JSON.parse(sessionJson)

        await this.redisClient.del(tokenData.token)

        const data: ITokenInfo = {
            userId: session.userId,
            tokenType: session.tokenType
        }

        return this.createSession(data)
    }

    private createToken(data: ITokenInfo): ICreatedToken {
        const authConfig = this.appConfigService.getAuthConfig()

        const jwt = jsonwebtoken.sign(data, authConfig.jwtSecretKey, {
            expiresIn: authConfig.jwtExpiresIn
        })

        const refreshExpiredAt: number = Date.now() + ms(authConfig.jwtRefreshExpiresIn)
        const jwtExpiredAt = Date.now() + ms(authConfig.jwtExpiresIn)
        const refresh = uuid.v4()

        return {jwt, refresh, refreshExpiredAt, jwtExpiredAt}
    }
}
