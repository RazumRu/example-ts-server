import {
    ICreateTempWeb3Transaction, IGetTransactions,
    ITempWeb3Transaction,
    ITransactionStorageService, IUserTransaction
} from '@modules/core/payments/abstract/payment.abstract'
import {inject, injectable} from 'inversify'
import {IRedisClient, UUID} from '@example/infra'
import {INJECT_SERVICE, ERROR_CODE} from '@src/config'
import * as uuid from 'uuid'
import {IAppConfigService} from '@modules/common/config/abstract'
import {NotFoundError} from '@example/errors'
import {IMongoModel} from '@example/mongoose'
import {UserTransactionModel} from '@src/models/UserTransaction.model'

@injectable()
export default class TransactionStorageService implements ITransactionStorageService {
    private redisClient: IRedisClient

    @inject(INJECT_SERVICE.APP_CONFIG_SERVICE)
    private readonly appConfigService: IAppConfigService

    constructor(
        @inject(INJECT_SERVICE.REDIS_FACTORY)
        redisFactory: () => IRedisClient
    ) {
        this.redisClient = redisFactory()
    }

    public async createTempTransaction(
        data: ICreateTempWeb3Transaction
    ): Promise<ITempWeb3Transaction> {
        const id = uuid.v4()
        const web3Config = this.appConfigService.getWeb3Config()

        const transaction: ITempWeb3Transaction = {
            id,
            ...data
        }

        await this.redisClient.set(
            id,
            JSON.stringify(transaction),
            'ex',
            web3Config.transactionLifeTime
        )

        return transaction
    }

    public async getTempTransaction(id: UUID): Promise<ITempWeb3Transaction> {
        const data = await this.redisClient.get(id)

        if (!data) {
            throw new NotFoundError(ERROR_CODE.TRANSACTION_NOT_FOUND)
        }

        return JSON.parse(data)
    }

    public async deleteTempTransaction(id: UUID): Promise<void> {
        await this.redisClient.del(id)
    }

    public async addTransactionToUserHistory(
        data: Omit<IUserTransaction, keyof IMongoModel>
    ): Promise<IUserTransaction> {
        return UserTransactionModel.create(data)
    }

    public async getUserTransactionByHash(hash: string): Promise<IUserTransaction> {
        return UserTransactionModel.findOne({hash}).lean().exec()
    }

    public async getUserTransactions(data: IGetTransactions): Promise<IUserTransaction[]> {
        const limit = Math.min(Math.max(data.limit || 50, 1), 50)
        const query = UserTransactionModel
            .find()
            .or([
                {senderId: data.userId},
                {receiverId: data.userId}
            ])
            .limit(limit)
            .sort('-_id')
            .lean()

        if (data.beforeId) {
            query.where('_id').lt(data.beforeId)
        }

        return query.exec()
    }
}
