export interface IAuthConfig {
    jwtSecretKey: string
    jwtExpiresIn: string
    jwtRefreshExpiresIn: string
}

export interface IWeb3Config {
    provider: string
    accountKey: string
    transactionLifeTime: number
}

export interface IAppConfigService {
    getAuthConfig(): IAuthConfig
    getWeb3Config(): IWeb3Config
}
