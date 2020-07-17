process.env.ALIASES_SRC_DIR = __dirname

import {initDb, initServer, logger} from '@example/infra'
import '@src/inversify.cfg'
import './modules'

export const init = async () => {
    await initServer()
    await initDb()
    logger().info('Server started!')
}

init().catch((err: Error) => {
    logger().error({err}, 'Server didn\'t start, something went wrong 💔')

    setTimeout(process.exit, 1000, 1)
})
