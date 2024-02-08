import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLFloat as FloatType,
  GraphQLList as List,
} from 'graphql';
import UserVerifiedInfoType from './UserVerifiedInfoType';
import CancellationType from './CancellationType';
import ListCalendarType from './ListCalendarType';
import ReviewsType from './ReviewsType';
import { Cancellation, Reviews, ListCalendar, WishList, Listing, ListSettings, ListPhotos } from '../models';
import { ListBlockedDates as BlockedDates } from '../models';
import sequelize from '../sequelize';

const Profile = new ObjectType({
  name: 'profile',
  fields: {
    profileId: {
      type: IntType,
    },
    firstName: {
      type: StringType,
    },
    lastName: {
      type: StringType,
    },
    displayName: {
      type: StringType,
    },
    dateOfBirth: {
      type: StringType,
    },
    picture: {
      type: StringType,
    },
    location: {
      type: StringType,
    },
    info: {
      type: StringType,
    },
    createdAt: {
      type: StringType,
    }
  }
});
const User = new ObjectType({
  name: 'user',
  fields: {
    email: {
      type: StringType,
      resolve(user) {
        return user.email;
      }
    },
    profile: {
      type: Profile,
      resolve(user) {
        return user.getProfile();
      }
    },
    verification: {
      type: UserVerifiedInfoType,
      resolve(user) {
        return user.getUserVerifiedInfo();
      }
    },
    userBanStatus: {
      type: IntType,
      resolve(user) {
        return user.userBanStatus;
      }
    },
  }
});
const ListSettingsTypes = new ObjectType({
  name: 'listSettingsTypes',
  fields: {
    id: { type: IntType },
    typeName: { type: StringType },
    typeLabel: { type: StringType },
    step: { type: StringType },
    fieldType: { type: StringType },
    isEnable: { type: StringType },
    status: { type: StringType },
  },
});
const SingleListSettings = new ObjectType({
  name: 'singleListSettings',
  fields: {
    id: { type: IntType },
    typeId: { type: IntType },
    itemName: { type: StringType },
    otherItemName: { type: StringType },
    maximum: { type: IntType },
    minimum: { type: IntType },
    startValue: { type: IntType },
    endValue: { type: IntType },
    isEnable: { type: StringType },
    makeType: { type: IntType },
    settingsType: {
      type: ListSettingsTypes,
      resolve(singleListSettings) {
        return singleListSettings.getListSettingsTypes();
      }
    },
  }
});

const AllListSettingTypes = new ObjectType({
  name: 'allListSettingTypes',
  fields: {
    id: {
      type: IntType,
    },
    itemName: {
      type: StringType
    }
  }
});

// Spaces
const ListBedTypes = new ObjectType({
  name: 'listBedTypes',
  fields: {
    bedType: {
      type: IntType,
      resolve(listBedTypes) {
        return listBedTypes.bedType;
      }
    },
    listsettings: {
      type: SingleListSettings,
      resolve(listBedTypes) {
        return listBedTypes.getListSettings();
      }
    },
  }
});

// List Blocked Dates
const ListBlockedDates = new ObjectType({
  name: 'listBlockedDates',
  fields: {
    blockedDates: {
      type: StringType,
      resolve(listBlockedDates) {
        return listBlockedDates.blockedDates;
      }
    },
    reservationId: {
      type: IntType,
      resolve(listBlockedDates) {
        return listBlockedDates.reservationId;
      }
    },
    listId: {
      type: IntType,
      resolve(listBlockedDates) {
        return listBlockedDates.listId;
      }
    },
    calendarStatus: { type: StringType },
    isSpecialPrice: { type: FloatType },
  }
});
// Listing More Data
const ListingData = new ObjectType({
  name: 'listingData',
  fields: {
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
    cancellationPolicy: { type: IntType },
    securityDeposit: { type: FloatType },
    cancellation: {
      type: CancellationType,
      resolve(listingData) {
        return Cancellation.findOne({
          where: {
            id: listingData.cancellationPolicy,
            isEnable: true
          }
        });
      }
    }
  }
});
// User Listing Data
const UserListingData = new ObjectType({
  name: 'userListingData',
  fields: {
    id: {
      type: IntType,
      resolve(userListingData) {
        return userListingData.id;
      }
    },
    settingsId: {
      type: IntType,
      resolve(userListingData) {
        return userListingData.settingsId;
      }
    },
    listsettings: {
      type: SingleListSettings,
      async resolve(userListingData) {
        return await ListSettings.findOne({
          where: {
            id: userListingData.settingsId,
            isEnable: '1'
          }
        });
        // return userListingData.getListSettings();
      }
    },
  }
});
// Listing Steps
const UserListingSteps = new ObjectType({
  name: 'userListingSteps',
  fields: {
    id: { type: IntType },
    listId: { type: IntType },
    step1: { type: StringType },
    step2: { type: StringType },
    step3: { type: StringType },
    currentStep: { type: IntType },
    status: { type: StringType },
  },
});
// Recommended Listing
const Recommend = new ObjectType({
  name: 'recommend',
  fields: {
    id: { type: IntType },
    listId: { type: IntType },
    status: { type: StringType },
  },
});
// Listing Photos
const ListPhotosData = new ObjectType({
  name: 'listPhotosData',
  fields: {
    id: { type: IntType },
    listId: { type: IntType },
    name: { type: StringType },
    type: { type: StringType },
    status: { type: StringType },
  },
});
const ShowListingType = new ObjectType({
  name: 'ShowListing',
  fields: {
    id: { type: IntType },
    userId: { type: StringType },
    title: { type: StringType },
    description: { type: StringType },
    bedrooms: { type: StringType },
    buildingSize: { type: StringType },
    beds: { type: IntType },
    personCapacity: { type: IntType },
    bathrooms: { type: FloatType },
    country: { type: StringType },
    street: { type: StringType },
    buildingName: { type: StringType },
    city: { type: StringType },
    state: { type: StringType },
    zipcode: { type: StringType },
    lat: { type: FloatType },
    lng: { type: FloatType },
    // coverPhoto: { type: IntType },
    transmission: { type: StringType },
    coverPhoto: {
      type: IntType,
      async resolve(listing) {
        let cover, coverImageData;
        if (listing && listing.coverPhoto) {
          let coverImage = await ListPhotos.findOne({
            where: {
              id: listing.coverPhoto
            }
          })
          if (coverImage) {
            cover = coverImage.id;
          } else {
            cover = null;
          }
        } else if (listing) {
          coverImageData = await ListPhotos.findOne({
            where: {
              listId: listing.id
            },
            order: [[`id`, `ASC`]],
            limit: 1,
          })
          if (coverImageData) {
            cover = coverImageData.id;
          } else {
            cover = null;
          }
        }
        return await cover;
      }
    },
    listCoverPhoto: {
      type: ListPhotosData,
      resolve(listing) {
        if (listing.coverPhoto) {
          return ListPhotos.findOne({
            where: {
              id: listing.coverPhoto
            }
          })
        } else {
          return ListPhotos.findOne({
            where: {
              listId: listing.id
            },
            order: [[`id`, `ASC`]],
            limit: 1,
          })
        }

        //return listing.getById(listing.coverPhoto)
      }
    },
    listPhotos: {
      type: new List(ListPhotosData),
      resolve(listing) {
        return listing.getListPhotos()
        //return listing.getById(listing.coverPhoto)
      }
    },
    listPhotoName: {
      type: StringType,
      async resolve(listing) {
        let fileName = null, findCoverPhoto;
        const allPhotos = await listing.getListPhotos();

        if (allPhotos && allPhotos.length > 0) {
          if (listing.coverPhoto) {
            findCoverPhoto = allPhotos.find(o => o.id === listing.coverPhoto);
            if (findCoverPhoto) {
              fileName = findCoverPhoto.name;
            } else {
              fileName = allPhotos[0].name;
            }
          } else {
            fileName = allPhotos[0].name;
          }
        }
        return await fileName;
      }
    },
    listingPhotos: {
      type: new List(ListPhotosData),
      async resolve(listing) {
        const allPhotos = await listing.getListPhotos();
        if (allPhotos && allPhotos.length > 0) {
          let findCoverPhoto, newArray = [];
          findCoverPhoto = allPhotos.find(o => o.id === listing.coverPhoto);
          if (findCoverPhoto) {
            let newArray = allPhotos.slice(0);
            let unSelectIndex = newArray.findIndex(o => (o.id == listing.coverPhoto));

            if (unSelectIndex >= 0) {
              newArray.splice(unSelectIndex, 1);
            }

            newArray.splice(0, 0, findCoverPhoto);

            return newArray;
          } else {
            return allPhotos;
          }
        }
      }
    },
    isMapTouched: { type: BooleanType },
    bookingType: { type: StringType },
    isPublished: { type: BooleanType },
    isReady: { type: BooleanType },
    status: { type: StringType },
    updatedAt: { type: StringType },
    createdAt: { type: StringType },
    lastUpdatedAt: { type: StringType },
    count: { type: IntType },
    user: {
      type: User,
      resolve(listing) {
        return listing.getUser();
      }
    },
    settingsData: {
      type: new List(UserListingData),
      resolve(listing) {
        return listing.getUserListingData();
      }
    },
    carType: {
      type: StringType,
      async resolve(listing) {
        let carTypeLabel = null;
        const carTypeData = await sequelize.query(`SELECT itemName from ListSettings WHERE id IN(SELECT settingsId from UserListingData WHERE listId=${listing.id}) AND typeId=1 LIMIT 1;`, {
          type: sequelize.QueryTypes.SELECT
        });
        if (carTypeData && carTypeData.length > 0) {
          carTypeLabel = carTypeData[0]['itemName'] ? carTypeData[0]['itemName'] : null;
        }
        return await carTypeLabel;
      }
    },
    make: {
      type: StringType,
      async resolve(listing) {
        let makeLabel = null;
        const makeData = await sequelize.query(`SELECT itemName from ListSettings WHERE id IN(SELECT settingsId from UserListingData WHERE listId=${listing.id}) AND typeId=20 LIMIT 1;`, {
          type: sequelize.QueryTypes.SELECT
        });
        if (makeData && makeData.length > 0) {
          makeLabel = makeData[0]['itemName'] ? makeData[0]['itemName'] : null;
        }
        return await makeLabel;
      }
    },
    model: {
      type: StringType,
      async resolve(listing) {
        let modelLabel = null;
        const modelData = await sequelize.query(`SELECT itemName from ListSettings WHERE id IN(SELECT settingsId from UserListingData WHERE listId=${listing.id}) AND typeId=3 LIMIT 1;`, {
          type: sequelize.QueryTypes.SELECT
        });
        if (modelData && modelData.length > 0) {
          modelLabel = modelData[0]['itemName'] ? modelData[0]['itemName'] : null;
        }
        return await modelLabel;
      }
    },
    year: {
      type: StringType,
      async resolve(listing) {
        let modelLabel = null;
        const modelData = await sequelize.query(`SELECT itemName from ListSettings WHERE id IN(SELECT settingsId from UserListingData WHERE listId=${listing.id}) AND typeId=4 LIMIT 1;`, {
          type: sequelize.QueryTypes.SELECT
        });
        if (modelData && modelData.length > 0) {
          modelLabel = modelData[0]['itemName'] ? modelData[0]['itemName'] : null;
        }
        return await modelLabel;
      }
    },
    odometer: {
      type: StringType,
      async resolve(listing) {
        let modelLabel = null;
        const modelData = await sequelize.query(`SELECT itemName from ListSettings WHERE id IN(SELECT settingsId from UserListingData WHERE listId=${listing.id}) AND typeId=21 LIMIT 1;`, {
          type: sequelize.QueryTypes.SELECT
        });
        if (modelData && modelData.length > 0) {
          modelLabel = modelData[0]['itemName'] ? modelData[0]['itemName'] : null;
        }
        return await modelLabel;
      }
    },
    listingData: {
      type: ListingData,
      resolve(listing) {
        return listing.getListingData();
      }
    },
    blockedDates: {
      type: new List(ListBlockedDates),
      async resolve(listing) {
        let convertStartDate = new Date();
        convertStartDate.setHours(0, 0, 0, 0);
        return await BlockedDates.findAll({
          where: {
            listId: listing.id,
            blockedDates: {
              $gte: convertStartDate
            },
          },
          order: [
            [`blockedDates`, `ASC`],
          ],
        })
      }
    },
    listingSteps: {
      type: UserListingSteps,
      resolve(listing) {
        return listing.getUserListingSteps();
      }
    },
    recommend: {
      type: Recommend,
      resolve(listing) {
        return listing.getRecommend();
      }
    },
    reviewsCount: {
      type: IntType,
      async resolve(listing) {
        return await Reviews.count({
          where: {
            listId: listing.id,
            userId: listing.userId
          }
        });
      }
    },
    reviewsStarRating: {
      type: IntType,
      async resolve(listing) {
        return await Reviews.sum('rating', {
          where: {
            listId: listing.id,
            userId: listing.userId
          }
        });
      }
    },
    reviews: {
      type: new List(ReviewsType),
      async resolve(listing) {
        return await Reviews.findAll({
          where: {
            listId: listing.id,
            userId: listing.userId
          },
          limit: 1
        });
      }
    },
    calendars: {
      type: new List(ListCalendarType),
      async resolve(listing) {
        return await ListCalendar.findAll({
          where: {
            listId: listing.id,
          },
        });
      }
    },
    wishListStatus: {
      type: BooleanType,
      async resolve(listing, { }, request) {
        let userId = (request && request.user) ? request.user.id : undefined;
        let count = await WishList.count({
          where: {
            listId: listing.id,
            userId
          },
        });
        return (count) ? true : false
      }
    },
    wishListGroupCount: {
      type: IntType,
      async resolve(listing, { }, request) {
        let userId = (request && request.user) ? request.user.id : undefined;
        let count = await WishList.count({
          where: {
            listId: listing.id,
            userId
          },
        });
        return count;
      }
    },
    isListOwner: {
      type: BooleanType,
      async resolve(listing, { }, request) {
        let userId = (request && request.user) ? request.user.id : undefined;
        let count = await Listing.count({
          where: {
            id: listing.id,
            userId
          },
        });
        return (count) ? true : false;
      }
    },
    carFeatures: {
      type: new List(AllListSettingTypes),
      async resolve(listing) {
        let amenityArray = [];
        const amenitiesData = await sequelize.query(`SELECT * from ListSettings WHERE id IN(SELECT amenitiesId from UserAmenities WHERE listId=${listing.id}) AND typeId=10;`, {
          type: sequelize.QueryTypes.SELECT
        });

        if (amenitiesData && amenitiesData.length > 0) {
          await Promise.all(amenitiesData.map((item, key) => {
            let amenityObject = {};
            amenityObject['id'] = item.id;
            amenityObject['itemName'] = item.itemName;
            amenityArray.push(amenityObject);
          })
          )
        }
        return amenityArray;
      }
    },
    carRules: {
      type: new List(AllListSettingTypes),
      async resolve(listing) {
        let carRulesArray = [];
        const carRulesData = await sequelize.query(`SELECT * from ListSettings WHERE id IN(SELECT houseRulesId from UserHouseRules WHERE listId=${listing.id}) AND typeId=14;`, {
          type: sequelize.QueryTypes.SELECT
        });

        if (carRulesData && carRulesData.length > 0) {
          await Promise.all(carRulesData.map((item, key) => {
            let carRuleObject = {};
            carRuleObject['id'] = item.id;
            carRuleObject['itemName'] = item.itemName;
            carRulesArray.push(carRuleObject);
          })
          )
        }
        return carRulesArray;
      }
    }
  },
});
export default ShowListingType;
