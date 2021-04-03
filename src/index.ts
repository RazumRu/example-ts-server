process.env.ALIASES_SRC_DIR = __dirname

import {connectToServiceCluster, initDb, initServer, logger} from '@bibtrip/infra'
import {configContainerCreator} from '@bibtrip/config'
import {containerCreator} from '@bibtrip/container-creator'
import './modules'
import {infraContainerCreator} from '@bibtrip/infra/dist/inversify.cfg'
import {transportContainerCreator} from '@bibtrip/transport'
import {mainContainerCreator} from '@src/inversify.cfg'
import en from '@config/lang/en'

export const init = async () => {
    await containerCreator(
      configContainerCreator(),
      infraContainerCreator({
          langResource: {
              en
          }
      }),
      transportContainerCreator(),
      mainContainerCreator(),
    )
    await initServer()
    await initDb()
    await connectToServiceCluster()
    logger().info('Server started!')
}

init().catch((err: Error) => {
    logger().error({err}, 'Server didn\'t start, something went wrong 💔')

    setTimeout(process.exit, 1000, 1)
})
