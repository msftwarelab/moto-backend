import searchListingType from '../../types/searchListingType';
import {
  Listing,
  SearchSettings,
  CurrencyRates,
  Currencies,
} from '../../../data/models';
import sequelize from '../../sequelize';
import { googleMapAPI } from '../../../config';

import fetch from 'node-fetch';

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLFloat as FloatType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BoolType
} from 'graphql';
import { convert } from '../../../helpers/currencyConvertion';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';
import moment from 'moment';

const SearchListing = {

  type: searchListingType,

  args: {
    personCapacity: { type: IntType },
    dates: { type: StringType },
    currentPage: { type: IntType },
    lat: { type: FloatType },
    lng: { type: FloatType },
    carType: { type: new List(IntType) },
    carFeatures: { type: new List(IntType) },
    carRules: { type: new List(IntType) },
    priceRange: { type: new List(IntType) },
    bookingType: { type: StringType },
    address: { type: StringType },
    currency: { type: StringType },
    make: { type: IntType },
    transmission: { type: IntType }
  },

  async resolve({ request }, {
    personCapacity,
    dates,
    currentPage,
    lat,
    lng,
    carType,
    carFeatures,
    carRules,
    priceRange,
    bookingType,
    address,
    currency,
    make,
    transmission
  }) {

    try {

      let limit = 10;
      let offset = 0;
      let attributesParam = ['id', 'title', 'personCapacity', 'lat', 'lng', 'transmission', 'coverPhoto', 'bookingType', 'userId'];
      let publishedStatus = {}, personCapacityFilter = {}, datesFilter = {}, locationFilter = {};
      let carTypeFilter = {};
      let carFeaturesFilter = {}, carRulesFilter = {}, priceRangeFilter = {}, geographyFilter, mapBoundsFilter;
      let bookingTypeFilter = {}, countryFilter = {}, rates, ratesData = {};
      let sw_lat, sw_lng, ne_lat, ne_lng, priceRangeCurrency, unAvailableFilter = {}, geographyData = {};
      let makeFilter = {}, transmissionFilter = {}, maximumNoticeFilter, minDaysFilter, maxDaysFilter;
      let geoType, state, country, stateLongName, street;

      if (request && request.user) {
        const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
        if (userStatusErrorMessage) {
          return {
            status: userStatusError,
            errorMessage: userStatusErrorMessage
          };
        }
      }

      const searchSettings = await SearchSettings.findOne({
        raw: true
      });

      if (searchSettings) {
        priceRangeCurrency = searchSettings.priceRangeCurrency
      }

      const data = await CurrencyRates.findAll();
      const base = await Currencies.findOne({ where: { isBaseCurrency: true } });
      if (data) {
        data.map((item) => {
          ratesData[item.dataValues.currencyCode] = item.dataValues.rate;
        })
      }

      rates = ratesData;

      if (address) {
        const URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=' + googleMapAPI;
        let types = [], viewport;

        const geoCodeData = await new Promise((resolve, reject) => {
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

        if (geoCodeData && geoCodeData.results) {
          geoCodeData.results.map((value, key) => {
            viewport = value.geometry.viewport;
            types = value.types;
            sw_lat = viewport.southwest.lat;
            sw_lng = viewport.southwest.lng;
            ne_lat = viewport.northeast.lat;
            ne_lng = viewport.northeast.lng;
            lat = geoCodeData.results[0].geometry.location.lat;
            lng = geoCodeData.results[0].geometry.location.lng;

            value.address_components.map((item) => {
              if (item.types[0] == "administrative_area_level_1") {
                geographyData["administrative_area_level_1_short"] = item.short_name;
                geographyData["administrative_area_level_1_long"] = item.long_name;
              } else if (item.types[0] == "country") {
                geographyData[item.types[0]] = item.short_name;
              } else {
                geographyData[item.types[0]] = item.long_name;
              }

              if (types) {
                if (types.indexOf("country") > -1) {
                  geoType = "country";
                } else if (types.indexOf("administrative_area_level_1") > -1) {
                  geoType = "state";
                } else if (types.indexOf("administrative_area_level_2") > -1) {
                  geoType = "city";
                } else if (types.indexOf("street_address") > -1 || types.indexOf("route") > -1) {
                  geoType = "street";
                } else {
                  geoType = null;
                }
              }
            });
          });
        }
      }


      if (sw_lat && ne_lat && sw_lng && ne_lng) {
        mapBoundsFilter = {
          id: {
            $in: [
              sequelize.literal(`
                  SELECT
                      id
                  FROM
                      Listing
                  WHERE
                      (
                         lat BETWEEN ${sw_lat} AND ${ne_lat} 
                      ) AND (
                         lng BETWEEN ${sw_lng} AND ${ne_lng}
                      )
                `)
            ]
          }
        };
      }

      if (geoType) {
        let geographyConverted = geographyData;

        if (geoType === 'street') {
          geographyFilter = {
            $or: [
              {
                street: {
                  $like: '%' + geographyConverted.route + '%'
                },
                state: geographyConverted.administrative_area_level_1_short,
                country: geographyConverted.country
              },
              {
                street: {
                  $like: '%' + geographyConverted.route + '%'
                },
                state: {
                  $like: geographyConverted.administrative_area_level_1_long + '%'
                },
                country: geographyConverted.country
              }
            ]
          };
          countryFilter = {
            country: geographyConverted.country
          };
        } else if (geoType === 'state') {
          geographyFilter = {
            $or: [
              {
                state: geographyConverted.administrative_area_level_1_short,
                country: geographyConverted.country
              },
              {
                state: {
                  $like: geographyConverted.administrative_area_level_1_long + '%',
                },
                country: geographyConverted.country
              }
            ]
          };
          countryFilter = {
            country: geographyConverted.country
          };
        } else if (geoType === 'country') {
          countryFilter = {
            country: geographyConverted.country
          };
        }
      } else {
        if (lat && lng) {
          let distanceValue = 300;
          geographyFilter = {
            id: {
              $in: [
                sequelize.literal(`
                    SELECT
                        id
                    FROM
                        Listing
                    WHERE
                        (
                            6371 *
                            acos(
                                cos( radians( ${lat} ) ) *
                                cos( radians( lat ) ) *
                                cos(
                                    radians( lng ) - radians( ${lng} )
                                ) +
                                sin(radians( ${lat} )) *
                                sin(radians( lat ))
                            )
                        ) < ${distanceValue}
                  `)
              ]
            }
          };
        }
      }

      // Booking Type filter
      if (bookingType && bookingType === 'instant') {
        bookingTypeFilter = {
          bookingType
        }
      }

      // Price Range
      if (priceRange != undefined && priceRange.length > 0) {
        let rangeStart = convert(base, rates, priceRange[0], currency, priceRangeCurrency);
        let rangeEnd = convert(base, rates, priceRange[1], currency, priceRangeCurrency);

        priceRangeFilter = {
          id: {
            $in: [
              sequelize.literal(`SELECT listId FROM ListingData WHERE (basePrice / (SELECT rate FROM CurrencyRates WHERE currencyCode=currency limit 1)) BETWEEN ${rangeStart} AND ${rangeEnd}`)
            ]
          }

        };
      }

      unAvailableFilter = {
        id: {
          $notIn: [
            sequelize.literal(`SELECT listId FROM ListingData WHERE maxDaysNotice='unavailable'`)
          ]
        }
      };

      // Offset from Current Page
      if (currentPage) {
        offset = (currentPage - 1) * limit;
      }

      // Published Status
      publishedStatus = {
        isPublished: true
      };

      // Person Capacity Filter
      if (personCapacity) {
        personCapacityFilter = {
          personCapacity: {
            $gte: personCapacity
          }
        };
      }

      // Date Range Filter
      if (dates && dates.toString().trim() !== '') {
        let noticeFilter = [], spiltDate = dates.split("AND"), checkIn, checkOut;

        if(spiltDate){
          checkIn = moment(spiltDate[0].replace(/[']/g, '').trim(' '));
          checkOut = moment(spiltDate[1].replace(/[']/g, '').trim(' '));
        }
        
        await [3, 6, 9, 12].map((value) => {
          let date = moment().add(value, 'months').format('YYYY-MM-DD');
          if (checkOut.isBetween(checkIn, date)) noticeFilter.push(`'${value}months'`);
        });
  
        let maxDaysNoticeFilter = noticeFilter.length > 0 ? `'available',${noticeFilter.toString()}` : `'available'`;
        //Maximum Notice Filter
        maximumNoticeFilter = {
          id: {
            $in: [
              sequelize.literal("SELECT listId FROM ListingData WHERE maxDaysNotice in (" + maxDaysNoticeFilter + ")")
            ]
          }
        };
  
        // Min Night Filter
        minDaysFilter = {
          id: {
            $in: [
              sequelize.literal(`SELECT listId FROM ListingData WHERE minDay = 0 OR minDay <= ${checkOut.diff(checkIn, 'days') + 1}`)
            ]
          }
        };
  
        //Max Night Filter
        maxDaysFilter = {
          id: {
            $in: [
              sequelize.literal(`SELECT listId FROM ListingData WHERE maxDay = 0 OR maxDay >= ${checkOut.diff(checkIn, 'days') + 1}`)
            ]
          }
        };
  
        datesFilter = {
          $or: [
            {
              id: {
                $notIn: [
                  sequelize.literal("SELECT listId FROM ListBlockedDates Where calendarStatus!='available'")
                ]
              }
            },
            {
              id: {
                $notIn: [
                  sequelize.literal("SELECT listId FROM ListBlockedDates WHERE blockedDates BETWEEN" + dates + " AND calendarStatus != 'available'")

                ]
              }
            }
          ]
        }
      }

      // Car type Filter
      if (carType != undefined && carType.length > 0) {
        carTypeFilter = {

          id: {
            $in: [
              sequelize.literal(`SELECT listId FROM UserListingData WHERE settingsId in(${carType.toString()})`)
            ]
          }

        };
      }

      // Make Filter
      if (make) {
        makeFilter = {
          id: {
            $in: [
              sequelize.literal(`SELECT listId FROM UserListingData WHERE settingsId in(${make})`)
            ]
          }
        };
      }

      // Transmission Filter
      if (transmission && transmission === 1) {
        transmissionFilter = {
          transmission: 1
        };
      }

      // Car Features Filter
      if (carFeatures != undefined && carFeatures.length > 0) {
        carFeaturesFilter = {
          id: {
            $in: [
              sequelize.literal(`SELECT listId FROM UserAmenities WHERE amenitiesId in(${carFeatures.toString()}) GROUP BY listId`)
            ]
          }
        };
      }

      // Car Rules Filter
      if (carRules != undefined && carRules.length > 0) {
        carRulesFilter = {
          id: {
            $in: [
              sequelize.literal(`SELECT listId FROM UserHouseRules WHERE houseRulesId in(${carRules.toString()}) GROUP BY listId`)
            ]
          }
        };
      }


      let where, filters = [
        bookingTypeFilter,
        publishedStatus,
        personCapacityFilter,
        datesFilter,
        carTypeFilter,
        carFeaturesFilter,
        carRulesFilter,
        priceRangeFilter,
        countryFilter, //To prevent france country to get in the result, while searching for united kingdom
        unAvailableFilter,
        makeFilter,
        maxDaysFilter,
        minDaysFilter,
        maximumNoticeFilter,
        transmissionFilter
      ];

      if (mapBoundsFilter || geographyFilter) {
        where = {
          $or: [
            mapBoundsFilter || {},
            geographyFilter || {}
          ],
          $and: filters
        };
      } else {
        where = { $and: filters }
      }

      const count = await Listing.count({ where });
      const results = await Listing.findAll({
        attributes: attributesParam,
        where,
        limit,
        offset,
        order: [['reviewsCount', 'DESC'], ['createdAt', 'DESC']],
      });

      return await {
        currentPage,
        count,
        results,
        status: (results && results.length > 0) ? 200 : 400,
        errorMessage: (results && results.length > 0) ? null : 'No records found!'
      }

    } catch (error) {
      return {
        errorMessage: 'Something went wrong' + error,
        status: 400
      };
    }
  },
};

export default SearchListing;