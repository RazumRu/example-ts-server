export interface ICreateWeb3Transaction {
    privateKey: string
    to: string
    value: number
    data: IWeb3TransactionData
}

export interface IWeb3Transaction {
    hash: string
    transactionIndex: number | null
    from: string
    to: string | null
    value: string
    gasPrice: string
    gas: number
    input: string
}

export interface ISendWeb3Transaction extends ICreateWeb3Transaction {
    gas: number
}

export interface IWeb3Account {
    address: string
    privateKey: string
}

export interface IWeb3TransactionData {
    text?: string
}

export interface IWeb3Client {
    getBalance(address: string): Promise<number>
    createAccount(): Promise<IWeb3Account>
    getTransactionGasPrice(data: ICreateWeb3Transaction): Promise<number>
    sendTransaction(data: ISendWeb3Transaction): Promise<string>
    getTransactionByHash(hash: string): Promise<IWeb3Transaction>
    etcToWei(etc: number): number
    weiToEtc(wei: number): number
    hexToString(hex: string): string
}
