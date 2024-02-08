import {
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLList as List
} from 'graphql';

const LanguageItem = new ObjectType({
  name: 'LanguageItemType',
  fields: {
    label: { type: StringType },
    value: { type: StringType }
  }
});

const userLanguagesType = new ObjectType({
  name: 'UserLanguagesType',
  fields: {
    errorMessage: { type: StringType },
    status: { type: IntType },
    languages: { type: new List(LanguageItem) },
    result: { type: new List(LanguageItem) }
  },
});

export default userLanguagesType;
