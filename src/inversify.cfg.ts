import {INJECT_SERVICE} from '@src/config'
import {Container} from 'inversify'
import {IUserService, UserService} from '@modules/core/users'
import {IAuthService, ISessionService} from '@modules/core/auth'
import SessionService from '@modules/core/auth/services/Session.svc'
import AuthService from '@modules/core/auth/services/Auth.svc'
import {containerCreator, ModuleContainerCreator} from '@example/infra'
import {IAppConfigService} from '@modules/common/config/abstract'
import AppConfigService from '@modules/common/config/classes/AppConfig.svc'
import {
    IPaymentsService,
    ITransactionStorageService
} from '@modules/core/payments/abstract/payment.abstract'
import Web3Client from '@modules/core/payments/classes/Web3.client'
import TransactionStorageService from '@modules/core/payments/classes/TransactionStorage.svc'
import PaymentService from '@modules/core/payments/classes/Payment.svc'
import {IWeb3Client} from '@modules/core/payments/abstract/web3.abstract'

export const mainContainerCreator: ModuleContainerCreator = (container: Container) => {
    container
        .bind<IAppConfigService>(INJECT_SERVICE.APP_CONFIG_SERVICE)
        .to(AppConfigService)
        .inSingletonScope()

    container.bind<IUserService>(INJECT_SERVICE.USER_SERVICE)
        .to(UserService)

    container.bind<ISessionService>(INJECT_SERVICE.SESSION_SERVICE)
        .to(SessionService)

    container.bind<IAuthService>(INJECT_SERVICE.AUTH_SERVICE)
        .to(AuthService)

    container.bind<IPaymentsService>(INJECT_SERVICE.PAYMENT_SERVICE)
        .to(PaymentService)

    container.bind<IWeb3Client>(INJECT_SERVICE.WEB3_CLIENT)
        .to(Web3Client)
        .inSingletonScope()

    container.bind<ITransactionStorageService>(INJECT_SERVICE.TRANSACTION_STORAGE_SERVICE)
        .to(TransactionStorageService)
        .inSingletonScope()

    return container
}

export const container = containerCreator(
    mainContainerCreator,
)

