import { ImageBanner } from '../../models';
import ImageBannerType from '../../types/siteadmin/ImageBannerType';
import checkUserBanStatus from '../../../libs/checkUserBanStatus';

const getImageBanner = {

  type: ImageBannerType,

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

      const result = await ImageBanner.findOne(
        {
          attributes: ['id', 'title', 'description', 'buttonLabel', 'image', 'buttonLabel2', 'buttonLink1', 'buttonLink2']
        }
      )

      return await {
        status: result ? 200 : 400,
        errorMessage: result ? null : 'Oops! Unable to find. Try again.',
        result
      };
    } catch (error) {
      return {
        status: 400,
        errorMessage: 'Oops! Something went wrong.' + error

      }
    }
  }
};

export default getImageBanner;

