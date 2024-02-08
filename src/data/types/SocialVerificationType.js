import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLNonNull as NonNull,
} from 'graphql';


const SocialVerificationType = new ObjectType({
    name: 'SocialVerification',
    fields: {
        verificationType: { type: StringType },
        actionType: { type: StringType },
        status: { type: IntType },
        errorMessage: { type: StringType }
    },
});

export default SocialVerificationType;
