import { WhyHost } from '../../models';
import WhyHostCommonType from '../../types/siteadmin/WhyHostCommonType';

const getWhyHostData = {
	type: WhyHostCommonType,

	async resolve({ request }) {
		try {
			const results = await WhyHost.findAll();
			return await {
				results,
				status: 200
			}
		} catch (error) {
			return {
				errorMessage: 'Something went wrong' + error,
				status: 400
			};
		}

	}
}

export default getWhyHostData;