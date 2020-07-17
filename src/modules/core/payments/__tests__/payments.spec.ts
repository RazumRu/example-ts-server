import {createUser, destroy, init} from '@src/jest/setup.jest'
import {ERROR_CODE, INJECT_SERVICE, OPERATIONS} from '@src/config'
import {
    IApproveTransactionRequestDTO,
    ICreateUserTransactionRequestDTO, IGetTransactionsRequest,
    IPaymentAccountResponseDTO, ITempTransactionResponseDTO, ITransactionResponseDTO
} from '@modules/core/payments/abstract/payment.abstract'
import {getHttpRequester} from '@example/infra'
import {genUUID, IResponseData} from '@example/server'
import {ACCOUNT_TYPE, TRANSACTION_TYPE} from '@modules/core/payments/config'
import {container} from '@src/inversify.cfg'
import {IAppConfigService} from '@modules/common/config/abstract'
import {IWeb3Client} from '@modules/core/payments/abstract/web3.abstract'

const httpRequester = getHttpRequester()
const getWeb3Client = () => container.get<IWeb3Client>(INJECT_SERVICE.WEB3_CLIENT)
const getConfigService = () => container.get<IAppConfigService>(INJECT_SERVICE.APP_CONFIG_SERVICE)

const createAccount = async (jwt: string): Promise<IResponseData<IPaymentAccountResponseDTO>> =>
    httpRequester.swaggerRequest<IPaymentAccountResponseDTO>(
        jwt,
        OPERATIONS.CREATE_PAYMENT_ACCOUNT,
    )

const createAndReplenishmentAccount = async (
    jwt: string,
    val = 1000000000000000000
): Promise<IPaymentAccountResponseDTO> => {
    const {result: account, success} = await createAccount(jwt)
    expect(success).toBeTrue()

    const client = getWeb3Client()
    const cfg = getConfigService()

    const data = {
        value: val,
        to: account.address,
        privateKey: cfg.getWeb3Config().accountKey,
        data: {}
    }

    const gasPrice = await client.getTransactionGasPrice(data)
    await client.sendTransaction({
        ...data,
        gas: gasPrice
    })

    const {result: updatedAccount} = await getAccount(jwt)

    return updatedAccount
}

const getAccount = async (jwt: string): Promise<IResponseData<IPaymentAccountResponseDTO>> =>
    httpRequester.swaggerRequest<IPaymentAccountResponseDTO>(
        jwt,
        OPERATIONS.GET_PAYMENT_ACCOUNT,
    )

const createUserTransaction = async (
    data: ICreateUserTransactionRequestDTO,
    jwt: string
): Promise<IResponseData<ITempTransactionResponseDTO>> =>
    httpRequester.swaggerRequest<ITempTransactionResponseDTO>(
        jwt,
        OPERATIONS.CREATE_USER_TRANSACTION,
        data,
    )

const approveTransaction = async (
    data: IApproveTransactionRequestDTO,
    jwt: string
): Promise<IResponseData<IPaymentAccountResponseDTO>> =>
    httpRequester.swaggerRequest<IPaymentAccountResponseDTO>(
        jwt,
        OPERATIONS.APPROVE_TRANSACTION,
        data,
    )

const getTransactions = async (
    data: IGetTransactionsRequest,
    jwt: string
): Promise<IResponseData<ITransactionResponseDTO[]>> =>
    httpRequester.swaggerRequest<ITransactionResponseDTO[]>(
        jwt,
        OPERATIONS.GET_TRANSACTIONS,
        undefined,
        data,
    )

describe('Payments API', () => {
    beforeAll(async () => {
        await init()
    })

    afterAll(async () => {
        await destroy()
    })

    describe('payments.createAccount', () => {
        it('must create account', async () => {
            const user = await createUser()

            const account = await createAccount(user.jwt)

            expect(account.success).toBeTrue()
            expect(account.result.address).toBeString()
            expect(account.result.balance).toBeNumber()
            expect(account.result.type).toEqual(ACCOUNT_TYPE.ETC)
        })

        it('must return PAYMENT_ACCOUNT_ALREADY_EXISTS error', async () => {
            const user = await createUser()

            const {success} = await createAccount(user.jwt)

            expect(success).toBeTrue()

            const {error} = await createAccount(user.jwt)

            expect(error?.code).toEqual(ERROR_CODE.PAYMENT_ACCOUNT_ALREADY_EXISTS)

        })
    })

    describe('payments.getAccount', () => {
        it('must get account', async () => {
            const user = await createUser()

            const {success} = await createAccount(user.jwt)
            expect(success).toBeTrue()

            const {result} = await getAccount(user.jwt)
            expect(result.address).toBeString()
            expect(result.balance).toBeNumber()
            expect(result.type).toEqual(ACCOUNT_TYPE.ETC)
        })

        it('must return PAYMENT_ACCOUNT_NOT_FOUND error', async () => {
            const user = await createUser()

            const {error} = await getAccount(user.jwt)

            expect(error?.code).toEqual(ERROR_CODE.PAYMENT_ACCOUNT_NOT_FOUND)

        })
    })

    describe('payments.createUserTransaction', () => {
        it('must create transaction', async () => {
            const thanos = await createUser()
            const groot = await createUser()

            const account = await createAndReplenishmentAccount(thanos.jwt)
            expect(account.balance > 0).toBeTrue()

            const {success: grootSuccess} = await createAccount(groot.jwt)
            expect(grootSuccess).toBeTrue()

            const {result: transaction} = await createUserTransaction({
                userId: groot.userId,
                value: 0.1
            }, thanos.jwt)
            expect(transaction.id).toBeString()
            expect(transaction.tax).toBeNumber()
        })

        it('must return PAYMENT_ACCOUNT_NOT_FOUND error', async () => {
            const thanos = await createUser()
            const groot = await createUser()

            // thanos
            {
                const {error} = await createUserTransaction({
                    userId: groot.userId,
                    value: 1
                }, thanos.jwt)

                expect(error?.code).toEqual(ERROR_CODE.PAYMENT_ACCOUNT_NOT_FOUND)
            }

            // groot
            {
                const {success} = await createAccount(thanos.jwt)
                expect(success).toBeTrue()
                
                const {error} = await createUserTransaction({
                    userId: groot.userId,
                    value: 1
                }, thanos.jwt)

                expect(error?.code).toEqual(ERROR_CODE.PAYMENT_ACCOUNT_NOT_FOUND)
            }
        })

        it('must return LOW_BALANCE error', async () => {
            const thanos = await createUser()
            const groot = await createUser()

            const {success: thanosSuccess} = await createAccount(thanos.jwt)
            expect(thanosSuccess).toBeTrue()

            const {success: grootSuccess} = await createAccount(groot.jwt)
            expect(grootSuccess).toBeTrue()

            const {error} = await createUserTransaction({
                userId: groot.userId,
                value: 1
            }, thanos.jwt)

            expect(error?.code).toEqual(ERROR_CODE.LOW_BALANCE)
        })
    })

    describe('payments.approveTransaction', () => {
        it('must create and approve transaction', async () => {
            const thanos = await createUser()
            const groot = await createUser()

            const account = await createAndReplenishmentAccount(thanos.jwt)
            expect(account.balance > 0).toBeTrue()

            const {success: grootSuccess} = await createAccount(groot.jwt)
            expect(grootSuccess).toBeTrue()

            const {result: transaction} = await createUserTransaction({
                userId: groot.userId,
                value: 0.1
            }, thanos.jwt)
            expect(transaction.id).toBeString()
            expect(transaction.tax).toBeNumber()

            const {result: myAccount} = await approveTransaction({
                id: transaction.id
            }, thanos.jwt)

            expect(myAccount.balance < account.balance).toBeTrue()
        })

        it('must return TRANSACTION_NOT_FOUND error', async () => {
            const thanos = await createUser()

            const {error} = await approveTransaction({
                id: genUUID()
            }, thanos.jwt)

            expect(error?.code).toEqual(ERROR_CODE.TRANSACTION_NOT_FOUND)
        })

        it('must return LOW_BALANCE error', async () => {
            const thanos = await createUser()
            const groot = await createUser()

            const account = await createAndReplenishmentAccount(thanos.jwt)
            expect(account.balance > 0).toBeTrue()

            const {success: grootSuccess} = await createAccount(groot.jwt)
            expect(grootSuccess).toBeTrue()

            const {result: transaction} = await createUserTransaction({
                userId: groot.userId,
                value: 1
            }, thanos.jwt)
            expect(transaction.id).toBeString()
            expect(transaction.tax).toBeNumber()

            const {error} = await approveTransaction({
                id: transaction.id
            }, thanos.jwt)

            expect(error?.code).toEqual(ERROR_CODE.LOW_BALANCE)
        })
    })

    describe('payments.getTransactions', () => {
        it('must get transactions', async () => {
            const thanos = await createUser()
            const groot = await createUser()

            const account = await createAndReplenishmentAccount(thanos.jwt)
            expect(account.balance > 0).toBeTrue()

            const {success: grootSuccess, result: grootAccount} = await createAccount(groot.jwt)
            expect(grootSuccess).toBeTrue()

            for (let i = 0; i < 5; i++) {
                const {success, result: t} = await createUserTransaction({
                    userId: groot.userId,
                    value: 0.1,
                    text: 'hi!'
                }, thanos.jwt)
                expect(success).toBeTrue()

                const {success: approveSuccess} = await approveTransaction({
                    id: t.id
                }, thanos.jwt)

                expect(approveSuccess).toBeTrue()
            }

            // thanos
            {
                const {result: list} = await getTransactions({}, thanos.jwt)
                expect(list).toBeArrayOfSize(5)

                for (const t of list) {
                    expect(t.hash).toBeString()
                    expect(t.type).toEqual(TRANSACTION_TYPE.USER_TO_USER)
                    expect(t.value).toEqual(0.1)
                    expect(t.text).toEqual('hi!')
                    expect(t.from).toEqual(account.address)
                    expect(t.to).toEqual(grootAccount.address)
                    expect(t.gas).toBeNumber()
                    expect(t.gasPrice).toBeNumber()
                }
            }
        })
    })
})
