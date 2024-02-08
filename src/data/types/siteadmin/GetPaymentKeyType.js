import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLInt as IntType,
    GraphQLFloat as FloatType
  } from 'graphql';
  
  const StripeKeysType = new ObjectType({
    name: 'StripeKeysType',
    fields: {
      secretKey: { type: StringType },
      publishableKey: { type: StringType }
    },
  });

  const GetPaymentKeyType = new ObjectType({
    name: 'GetPaymentKey',
    fields: {
        result: { 
            type: StripeKeysType
        },
        status: { 
            type: IntType 
        },
        errorMessage: { 
            type: StringType 
        },
    }
});
  
  export default GetPaymentKeyType;
  