// GrpahQL
import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLFloat as FloatType,
} from 'graphql';

import fetch from 'node-fetch'
import { url, googleMapAPI } from '../../../config';

// GraphQL Type
import CreateListingType from '../../types/CreateListingType';

// Sequelize models
import {
  Listing,
  UserListingData,
  UserAmenities
} from '../../../data/models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const createListing = {

  type: CreateListingType,

  args: {
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
    lat: { type: FloatType },
    lng: { type: FloatType },
    isMapTouched: { type: BooleanType },
    carFeatures: { type: new List(IntType) }
  },

  async resolve({ request, response }, {
    listId,
    carType,
    make,
    model,
    year,
    transmission,
    odometer,
    personCapacity,
    country,
    street,
    buildingName,
    city,
    state,
    zipcode,
    lat,
    lng,
    isMapTouched,
    carFeatures
  }) {
    let isListUpdated = false;
    let doCreateListing, doUpdateListing;

    try {
      if (request.user) {

        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }

        const address = street + ", " + city + ", " + state + ", " + country + ", " + zipcode;
        const URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=' + googleMapAPI;
        let latValue, lngValue, locationData = {};

        const response = await new Promise((resolve, reject) => {
          fetch(URL, {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            method: 'GET',
          }).then(res => res.json())
            .then(function (body) {
              if (body) {
                resolve(body)
              } else {
                reject(error)
              }
            });
        });

        if (response && response.results && response.results.length > 0) {
          response.results.map((item, key) => {
            item.address_components.map((value, key) => {
              if (value.types[0] == 'administrative_area_level_1' || value.types[0] == 'country') {
                locationData[value.types[0]] = value.short_name;
              } else {
                locationData[value.types[0]] = value.long_name;
              }

            });
          });
          let city = locationData.administrative_area_level_2 != undefined ? locationData.administrative_area_level_2 : locationData.locality;
          latValue = response.results[0].geometry.location.lat;
          lngValue = response.results[0].geometry.location.lng;
        }

        latValue = lat ? lat : latValue;
        lngValue = lng ? lng : lngValue;

        if (listId) { // Update
          doUpdateListing = await Listing.update({
            transmission,
            personCapacity,
            country,
            street,
            buildingName,
            city,
            state,
            zipcode,
            lat: latValue,
            lng: lngValue,
            isMapTouched,
            lastUpdatedAt: new Date()
          },
            {
              where: {
                id: listId,
                userId: request.user.id
              }
            });

          // User Settings Data
          if (doUpdateListing) {
            const removeUserSettingsData = await UserListingData.destroy({
              where: {
                listId
              }
            });

            // Assign other settings values in here
            let otherListSettings = [
              { settingsId: carType, listId },
              { settingsId: model, listId },
              { settingsId: year, listId },
              { settingsId: make, listId },
              { settingsId: odometer, listId },
            ];

            // Bulk create on UserListingData to store other settings of this listingSteps
            const createOtherSettings = await UserListingData.bulkCreate(otherListSettings);

            // Car features
            if (carFeatures != null && carFeatures != undefined) {
              const removeAmenities = await UserAmenities.destroy({
                where: {
                  listId: listId
                }
              });
              carFeatures.map(async (item, key) => {
                let updateAmenities = await UserAmenities.create({
                  listId: listId,
                  amenitiesId: item
                })
              });
            }

            const listData = await Listing.findOne({
              where: {
                id: listId
              },
              raw: true
            });

            return await {
              id: listId,
              status: 200,
              actionType: 'update',
              results: listData
            };
          } else {
            return {
              status: 400,
              errorMessage: 'Oops! Unable to update the information. Please try again.'
            }
          }
        } else { // Create
          doCreateListing = await Listing.create({
            userId: request.user.id,
            transmission,
            personCapacity,
            country,
            street,
            buildingName,
            city,
            state,
            zipcode,
            lat: latValue,
            lng: lngValue,
            lastUpdatedAt: new Date()
          });
          if (doCreateListing) {
            // Recently added list id
            const id = doCreateListing.dataValues.id;

            // Assign other settings values in here
            let otherUserListingData = [
              { settingsId: carType, listId: id },
              { settingsId: model, listId: id },
              { settingsId: year, listId: id },
              { settingsId: make, listId: id },
              { settingsId: odometer, listId: id },
            ];

            // Bulk create on UserListingData to store other settings of this listingSteps
            const createUserListingData = await UserListingData.bulkCreate(otherUserListingData);

            return await {
              status: 200,
              id,
              actionType: 'create',
              results: doCreateListing
            };
          } else {
            return {
              status: 400,
              errorMessage: 'Oops! Unable to list your car. Please try again.'
            }
          }
        }
      } else {
        return {
          status: 500,
          errorMessage: 'Oops! It looks like you haven\'t logged-in. Please login and list your car! '
        };
      }

    } catch (error) {
      return {
        errorMessage: 'Something went wrong ' + error,
        status: 400
      };
    }
  },
};

export default createListing;
