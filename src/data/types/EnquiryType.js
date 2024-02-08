import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLBoolean as BooleanType
} from 'graphql';

import ThreadItemsType from './ThreadItemsType';

const EnquiryType = new ObjectType({
    name: 'Enquiry',
    fields: {
        result: {
            type: ThreadItemsType
        },
        status: { type: IntType },
        errorMessage: { type: StringType }
    },
});

export default EnquiryType;
