import {
    IApproveTransactionRequestDTO,
    ICreateUserTransactionRequestDTO, IGetTransactionsRequest,
    IPaymentAccount,
    IPaymentAccountResponseDTO,
    IPaymentsService,
    ITempTransactionResponseDTO, ITransactionResponseDTO,
    ITransactionStorageService
} from '@modules/core/payments/abstract/payment.abstract'
import {inject, injectable} from 'inversify'
import {IChildRequestInstance} from '@example/infra'
import {ERROR_CODE, INJECT_SERVICE} from '@src/config'
import {IUserID} from '@modules/core/users'
import {PaymentAccountModel} from '@src/models/PaymentAccount.model'
import {AlreadyExistsError, BadRequestError, NotFoundError} from '@example/errors'
import {ACCOUNT_TYPE, TRANSACTION_TYPE} from '@modules/core/payments/config'
import {IMongoModel} from '@example/mongoose'
import PaymentAccountResponseDTO from '@modules/core/payments/dto/PaymentAccountResponse.dto'
import TransactionResponseDTO from '@modules/core/payments/dto/TempTransactionResponse.dto'
import {
    ICreateWeb3Transaction,
    IWeb3Client,
    IWeb3TransactionData
} from '@modules/core/payments/abstract/web3.abstract'

@injectable()
export default class PaymentService implements IPaymentsService {
    @inject(INJECT_SERVICE.WEB3_CLIENT)
    private readonly web3Client: IWeb3Client

    @inject(INJECT_SERVICE.TRANSACTION_STORAGE_SERVICE)
    private readonly transactionStorageService: ITransactionStorageService

    private async getLocalAccountByUser(userId: IUserID): Promise<IPaymentAccount> {
        const account = await PaymentAccountModel.findOne({
            userId
        }).lean().exec()

        if (!account) {
            throw new NotFoundError(ERROR_CODE.PAYMENT_ACCOUNT_NOT_FOUND)
        }

        return account
    }

    private async prepareAccount(account: IPaymentAccount): Promise<IPaymentAccountResponseDTO> {
        const balance = await this.web3Client.getBalance(account.address)

        return new PaymentAccountResponseDTO({
            address: account.address,
            type: account.type,
            balance: this.web3Client.etcToWei(balance)
        })
    }

    private async checkAccountBalance(address: string, value: number) {
        const balance = await this.web3Client.getBalance(address)

        if (balance - value < 0) {
            throw new BadRequestError(ERROR_CODE.LOW_BALANCE)
        }
    }

    public async createAccount(req: IChildRequestInstance): Promise<IPaymentAccountResponseDTO> {
        const currentAccount = await this.getLocalAccountByUser(req.getUserId()).catch(() => null)

        if (currentAccount) {
            throw new AlreadyExistsError(ERROR_CODE.PAYMENT_ACCOUNT_ALREADY_EXISTS)
        }

        const newWeb3Account = await this.web3Client.createAccount()
        const newLocalAccountData: Omit<IPaymentAccount, keyof IMongoModel> = {
            address: newWeb3Account.address,
            // TODO: We must save keys in another secure place
            privateKey: newWeb3Account.privateKey,
            type: ACCOUNT_TYPE.ETC,
            userId: req.getUserId()
        }

        const newLocalAccount: IPaymentAccount
            = await PaymentAccountModel.create(newLocalAccountData)

        return this.prepareAccount(newLocalAccount)
    }

    public async getAccount(req: IChildRequestInstance): Promise<IPaymentAccountResponseDTO> {
        const account = await this.getLocalAccountByUser(req.getUserId())

        return this.prepareAccount(account)
    }

    public async createUserTransaction(
        req: IChildRequestInstance,
        data: ICreateUserTransactionRequestDTO
    ): Promise<ITempTransactionResponseDTO> {
        const account = await this.getLocalAccountByUser(req.getUserId())
        const targetAccount = await this.getLocalAccountByUser(data.userId)

        const transactionData: ICreateWeb3Transaction = {
            privateKey: account.privateKey,
            to: targetAccount.address,
            value: this.web3Client.etcToWei(data.value),
            data: {
                text: data.text
            }
        }

        await this.checkAccountBalance(account.address, transactionData.value)

        const gas = await this.web3Client.getTransactionGasPrice(transactionData)

        const localTransaction = await this.transactionStorageService.createTempTransaction({
            ...transactionData,
            gas,
            type: TRANSACTION_TYPE.USER_TO_USER,
            receiverId: data.userId
        })

        return new TransactionResponseDTO({
            tax: gas,
            id: localTransaction.id
        })
    }

    public async approveTransaction(
        req: IChildRequestInstance,
        data: IApproveTransactionRequestDTO
    ): Promise<IPaymentAccountResponseDTO> {
        const transaction = await this.transactionStorageService.getTempTransaction(data.id)
        const account = await this.getLocalAccountByUser(req.getUserId())

        await this.checkAccountBalance(
            account.address,
            transaction.value + transaction.gas
        )
        const hash = await this.web3Client.sendTransaction(transaction)
        await this.transactionStorageService.deleteTempTransaction(data.id)
        await this.transactionStorageService.addTransactionToUserHistory({
            hash,
            type: transaction.type,
            senderId: req.getUserId(),
            receiverId: transaction.receiverId
        })

        return this.getAccount(req)
    }

    public async getTransactions(
        req: IChildRequestInstance,
        data: IGetTransactionsRequest
    ): Promise<ITransactionResponseDTO[]> {
        const userTransactions = await this.transactionStorageService.getUserTransactions({
            ...data,
            userId: req.getUserId()
        })

        return Promise.all(
            userTransactions.map(async (t) => {
                const web3Transaction = await this.web3Client.getTransactionByHash(t.hash)
                const data: IWeb3TransactionData
                    = JSON.parse(this.web3Client.hexToString(web3Transaction.input))

                return {
                    hash: t.hash,
                    type: t.type,
                    value: +this.web3Client.weiToEtc(+web3Transaction.value),
                    text: data.text,
                    from: web3Transaction.from,
                    to: String(web3Transaction.to),
                    gas: +web3Transaction.gas,
                    gasPrice: +web3Transaction.gasPrice
                }
            })
        )
    }
}
