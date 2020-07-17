import {INJECT_SERVICE, OPERATIONS, SPECS} from '@src/config'
import {
    Body,
    Controller, Description, Get,
    Middleware, OperationID, PARAM_IN, Post, Response, ResponseArray, Security,
    Spec
} from '@example/server'
import {ChildBaseController, isAuth, SWAGGER_SECURITY} from '@example/infra'
import {
    IApproveTransactionRequestDTO,
    ICreateUserTransactionRequestDTO, IGetTransactionsRequest,
    IPaymentsService
} from '@modules/core/payments/abstract/payment.abstract'
import PaymentAccountResponseDTO from '@modules/core/payments/dto/PaymentAccountResponse.dto'
import {inject} from 'inversify'
import CreateUserTransactionRequestDTO
    from '@modules/core/payments/dto/CreateUserTransactionRequest.dto'
import ApproveTransactionRequestDTO from '@modules/core/payments/dto/ApproveTransactionRequest.dto'
import GetTransactionsRequestDTO from '@modules/core/payments/dto/GetTransactionsRequest.dto'
import TransactionResponseDTO from '@modules/core/payments/dto/TransactionResponse.dto'
import TempTransactionResponseDTO from '@modules/core/payments/dto/TempTransactionResponse.dto'

@Controller('payments')
@Spec(
    SPECS.PAYMENTS,
    'Payments API'
)
@Middleware(isAuth)
@Security([SWAGGER_SECURITY.BEARER])
export default class PaymentsController extends ChildBaseController {
    @inject(INJECT_SERVICE.PAYMENT_SERVICE)
    private readonly paymentService: IPaymentsService

    @Post('createAccount')
    @Description(
        'Create new payment account',
        'Create web3 account and save it to our DB'
    )
    @OperationID(OPERATIONS.CREATE_PAYMENT_ACCOUNT)
    @Response(200, PaymentAccountResponseDTO)
    public async createAccount() {
        return this.paymentService.createAccount(this.reqInstance)
    }

    @Get('getAccount')
    @Description(
        'Get payment account',
        'Get web3 account'
    )
    @OperationID(OPERATIONS.GET_PAYMENT_ACCOUNT)
    @Response(200, PaymentAccountResponseDTO)
    public async getAccount() {
        return this.paymentService.getAccount(this.reqInstance)
    }

    @Post('createUserTransaction')
    @Description(
        'Create transaction',
        `Create transaction for transfer currency to another user and get gas price.
         Transaction will be active only n minutes`
    )
    @OperationID(OPERATIONS.CREATE_USER_TRANSACTION)
    @Response(200, TempTransactionResponseDTO)
    public async createUserTransaction(
        @Body(CreateUserTransactionRequestDTO) data: ICreateUserTransactionRequestDTO
    ) {
        return this.paymentService.createUserTransaction(this.reqInstance, data)
    }

    @Post('approveTransaction')
    @Description(
        'Approve transaction',
        'Send exist transaction to ethereum network'
    )
    @OperationID(OPERATIONS.APPROVE_TRANSACTION)
    @Response(200, PaymentAccountResponseDTO)
    public async approveTransaction(
        @Body(ApproveTransactionRequestDTO) data: IApproveTransactionRequestDTO
    ) {
        return this.paymentService.approveTransaction(this.reqInstance, data)
    }

    @Get('getTransactions')
    @Description(
        'Get transactions in ethereum network',
        'Get transactions in ethereum network'
    )
    @OperationID(OPERATIONS.GET_TRANSACTIONS)
    @ResponseArray(200, TransactionResponseDTO)
    public async getTransactions(
        @Body(GetTransactionsRequestDTO, PARAM_IN.QUERY) data: IGetTransactionsRequest
    ) {
        return this.paymentService.getTransactions(this.reqInstance, data)
    }
}
