import {
    GraphQLObjectType as ObjectType,
    GraphQLInt as IntType,
    GraphQLString as StringType,
    GraphQLFloat as FloatType,
    GraphQLList as List,
    GraphQLBoolean as BooleanType
} from 'graphql';

const SpecialPricingType = new ObjectType({
    name: 'SpecialPricingType',
    fields: {
        blockedDates: { 
            type: StringType 
        },
        isSpecialPrice: { 
            type: FloatType 
        },
    },
});

const BillingType = new ObjectType({
    name: 'BillingType',
    fields: {
        availableStatus: {
            type: StringType
        },
        checkIn: {
            type: StringType
        },
        checkOut: {
            type: StringType
        },
        startTime: {
            type: FloatType
        },
        endTime: {
            type: FloatType
        },
        days: {
            type: IntType
        },
        basePrice: {
            type: FloatType
        },
        delivery: {
            type: FloatType
        },
        currency: {
            type: StringType
        },
        discount: {
            type: FloatType
        },
        discountLabel: {
            type: StringType
        },
        guestServiceFee: {
            type: FloatType,
        },
        hostServiceFee: {
            type: FloatType,
        },
        total: {
            type: FloatType,
        },
        guestServiceFeePercentage: {
            type: FloatType,
        },
        hostServiceFeePercentage: {
            type: FloatType,
        },
        weeklyDiscountPercentage: {
            type: FloatType,
        },
        monthlyDiscountPercentage: {
            type: FloatType,
        },
        subtotal: {
            type: FloatType,
        },
        guests: {
            type: IntType
        },
        averagePrice: {
            type: FloatType,
        },
        priceForDays: {
            type: FloatType,
        },
        specialPricing:{
            type: new List(SpecialPricingType)
        },
        isSpecialPriceAssigned: {
            type: BooleanType,
        },
        securityDeposit: {
            type: FloatType
        }
    }
});

const AllBillingType = new ObjectType({
    name: 'AllBillingType',
    fields: {
        result: { type: BillingType },
        status: { type: IntType },
        errorMessage: { type: StringType }
    },
});

export default AllBillingType;
