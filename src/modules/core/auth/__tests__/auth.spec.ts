import {destroy, init} from '@src/jest/setup.jest'
import {ERROR_CODE, OPERATIONS} from '@src/config'
import {getHttpRequester} from '@example/infra'
import {ILoginRequestDTO, ILoginResponseDTO, IRegisterRequestDTO} from '@modules/core/auth'
import * as faker from 'faker'
import _ from 'lodash'
import {IResponseData} from '@example/server'

const httpRequester = getHttpRequester()

const register = async (
    data?: Partial<IRegisterRequestDTO>
): Promise<IResponseData<ILoginResponseDTO>> => {
    const reqData: IRegisterRequestDTO = {
        email: _.get(data, 'email', faker.internet.email()),
        name: _.get(data, 'name', faker.random.alphaNumeric(15)),
        password: _.get(data, 'password', faker.internet.password())
    }

    return httpRequester.swaggerRequest<ILoginResponseDTO>(
        undefined,
        OPERATIONS.REGISTER,
        reqData
    )
}

const login = async (
    data: ILoginRequestDTO
): Promise<IResponseData<ILoginResponseDTO>> => httpRequester.swaggerRequest<ILoginResponseDTO>(
        undefined,
        OPERATIONS.LOGIN,
        data
    )


describe('Auth API', () => {
    beforeAll(async () => {
        await init()
    })

    afterAll(async () => {
        await destroy()
    })

    describe('GET: /auth/register', () => {
        it('must register new user', async () => {
            const {result} = await register()

            expect(result).toBeTruthy()
            expect(result.userId).toBeString()
            expect(result.jwt).toBeString()
            expect(result.refresh).toBeString()
            expect(result.jwtExpiredAt).toBeNumber()
            expect(result.refreshExpiredAt).toBeNumber()
            expect(result.jwt !== result.refresh).toBeTrue()
        })

        it('must return VALIDATION_ERROR', async () => {
            const {error} = await register({
                email: 'invalid email'
            })

            expect(error).toBeTruthy()
            expect(error?.code).toEqual(ERROR_CODE.VALIDATION_ERROR)
            expect(error?.fields?.find(f => f.name === 'email')).toBeTruthy()
        })
    })

    describe('GET: /auth/login', () => {
        it('must login', async () => {
            const registerData = {
                email: faker.internet.email(),
                password: faker.internet.password()
            }

            const {result} = await register(registerData)
            expect(result).toBeTruthy()

            const {result: loginResult} = await login(registerData)
            expect(loginResult).toBeTruthy()
            expect(loginResult.userId).toBeString()
            expect(loginResult.jwt).toBeString()
            expect(loginResult.refresh).toBeString()
            expect(loginResult.jwtExpiredAt).toBeNumber()
            expect(loginResult.refreshExpiredAt).toBeNumber()
        })

        it('must return VALIDATION_ERROR', async () => {
            const {error} = await login({
                email: 'invalid email',
                password: '1111'
            })

            expect(error).toBeTruthy()
            expect(error?.code).toEqual(ERROR_CODE.VALIDATION_ERROR)
            expect(error?.fields?.find(f => f.name === 'email')).toBeTruthy()
        })

        it('must return PASSWORD_INCORRECT', async () => {
            const registerData = {
                email: faker.internet.email(),
                password: faker.internet.password()
            }

            const {result} = await register(registerData)
            expect(result).toBeTruthy()

            const {error} = await login({
                email: registerData.email,
                password: '567dDfh878'
            })

            expect(error).toBeTruthy()
            expect(error?.code).toEqual(ERROR_CODE.PASSWORD_INCORRECT)
        })
    })
})
