import LocationItemType from '../types/LocationItemType';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';

// import fetch from '../../core/fetch';
import fetch from '../../libs/fetch';

// Constants
import { googleMapAPI } from '../../config';
import checkUserBanStatus from '../../libs/checkUserBanStatus';

const locationItem = {

  type: LocationItemType,

  args: {
    address: { type: StringType },
  },

  async resolve({ request }, { address }) {

    if (request && request.user) {
      const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
      if (userStatusErrorMessage) {
        return {
          status: userStatusError,
          errorMessage: userStatusErrorMessage
        };
      }
    }

    const URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=' + googleMapAPI;
    const resp = await fetch(URL);
    const data = await resp.json();
    let locationData = {};
    if (data && data.results && data.results.length > 0) {
      data.results.map((item, key) => {
        item.address_components.map((value, key) => {
          if (value.types[0] == 'administrative_area_level_1' || value.types[0] == 'country') {
            locationData[value.types[0]] = value.short_name;
          } else {
            locationData[value.types[0]] = value.long_name;
          }

        });
      });
      let city = locationData.administrative_area_level_2 != undefined ? locationData.administrative_area_level_2 : locationData.locality;
      return {
        street: locationData.route,
        country: locationData.country,
        city: city,
        state: locationData.administrative_area_level_1,
        zipcode: locationData.postal_code,
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng,
        status: 200
      }
    } else {
      return {
        status: 400
      }
    }

  },
};

export default locationItem;
