import {IChildRequestInstance, UUID} from '@example/infra'
import {IUserID} from '@modules/core/users'
import {IMongoModel, IObjectID} from '@example/mongoose'
import {ACCOUNT_TYPE, TRANSACTION_TYPE} from '@modules/core/payments/config'
import {
    ICreateWeb3Transaction,
} from '@modules/core/payments/abstract/web3.abstract'

export interface IPaymentAccount extends IMongoModel {
    address: string
    privateKey: string
    type: ACCOUNT_TYPE
    userId: IUserID
}

export interface IPaymentAccountResponseDTO {
    address: string
    balance: number
    type: ACCOUNT_TYPE
}

export interface ICreateUserTransactionRequestDTO {
    userId: IUserID
    value: number
    text?: string
}

export interface ITempTransactionResponseDTO {
    id: UUID
    tax: number
}

export interface IApproveTransactionRequestDTO {
    id: UUID
}

export interface IGetTransactions {
    limit?: number
    beforeId?: IObjectID
    userId: IUserID
}

export interface IGetTransactionsRequest {
    limit?: number
    beforeId?: IObjectID
}

export interface ITransactionResponseDTO {
    hash: string
    type: TRANSACTION_TYPE
    value: number
    text?: string
    from: string
    to: string
    gas: number
    gasPrice: number
}

export interface IPaymentsService {
    /**
     * Create web3 account and save it to our DB
     * @param req
     */
    createAccount(req: IChildRequestInstance): Promise<IPaymentAccountResponseDTO>

    /**
     * Get web3 account
     * @param req
     */
    getAccount(req: IChildRequestInstance): Promise<IPaymentAccountResponseDTO>

    /**
     * Create transaction for transfer currency to another user and get gas price
     * Transaction will be active only n minutes
     * @param req
     * @param data
     */
    createUserTransaction(
        req: IChildRequestInstance,
        data: ICreateUserTransactionRequestDTO
    ): Promise<ITempTransactionResponseDTO>

    /**
     * Send exist transaction to ethereum network
     * @param req
     * @param data
     */
    approveTransaction(
        req: IChildRequestInstance,
        data: IApproveTransactionRequestDTO
    ): Promise<IPaymentAccountResponseDTO>

    /**
     * Get transactions in ethereum network
     * @param req
     * @param data
     */
    getTransactions(
        req: IChildRequestInstance,
        data: IGetTransactionsRequest
    ): Promise<ITransactionResponseDTO[]>
}

export interface ICreateTempWeb3Transaction extends ICreateWeb3Transaction {
    gas: number
    type: TRANSACTION_TYPE
    receiverId: IUserID
}

export interface ITempWeb3Transaction extends ICreateWeb3Transaction {
    id: UUID
    gas: number
    type: TRANSACTION_TYPE
    receiverId: IUserID
}

export interface IUserTransaction extends IMongoModel {
    senderId: IUserID
    receiverId: IUserID
    hash: string
    type: TRANSACTION_TYPE
}

export interface ITransactionStorageService {
    /**
     * A temporary transaction is created at the time of calculating the commission
     * @param data
     */
    createTempTransaction(data: ICreateTempWeb3Transaction): Promise<ITempWeb3Transaction>
    getTempTransaction(id: UUID): Promise<ITempWeb3Transaction>
    deleteTempTransaction(id: UUID): Promise<void>

    /**
     * Connect transaction hash to user
     * @param data
     */
    addTransactionToUserHistory(
        data: Omit<IUserTransaction, keyof IMongoModel>
    ): Promise<IUserTransaction>
    getUserTransactionByHash(hash: string): Promise<IUserTransaction>
    getUserTransactions(data: IGetTransactions): Promise<IUserTransaction[]>
}
