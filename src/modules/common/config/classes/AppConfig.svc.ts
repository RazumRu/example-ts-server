import {IAppConfigService, IAuthConfig, IWeb3Config} from '@modules/common/config/abstract'
import {inject, injectable} from 'inversify'
import {IConfigService} from '@example/infra'
import {INJECT_SERVICE} from '@src/config'

@injectable()
export default class AppConfigService implements IAppConfigService {
    @inject(INJECT_SERVICE.CONFIG_SERVICE)
    private readonly configService: IConfigService

    public getAuthConfig(): IAuthConfig {
        return {
            jwtSecretKey: this.configService.getServerConfig().jwtSecretKey,
            jwtExpiresIn: this.configService.env('JWT_EXPIRES_IN', '30m'),
            jwtRefreshExpiresIn: this.configService.env('JWT_REFRESH_EXPIRES_IN', '30 days')
        }
    }

    public getWeb3Config(): IWeb3Config {
        return {
            provider: this.configService.env('WEB3_PROVIDER', 'ws://localhost:8545'),
            accountKey: this.configService.env('ETC_ACCOUNT_PRIVATE_KEY', ''),
            transactionLifeTime: +this.configService.env('TRANSACTION_LIFE_TIME', 300)
        }
    }
}
