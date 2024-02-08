import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLList as List,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import { ListSettings } from '../models';

const ListSettingType = new ObjectType({
  name: 'listingSettingsCommon',
  description: "Represents listing field values for the frontend",
  fields: {
    id: {type: IntType },
    typeId: { type: IntType },
    itemName: { type: StringType },
    otherItemName: { type: StringType },
    maximum: { type: IntType },
    minimum: { type: IntType },
    startValue: { type: IntType },
    endValue: { type: IntType },
    isEnable: { type: StringType },
    makeType: { type: IntType }
  }
});

const ListSettingsType = new ObjectType({
  name: 'listingSettingsTypesCommon',
  description: "Represents listing field types for the frontend",
  fields: {
    id: {type: IntType },
    typeName: { type: StringType },
    typeLabel: { type: StringType },
    step: { type: StringType },
    fieldType: { type: StringType },
    isMultiValue: { type: BooleanType },
    isEnable: { type: StringType },
    status: { type: StringType },
    listSettings: {
      type: new List(ListSettingType),
      async resolve (listSettingsType) {
        return await ListSettings.findAll({
          where: {
            typeId: listSettingsType.id,
            isEnable: 1
          }
        })
      }
    },
  },
});

const ListSettingsCommonType = new ObjectType({
  name: 'listingSettingCommonTypes',
  description: "Represents listing field types for the frontend",
  fields: {
    status: { type: IntType },
    errorMessage: { type: StringType },
    results: { type: new List(ListSettingsType) }
  }
})

export default ListSettingsCommonType;
