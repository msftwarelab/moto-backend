import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLFloat as FloatType,
  GraphQLList as List,
} from 'graphql';

const CreateListingType = new ObjectType({
  name: 'CreateListing',
  fields: {
    listId: { type: IntType },
    carType: { type: StringType },
    make: { type: StringType },
    model: { type: StringType },
    year: { type: StringType },
    transmission: { type: StringType },
    odometer: { type: StringType },
    personCapacity: { type: IntType },
    country: { type: StringType },
    street: { type: StringType },
    buildingName: { type: StringType },
    city: { type: StringType },
    state: { type: StringType },
    zipcode: { type: StringType },
    status: { type: StringType },
    lat: { type: FloatType },
    lng: { type: FloatType },
    errorMessage: {
      type: StringType
    },
    actionType: { type: StringType },
    carFeatures: { type: new List(IntType)},
    isMapTouched: { type: BooleanType }
  },
});

const ListingResponseType = new ObjectType({
  name: 'ListingResponse',
  fields: {
    results: {
      type: CreateListingType
    },
    status: {
      type: IntType
    },
    errorMessage: {
      type: StringType
    },
    actionType: { type: StringType },
    id: { type: IntType },
  }
});

export default ListingResponseType;
