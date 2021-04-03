import {
    NODE_ENV
} from '@bibtrip/config/dist/config'
import {containerCreator} from '@bibtrip/container-creator'

process.env.NODE_ENV = NODE_ENV.TEST

import {
    destroyTestServer,
    initTestServer
} from '@bibtrip/infra'
import {configContainerCreator} from '@bibtrip/config'
import {infraContainerCreator} from '@bibtrip/infra/dist/inversify.cfg'
import {transportContainerCreator} from '@bibtrip/transport'
import '../modules'
import {mainContainerCreator} from '@src/inversify.cfg'

export const init = async () => {
    await containerCreator(
        configContainerCreator(),
        infraContainerCreator(),
        transportContainerCreator(),
        mainContainerCreator(),
    )
    await initTestServer()
}

export const destroy = async () => {
    await destroyTestServer()
}
