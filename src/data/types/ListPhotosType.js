import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLList as List,
} from 'graphql';

const ListPhotosType = new ObjectType({
  name: 'ListPhotos',
  fields: {
    id: { type: new NonNull(IntType) },
    listId: { type: new NonNull(IntType) },
    name: { type: StringType },
    type: { type: StringType },
    isCover: { type: IntType },
    photosCount: { type: IntType },
    status: { type: StringType },
  },
});

const ListPhotosCommonType = new ObjectType({
  name: 'ListPhotosCommon',
  fields: {
    results: {
      type: new List(ListPhotosType)
    },
    status: {
      type: IntType
    },
    errorMessage: {
      type: StringType
    }
  }
});

export default ListPhotosCommonType;
