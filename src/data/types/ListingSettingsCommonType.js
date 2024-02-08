import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLList as List,
    GraphQLBoolean as BooleanType,
  } from 'graphql';
import { ListSettings, ListSettingsTypes } from '../models';

  const ListSettingsDataType = new ObjectType({
    name: 'listingSettings',
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
    name: 'listingSettingsTypes',
    description: "Represents listing field types for the frontend",
    fields: {
      id: { type: IntType },
      typeName: { type: StringType },
      typeLabel: { type: StringType },
      step: { type: StringType },
      fieldType: { type: StringType },
      isMultiValue: { type: BooleanType },
      isEnable: { type: StringType },
      status: { type: StringType },
      listSettings: {
        type: new List(ListSettingsDataType),
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

  const SettingsType = new ObjectType({
    name: 'settingsType',
    description: "Represents listing field types for the frontend",
    fields: {
      id: { type: IntType },
      carType: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 1 }
          });
        }
      },
      model: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 3 }
          });
        }
      },
      year: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 4 }
          });
        }
      },
      vehicleColors: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 7 }
          });
        }
      },
      carFeatures: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 10 }
          });
        }
      },
      guestRequirements: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 13 }
          });
        }
      },
      carRules: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 14 }
          });
        }
      },
      reviewGuestBook: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 15 }
          });
        }
      },
      bookingNoticeTime: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 16 }
          });
        }
      },
      maxDaysNotice: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 17 }
          });
        }
      },
      minNight: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 18 }
          });
        }
      },
      maxNight: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 19 }
          });
        }
      },
      make: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 20 }
          });
        }
      },
      odometer: {
        type: ListSettingsType,
        async resolve(listSetting) {
          return await ListSettingsTypes.findOne({
            where: { id: 21 }
          });
        }
      }
    }
  });


  const ListSettingsCommonType = new ObjectType({
    name: 'listingSettingsCommonTypes',
    description: "Represents listing field types for the frontend",
    fields: {
      status: { type: IntType },
      errorMessage: { type: StringType },
      results: { type: SettingsType }
    }
  })

  
  export default ListSettingsCommonType;
  