import {
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType
} from 'graphql';

const resultType = new ObjectType({
  name: 'resultType',
  fields: {
    facebook: { type: BooleanType },
    google: { type: BooleanType }
  }
});

const socialLoginsType = new ObjectType({
  name: 'socialLoginsType',
  fields: {
    errorMessage: { type: StringType },
    status: { type: IntType },
    results: { type: resultType }
  },
});

export default socialLoginsType;
