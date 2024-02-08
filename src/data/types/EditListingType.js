import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType,
    GraphQLInt as IntType,
    GraphQLFloat as FloatType,
    GraphQLNonNull as NonNull,
    GraphQLList as List,
} from 'graphql';

const EditListingType = new ObjectType({
    name: 'EditListing',
    fields: {
        id: { type: IntType },
        listId: { type: IntType },
        title: { type: StringType },
        description: { type: StringType },
        carType: { type: StringType },
        make: { type: StringType },
        personCapacity: { type: IntType },
        bathrooms: { type: FloatType },
        transmission: { type: StringType },
        country: { type: StringType },
        street: { type: StringType },
        buildingName: { type: StringType },
        city: { type: StringType },
        state: { type: StringType },
        zipcode: { type: StringType },
        lat: { type: FloatType },
        lng: { type: FloatType },
        carFeatures: { type: new List(IntType) },
        carRules: { type: new List(IntType) },
        bookingNoticeTime: { type: StringType },
        checkInStart: { type: StringType },
        checkInEnd: { type: StringType },
        maxDaysNotice: { type: StringType },
        minDay: { type: IntType },
        maxDay: { type: IntType },
        basePrice: { type: FloatType },
        delivery: { type: FloatType },
        currency: { type: StringType },
        weeklyDiscount: { type: IntType },
        monthlyDiscount: { type: IntType },
        coverPhoto: { type: IntType },
        blockedDates: { type: new List(StringType) },
        bookingType: { type: StringType },
        cancellationPolicy: { type: StringType },
        securityDeposit: { type: FloatType }
    },
});

const EditListingResponseType = new ObjectType({
    name: 'EditListingResponse',
    fields: {
        results: {
            type: EditListingType
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

export default EditListingResponseType;
