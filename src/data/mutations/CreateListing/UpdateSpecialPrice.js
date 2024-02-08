// GrpahQL
import {
	GraphQLList as List,
	GraphQLString as StringType,
	GraphQLInt as IntType,
	GraphQLNonNull as NonNull,
	GraphQLFloat as FloatType,
} from 'graphql';
import moment from 'moment';
import sequelize from 'sequelize';

// GraphQL Type
import ListBlockedDatesResponseType from '../../types/ListBlockedDatesType';

// Sequelize models
import {
	Listing,
	ListBlockedDates
} from '../../../data/models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const UpdateSpecialPrice = {

	type: ListBlockedDatesResponseType,

	args: {
		listId: { type: new NonNull(IntType) },
		blockedDates: { type: new List(StringType) },
		calendarStatus: { type: StringType },
		isSpecialPrice: { type: FloatType }
	},

	async resolve({ request, response }, {
		listId,
		blockedDates,
		calendarStatus,
		isSpecialPrice
	}) {

		try {

			// Check whether user is logged in
			if (request.user || request.user.admin) {

				const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
				if (userStatusErrorMessage) {
					return {
						status: userStatusError,
						errorMessage: userStatusErrorMessage
					};
				}

				let where = { listId };
				if (!request.user.admin) {
					where = {
						listId,
						userId: request.user.id
					}
				};

				// Confirm whether the Listing Id is available
				const isListingAvailable = await Listing.findById(listId);
				let isValue = false;

				if (isListingAvailable) {
					if (blockedDates) {
						let day;
						let itemValue;
						await Promise.all(blockedDates.map(async (item, key) => {
							day = moment(item).format('YYYY-MM-DD');

							let dayList = sequelize.where(sequelize.fn('DATE', sequelize.col('blockedDates')), day);


							let blockedDatesFind = await ListBlockedDates.findAll({
								where: {
									blockedDates: dayList,
									listId: listId
								}
							})

							if (blockedDatesFind && blockedDatesFind.length > 0) {

								itemValue = item;
								await Promise.all(blockedDatesFind.map(async (value, keys) => {

									if (itemValue === value.blockedDates) {
										//console.log('item value 1st', itemValue)
									} else {

										if ((isSpecialPrice && calendarStatus == 'available') || (!isSpecialPrice && calendarStatus == 'blocked')) {
											const updateDates = await ListBlockedDates.update({
												listId,
												blockedDates: value.blockedDates,
												isSpecialPrice: isSpecialPrice,
												calendarStatus: calendarStatus,
											},
												{
													where: {
														listId,
														blockedDates: value.blockedDates
													}
												});
										} else if (!isSpecialPrice && calendarStatus != 'blocked') {
											const removeBlockedDates = await ListBlockedDates.destroy({
												where: {
													listId,
													blockedDates: value.blockedDates
												}
											});
										}
									}
								}));
							}

							if (((calendarStatus == 'blocked') || (calendarStatus == 'available' && isSpecialPrice)) && blockedDatesFind.length == 0) {
								let updateBlockedDates = await ListBlockedDates.findOrCreate({
									where: {
										listId,
										blockedDates: item,
										calendarStatus: calendarStatus,
										isSpecialPrice: isSpecialPrice,
									},
									defaults: {
										//properties you want on create
										listId,
										blockedDates: item,
										calendarStatus: calendarStatus,
										isSpecialPrice: isSpecialPrice,
									}
								});
							}

						}));

						const listBlockedData = await ListBlockedDates.findAll({
							where: {
								listId
							},
							raw: true
						});

						return {
							results: listBlockedData,
							status: 200
						}

					} else {
						return {
							status: 400,
							errorMessage: 'Please select dates'
						}
					}
				} else {
					return {
						status: 400,
						errorMessage: 'Please send correct list id'
					}
				}


			} else {
				return {
					status: 500,
					errorMessage: 'Not a logged user'
				}
			}
		} catch (error) {
			return {
				status: 400,
				errorMessage: 'Something went wrong' + error
			};
		}

	},

};

export default UpdateSpecialPrice;


/*
mutation (
		$listId: Int!,
		$blockedDates: [String]
) {
		UpdateSpecialPrice (
				listId: $listId,
				blockedDates: $blockedDates
		)
		{
				status
		}
}
*/
