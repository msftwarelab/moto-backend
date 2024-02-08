import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLList as List
} from 'graphql';

const StaticPageType = new ObjectType({
    name: 'StaticPageType',
    fields: {
        id: {
            type: IntType
        },
        pageName: {
            type: StringType
        },
        metaTitle: {
            type: StringType
        },
        metaDescription: {
            type: StringType
        },
        content: {
            type: StringType
        },
        createdAt: {
            type: StringType
        }
    }
});

const StaticPageCommonType = new ObjectType({
    name: 'StaticPageCommonType',
    fields: {
        status: {
            type: IntType
        },
        errorMessage: {
            type: StringType
        },
        result: {
            type: StaticPageType
        },
        results: {
            type: new List(StaticPageType)
        }
    }
});

export default StaticPageCommonType;