import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLList as List,
} from 'graphql';

const SiteSettingsType = new ObjectType({
    name: 'SiteSettings',
    fields: {
        id: { type: IntType },
        title: { type: StringType },
        name: { type: StringType },
        value: { type: StringType },
        type: { type: StringType },
        status: { type: StringType }
    },
});

const ApplicationVersion = new ObjectType({
    name: 'ApplicationVersion',
    fields: {
        appStoreUrl: { type: StringType },
        playStoreUrl: { type: StringType },
    },
});

const SiteSettingsCommonType = new ObjectType({
    name: 'SiteSettingsCommon',
    fields: {
        results: { 
            type: new List(SiteSettingsType)
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        },
        result: {
            type: ApplicationVersion
        }
    },
});

export default SiteSettingsCommonType;
