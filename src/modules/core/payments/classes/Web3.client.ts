import {
    ICreateWeb3Transaction,
    ISendWeb3Transaction,
    IWeb3Account,
    IWeb3Client,
    IWeb3Transaction
} from '@modules/core/payments/abstract/web3.abstract'
import {inject, injectable} from 'inversify'
import {INJECT_SERVICE} from '@src/config'
import {IAppConfigService} from '@modules/common/config/abstract'
import Web3 from 'web3'
import {Transaction} from 'ethereumjs-tx'

@injectable()
export default class Web3Client implements IWeb3Client {
    @inject(INJECT_SERVICE.APP_CONFIG_SERVICE)
    private readonly appConfigService: IAppConfigService

    private client: Web3

    private getClient() {
        if (!this.client) {
            const web3Cfg = this.appConfigService.getWeb3Config()

            this.client = new Web3(web3Cfg.provider)
        }

        return this.client
    }

    public etcToWei(etc: number): number {
        const client = this.getClient()

        return +client.utils.toWei(String(etc), 'ether')
    }

    public weiToEtc(wei: number): number {
        const client = this.getClient()

        return +client.utils.fromWei(String(wei), 'ether')
    }

    public hexToString(hex: string): string {
        const client = this.getClient()

        return client.utils.hexToString(hex)
    }

    public async getTransactionByHash(hash: string): Promise<IWeb3Transaction> {
        const client = this.getClient()

        return client.eth.getTransaction(hash)
    }

    public async getBalance(address: string): Promise<number> {
        const client = this.getClient()

        const val = await client.eth.getBalance(address, 'latest')
        return +val
    }

    public async createAccount(): Promise<IWeb3Account> {
        const client = this.getClient()

        const account = await client.eth.accounts.create()

        return account
    }

    public async getTransactionGasPrice(data: ICreateWeb3Transaction): Promise<number> {
        const client = this.getClient()
        const transactionData = await this.getTransactionData(data)

        const val = await client.eth.estimateGas(transactionData)
        return val
    }

    private async getTransactionData(data: ICreateWeb3Transaction) {
        const client = this.getClient()
        const accountInfo = await client.eth.accounts.privateKeyToAccount(data.privateKey)

        const nonce = await client.eth.getTransactionCount(accountInfo.address)

        return {
            nonce,
            to: data.to,
            value: client.utils.toHex(data.value),
            data: data.data && client.utils.toHex(JSON.stringify(data.data))
        }
    }

    public async sendTransaction(data: ISendWeb3Transaction): Promise<string> {
        const client = this.getClient()

        const privateKey = Buffer.from(data.privateKey.replace(/^0x/, ''), 'hex')
        const transactionData = await this.getTransactionData(data)
        const txData = new Transaction({
            ...transactionData,
            gasLimit: client.utils.toHex(data.gas),
            gasPrice: client.utils.toHex(client.utils.toWei(String(10), 'gwei'))
        })

        txData.sign(privateKey)

        const res = await client.eth.sendSignedTransaction(txData.serialize().toString('hex'))
        return res.transactionHash
    }
}
