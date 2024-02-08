import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
    GraphQLBoolean as BooleanType,
    GraphQLFloat as FloatType,
    GraphQLList as List,
} from 'graphql';
import moment from 'moment';
// Models

import ReportUserType from './ReportUserType';

const ReportUserCommonType = new ObjectType({
    name: 'ReportUserResult',
    fields: {
        results: { 
            type: ReportUserType
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        }
    }
});

export default ReportUserCommonType;
