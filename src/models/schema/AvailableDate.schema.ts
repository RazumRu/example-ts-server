import {ChildMongooseModel, Field, Schema} from '@bibtrip/mongoose'
import {
    IAvailableDate, IAvailableDateTime
} from '@modules/core/excursionManagement'
import {AvailableDateTimeSchema} from '@src/models/schema/AvailableDateTime.schema'

@Schema()
class AvailableDateSchemaContainer
  extends ChildMongooseModel implements IAvailableDate {
    @Field({
        required: true,
        type: Date
    })
    public date: Date

    @Field({
        type: [AvailableDateTimeSchema],
        default: [],
        required: true
    })
    public time: IAvailableDateTime[]
}

const AvailableDateSchema = AvailableDateSchemaContainer.createSchema()

export { AvailableDateSchema }
