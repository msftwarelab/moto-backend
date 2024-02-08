import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

// Users
import validateEmailExist from './queries/Users/validateEmailExist';
import createUser from './mutations/Users/createUser';
import userLogin from './queries/Users/userLogin';
import testToken from './mutations/Users/testToken';
import userLogout from './mutations/Users/userLogout';
import userAccount from './queries/Users/userAccount';
import userUpdate from './mutations/Users/userUpdate';
import userForgotPassword from './mutations/Users/userForgotPassword';
import verifyForgotPassword from './queries/Users/verifyForgotPassword';
import updateForgotPassword from './mutations/Users/updateForgotPassword';
import userUpdateCommon from './mutations/Users/userUpdateCommon';
import getUserBanStatus from './queries/Users/getUserBanStatus';
import createListing from './mutations/CreateListing/createListing';
import updateListingStep2 from './mutations/CreateListing/updateListingStep2';
import updateListingStep3 from './mutations/CreateListing/updateListingStep3';
import managePublishStatus from './mutations/CreateListing/managePublishStatus';
import deleteUser from './mutations/Users/deleteUser';
import completeReservationTest from './mutations/TestMutation/completeReservationTest';
import getPopularLocations from './queries/Listing/getPopularLocations';

//Listing
import getListingSettings from './queries/ListSettings/getListingSettings';
import getListingSettingsCommon from './queries/ListSettings/getListingSettingsCommon';
import userSocialLogin from './queries/Users/userSocialLogin';
import getMostViewedListing from './queries/Listing/getMostViewedListing';
import getRecommend from './queries/Listing/getRecommend';
import viewListing from './queries/Listing/viewListing';
import getListingDetails from './queries/Listing/getListingDetails';
import getSimilarListing from './queries/Listing/getSimilarListing';
import getReviews from './queries/Listing/getReviews';
import SearchListing from './queries/Search/SearchListing';
import getSearchSettings from './queries/Search/getSearchSettings';
import cancelReservationData from './queries/Reservation/cancelReservationData';

import dateAvailability from './queries/Listing/dateAvailability';

//Reservation
import getAllReservation from './queries/Reservation/getAllReservation';

// Common
import userLanguages from './queries/Common/userLanguages';

// Billing Calculation
import getBillingCalculation from './queries/BillingCalculation/getBillingCalculation';
// Currency 
import getCurrencies from './queries/Currencies/getCurrencies';
import Currency from './queries/Currencies/Currency';
import getDateAvailability from './queries/ContactHost/getDateAvailability';
import CreateEnquiry from './mutations/ContactHost/CreateEnquiry';

// Reservation Details
import getReservation from './queries/Reservation/getReservation';
// SiteSettings
import siteSettings from './queries/siteAdmin/siteSettings';
import getSecureSiteSettings from './queries/siteAdmin/getSecureSiteSettings';

import getUnReadCount from './queries/UnReadCount/getUnReadCount';
import getUnReadThreadCount from './queries/UnReadCount/getUnReadThreadCount';
import createReservation from './mutations/Payment/createReservation';
import confirmReservation from './mutations/Payment/confirmReservation';
import getAllThreads from './queries/GetAllThreads/getAllThreads';
import getThreads from './queries/GetAllThreads/getThreads';
import showUserProfile from './queries/showUserProfile';
import confirmPayPalExecute from './mutations/Payment/confirmPayPalExecute';

import userReviews from './queries/Reviews/userReviews';

import createReportUser from './mutations/ReportUser/createReportUser';

import sendMessage from './mutations/Message/SendMessage';
import readMessage from './mutations/Message/ReadMessage';

import CreateWishListGroup from './mutations/WishList/CreateWishListGroup';
import CreateWishList from './mutations/WishList/CreateWishList';
import UpdateWishListGroup from './mutations/WishList/UpdateWishListGroup';
import DeleteWishListGroup from './mutations/WishList/DeleteWishListGroup';
import getAllWishListGroup from './queries/WishList/getAllWishListGroup';
import getWishListGroup from './queries/WishList/getWishListGroup';
import contactSupport from './queries/ContactSupport/contactSupport';
import getCountries from './queries/Countries/getCountries';
import EmailVerification from './mutations/EmailVerification/EmailVerification';

// Sms Verification
import getPhoneData from './queries/SmsVerification/getPhoneData';
import AddPhoneNumber from './mutations/SmsVerification/AddPhoneNumber';
import RemovePhoneNumber from './mutations/SmsVerification/RemovePhoneNumber';
import VerifyPhoneNumber from './mutations/SmsVerification/VerifyPhoneNumber';

// WhishList
import getAllWishList from './queries/WishList/getAllWishList';
import ResendConfirmEmail from './queries/Users/ResendConfirmEmail';

// Social Verification
import SocialVerification from './mutations/Users/SocialVerification';

// Create Listing
// import createListing from './mutations/CreateListing/createListing';
import locationItem from './queries/locationItem';
import showListingSteps from './queries/Listing/showListingSteps';
import ManageListingSteps from './mutations/CreateListing/ManageListingSteps';
import showListPhotos from './queries/Listing/showListPhotos';
import getPayouts from './queries/Payout/getPayouts';
import ManageListings from './queries/Listing/ManageListings';
import RemoveListPhotos from './mutations/CreateListing/RemoveListPhotos';

// Payout
import getPaymentMethods from './queries/Payout/getPaymentMethods';
import setDefaultPayout from './mutations/Payout/setDefaultPayout';
import addPayout from './mutations/Payout/addPayout';
import RemoveMultiPhotos from './mutations/CreateListing/RemoveMultiPhotos';
import verifyPayout from './mutations/Payout/verifyPayout';
import confirmPayout from './mutations/Payout/confirmPayout';

// Remove Listing
import RemoveListing from './mutations/CreateListing/RemoveListing';

// Update List Blocked
import UpdateListBlockedDates from './mutations/CreateListing/UpdateListBlockedDates';

// Get BlockedDates
import getListBlockedDates from './queries/Listing/getListBlockedDates';

// Reservation Status
import ReservationStatus from './mutations/Message/ReservationStatus';

// Cancell Reservation
import CancelReservation from './mutations/Payment/CancelReservation';

// User Feedback Email
import userFeedback from './mutations/userFeedback';
import UpdateSpecialPrice from './mutations/CreateListing/UpdateSpecialPrice';
import getListingSpecialPrice from './queries/Listing/getListingSpecialPrice';

// Mobile active social Logins
import getActiveSocialLogins from './queries/Common/getActiveSocialLogins';

// StripeKey
import getPaymentSettings from './queries/siteAdmin/getPaymentSettings';
import getImageBanner from './queries/siteAdmin/getImageBanner';

import updateClaim from './mutations/Payment/updateClaim';

import getStaticPageContent from './queries/StaticPage/getStaticPageContent';
import getApplicationVersionInfo from './queries/siteAdmin/getApplicationVersionInfo';

import getUserReviews from './queries/Reviews/getUserReviews';
import getPendingUserReviews from './queries/Reviews/getPendingUserReviews';
import writeUserReview from './mutations/Reviews/writeUserReview';
import getPropertyReviews from './queries/Reviews/getPropertyReviews';
import getPendingUserReview from './queries/Reviews/getPendingUserReview';
import getWhyHostData from './queries/siteAdmin/getWhyHostData';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      validateEmailExist,
      userLogin,
      userAccount,
      userLanguages,
      verifyForgotPassword,
      getListingSettings,
      userSocialLogin,
      getMostViewedListing,
      getRecommend,
      viewListing,
      getListingDetails,
      getSimilarListing,
      getReviews,
      SearchListing,
      dateAvailability,
      getListingSettingsCommon,
      getAllReservation,
      getBillingCalculation,
      getCurrencies,
      Currency,
      siteSettings,
      getSearchSettings,
      getDateAvailability,
      getReservation,
      getUnReadCount,
      getUnReadThreadCount,
      getAllThreads,
      getThreads,
      showUserProfile,
      userReviews,
      cancelReservationData,
      getUserBanStatus,
      getAllWishListGroup,
      getWishListGroup,
      contactSupport,
      getCountries,
      getPhoneData,
      getAllWishList,
      ResendConfirmEmail,
      locationItem,
      showListingSteps,
      showListPhotos,
      getPayouts,
      ManageListings,
      getPaymentMethods,
      getListBlockedDates,
      getListingSpecialPrice,
      getActiveSocialLogins,
      getPaymentSettings,
      getStaticPageContent,
      getPopularLocations,
      getImageBanner,
      getApplicationVersionInfo,
      getUserReviews,
      getPendingUserReviews,
      getPropertyReviews,
      getPendingUserReview,
      getSecureSiteSettings,
      getWhyHostData
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      createUser,
      testToken,
      userLogout,
      userUpdate,
      userForgotPassword,
      updateForgotPassword,
      CreateEnquiry,
      createReservation,
      confirmReservation,
      sendMessage,
      readMessage,
      createReportUser,
      userUpdateCommon,
      CreateWishList,
      CreateWishListGroup,
      DeleteWishListGroup,
      UpdateWishListGroup,
      AddPhoneNumber,
      RemovePhoneNumber,
      EmailVerification,
      VerifyPhoneNumber,
      SocialVerification,
      createListing,
      updateListingStep2,
      ManageListingSteps,
      updateListingStep3,
      managePublishStatus,
      RemoveListPhotos,
      setDefaultPayout,
      addPayout,
      RemoveListing,
      RemoveMultiPhotos,
      UpdateListBlockedDates,
      ReservationStatus,
      userFeedback,
      UpdateSpecialPrice,
      CancelReservation,
      verifyPayout,
      confirmPayout,
      deleteUser,
      updateClaim,
      completeReservationTest,
      confirmPayPalExecute,
      writeUserReview
    }
  })
});

export default schema;
