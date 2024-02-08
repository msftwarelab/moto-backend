import sequelize from '../sequelize';

// Models
import AdminUser from './siteAdmin/AdminUser';
import User from './User';
import UserLogin from './UserLogin';
import UserProfile from './UserProfile';
import UserVerifiedInfo from './UserVerifiedInfo';
import EmailToken from './EmailToken';
import ForgotPassword from './ForgotPassword';
import ListSettings from './siteAdmin/ListSettings';
import ListSettingsTypes from './siteAdmin/ListSettingsTypes';
import ListViews from './ListViews';
import Listing from './Listing';
import ListBlockedDates from './ListBlockedDates';
import ListingData from './ListingData';
import Cancellation from './Cancellation';
import Reviews from './Reviews';
import ListCalendar from './ListCalendar';
import WishList from './WishList';
import BedTypes from './BedTypes';
import ListPhotos from './ListPhotos';
import UserListingData from './UserListingData';
import Recommend from './Recommend';
import UserAmenities from './UserAmenities';
import UserSafetyAmenities from './UserSafetyAmenities';
import UserSpaces from './UserSpaces';
import UserHouseRules from './UserHouseRules';
import CancellationDetails from './CancellationDetails';
import Payout from './Payout';
import PaymentMethods from './PaymentMethods';
import ThreadItems from './ThreadItems';
import Transaction from './Transaction';
import TransactionHistory from './TransactionHistory';
import Reservation from './Reservation';
import SearchSettings from './SearchSettings';
import ServiceFees from './ServiceFees';
import Threads from './Threads';
import ReportUser from './ReportUser';
import WishListGroup from './WishListGroup';
import Country from './Country';

// Currencies
import Currencies from './Currencies';
import CurrencyRates from './CurrencyRates';
import UserListingSteps from './UserListingSteps';

// SiteAdmin
import SiteSettings from './siteAdmin/SiteSettings';

// Special Price
import ReservationSpecialPricing from './ReservationSpecialPricing';

import ClaimImages from './ClaimImages';
import StaticPage from './StaticPage';
import PopularLocation from './siteAdmin/PopularLocation';
import ImageBanner from './siteAdmin/ImageBanner';
import WhyHost from './siteAdmin/WhyHost';

function sync(...args) {
  return sequelize.sync(...args);
}

// User Table - Releation with other Tables
User.hasMany(UserLogin, {
  foreignKey: 'userId',
  as: 'logins',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasOne(UserProfile, {
  foreignKey: 'userId',
  as: 'profile',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasOne(UserVerifiedInfo, {
  foreignKey: 'userId',
  as: 'userVerifiedInfo',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

User.hasMany(EmailToken, {
  foreignKey: 'userId',
  as: 'emailToken',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

User.hasMany(ForgotPassword, {
  foreignKey: 'userId',
  as: 'forgotPassword',
  onDelete: 'cascade',
  onUpdate: 'cascade'
});

User.hasMany(Payout, {
  foreignKey: 'userId',
  as: 'payout',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

User.hasMany(ReportUser, {
  foreignKey: 'userId',
  as: 'reportUser',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasMany(Listing, {
  foreignKey: 'userId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

ListSettings.belongsTo(ListSettingsTypes, {
  foreignKey: 'typeId',
  as: 'listSettingsTypes',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

ListSettingsTypes.hasMany(ListSettings, {
  foreignKey: 'typeId',
  as: 'listSettings',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

// Other tables relations with User
UserLogin.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

UserProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

UserVerifiedInfo.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

EmailToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

ForgotPassword.belongsTo(User, {
  foreignKey: 'userId',
  as: 'User',
  onDelete: 'cascade',
  onUpdate: 'cascade'
});

Payout.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

UserListingSteps.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Reviews.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasOne(UserListingSteps, {
  foreignKey: 'listId',
  as: 'userListingSteps',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasMany(ListPhotos, {
  foreignKey: 'listId',
  as: 'listPhotos',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasOne(ListingData, {
  foreignKey: 'listId',
  as: 'listingData',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasMany(UserListingData, {
  foreignKey: 'listId',
  as: 'userListingData',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasMany(BedTypes, {
  foreignKey: 'listId',
  as: 'bedTypes',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasOne(Recommend, {
  foreignKey: 'listId',
  as: 'recommend',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Listing.hasMany(ListViews, {
  foreignKey: 'listId',
  as: 'listViews',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

Listing.hasMany(ListCalendar, {
  foreignKey: 'listId',
  as: 'listCalendar',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

Listing.hasMany(Reviews, {
  foreignKey: 'listId',
  as: 'reviews',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

Listing.hasMany(Threads, {
  foreignKey: 'listId',
  as: 'threads',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

ListCalendar.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

ListPhotos.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

ListingData.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

BedTypes.belongsTo(ListSettings, {
  foreignKey: 'bedType',
  as: 'listSettings',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

UserListingData.belongsTo(ListSettings, {
  foreignKey: 'settingsId',
  as: 'listSettings',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Recommend.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

ListViews.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

WishListGroup.hasMany(WishList, {
  foreignKey: 'wishListGroupId',
  as: 'wishList',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

WishList.belongsTo(WishListGroup, {
  foreignKey: 'wishListGroupId',
  as: 'wishListGroup',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

Listing.hasMany(WishList, {
  foreignKey: 'listId',
  as: 'wishList',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

WishList.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

// Amenities
Listing.hasMany(UserAmenities, {
  foreignKey: 'listId',
  as: 'userAmenities',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

// HouseRules
Listing.hasMany(UserHouseRules, {
  foreignKey: 'listId',
  as: 'userHouseRules',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

// Safety Amenities
Listing.hasMany(UserSafetyAmenities, {
  foreignKey: 'listId',
  as: 'userSafetyAmenities',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

// Spaces
Listing.hasMany(UserSpaces, {
  foreignKey: 'listId',
  as: 'userSpaces',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

UserAmenities.belongsTo(ListSettings, {
  foreignKey: 'amenitiesId',
  as: 'listSettings',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

UserHouseRules.belongsTo(ListSettings, {
  foreignKey: 'houseRulesId',
  as: 'listSettings',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

UserSafetyAmenities.belongsTo(ListSettings, {
  foreignKey: 'safetyAmenitiesId',
  as: 'listSettings',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

UserSpaces.belongsTo(ListSettings, {
  foreignKey: 'spacesId',
  as: 'listSettings',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

// Reservation ~~ Transaction

Reservation.hasMany(Transaction, {
  foreignKey: 'reservationId',
  as: 'transaction',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Reservation.hasMany(ListBlockedDates, {
  foreignKey: 'reservationId',
  as: 'listBlockedDates',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Transaction.belongsTo(Reservation, {
  foreignKey: 'reservationId',
  as: 'reservation',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

TransactionHistory.belongsTo(Reservation, {
  foreignKey: 'reservationId',
  as: 'reservation',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

Reservation.hasMany(TransactionHistory, {
  foreignKey: 'reservationId',
  as: 'transactionHistory',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Reservation.hasOne(CancellationDetails, {
  foreignKey: 'reservationId',
  as: 'cancellationDetails',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

// Threads - Relation with other tables

Threads.belongsTo(Listing, {
  foreignKey: 'listId',
  as: 'listing',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Threads.hasMany(ThreadItems, {
  foreignKey: 'threadId',
  as: 'threadItems',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

/** Threads - Relation ends **/

ThreadItems.belongsTo(Threads, {
  foreignKey: 'threadId',
  as: 'threads',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export default { sync };
export {
  AdminUser,
  User,
  UserProfile,
  UserVerifiedInfo,
  EmailToken,
  UserLogin,
  ForgotPassword,
  ListSettings,
  ListSettingsTypes,
  ListViews,
  Listing,
  Cancellation,
  Reviews,
  ListCalendar,
  WishList,
  BedTypes,
  ListPhotos,
  ListingData,
  UserListingData,
  Recommend,
  UserAmenities,
  UserSafetyAmenities,
  UserSpaces,
  UserHouseRules,
  CancellationDetails,
  Payout,
  PaymentMethods,
  ThreadItems,
  Threads,
  Transaction,
  TransactionHistory,
  ListBlockedDates,
  ServiceFees,
  Currencies,
  CurrencyRates,
  SiteSettings,
  SearchSettings,
  Reservation,
  ReportUser,
  WishListGroup,
  Country,
  UserListingSteps,
  ReservationSpecialPricing,
  ClaimImages,
  StaticPage,
  PopularLocation,
  ImageBanner,
  WhyHost
};
