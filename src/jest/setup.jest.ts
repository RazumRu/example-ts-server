import {
    NODE_ENV
} from '@example/infra/dist/config'

process.env.NODE_ENV = NODE_ENV.TEST

import {
    destroyTestServer,
    getHttpRequester,
    initTestServer
} from '@example/infra'
import '../modules'
import '@src/inversify.cfg'
import {ILoginResponseDTO, IRegisterRequestDTO} from '@modules/core/auth'
import * as faker from 'faker'
import {OPERATIONS} from '@src/config'
import _ from 'lodash'

export const init = async () => {
    await initTestServer()
}

export const destroy = async () => {
    await destroyTestServer()
}

// ----- helpers -----

export const createUser = async (
    data?: Partial<IRegisterRequestDTO>
): Promise<ILoginResponseDTO> => {
    const httpRequester = getHttpRequester()
    const reqData: IRegisterRequestDTO = {
        email: _.get(data, 'email', faker.internet.email()),
        name: _.get(data, 'name', faker.random.alphaNumeric(15)),
        password: _.get(data, 'password', faker.internet.password())
    }

    const {result} = await httpRequester.swaggerRequest<ILoginResponseDTO>(
        undefined,
        OPERATIONS.REGISTER,
        reqData,
    )

    expect(result).toBeTruthy()

    return result
}
