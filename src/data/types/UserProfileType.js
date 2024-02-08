import {
    GraphQLObjectType as ObjectType,
    GraphQLID as ID,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
} from 'graphql';
const UserProfileType = new ObjectType({
    name: 'UserProfile',
    fields: {
        id: { type: new NonNull(ID) },
        email: { type: StringType },
        type: { type: StringType },
        status: { type: StringType },
        userBanStatus: { type: IntType },
    },
});
export default UserProfileType;
