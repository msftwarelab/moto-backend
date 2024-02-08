import CountryData from '../../types/getCountryType';
import { Country } from '../../../data/models';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getCountries = {

    type: CountryData,

    async resolve({ request }) {
        try {

            if (request && request.user) {
                const { userStatusErrorMessage, userStatusError } = await checkUserBanStatus(request.user.id); // Check user ban or deleted status
                if (userStatusErrorMessage) {
                    return {
                        status: userStatusError,
                        errorMessage: userStatusErrorMessage
                    };
                }
            }

            const getCountryList = await Country.findAll();
            if (getCountryList) {
                return {
                    results: getCountryList,
                    status: 200
                }
            } else {
                return {
                    status: 400,
                    errorMessage: "Something Went Wrong"
                }
            }
        } catch (error) {
            return {
                errorMessage: 'Something went wrong' + error,
                status: 400
            };
        }
    }
};

export default getCountries;

/*
{
  getCountries{
    errorMessage
    status
    results{
      id
      isEnable
      countryCode
      countryName
      dialCode
    }
  }
}
*/