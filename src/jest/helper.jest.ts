import {
    EXCURSION_TYPE, ICreateExcursionRequestDTO, IExcursionResponseDTO
} from '@modules/core/excursions'
import {genUUID, IAuthToken, IResponseData} from '@bibtrip/server'
import {getHttpRequester} from '@bibtrip/infra'
import {OPERATIONS} from '@src/config'
export const generateExcursionRequest
    = (data?: Partial<ICreateExcursionRequestDTO>): ICreateExcursionRequestDTO => ({
    name: 'test',
    description: 'description',
    stepDescription: 'stepDescription',
    duration: 120,
    photos: [genUUID(), genUUID()],
    price: 100,
    type: EXCURSION_TYPE.EXCURSION,
    options: [
        {
            name: 'Option 1',
            price: 200
        }
    ],
    ...(data || {})
})

export const createExcursion = async (
    token: IAuthToken,
    data: ICreateExcursionRequestDTO
): Promise<IResponseData<IExcursionResponseDTO>> =>
    getHttpRequester().swaggerRequest<IExcursionResponseDTO>(
        token,
        OPERATIONS.CREATE_EXCURSION,
        data
    )
