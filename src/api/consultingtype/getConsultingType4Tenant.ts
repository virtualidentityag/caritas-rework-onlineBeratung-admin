import { FETCH_ERRORS, FETCH_METHODS, fetchData } from '../fetchData';
import { consultingTypeEndpoint } from '../../appConfig';

export default async function getConsultingType4Tenant(): Promise<string> {
    const consultingTypeResponse = await fetchData({
        url: `${consultingTypeEndpoint}/basic`,
        method: FETCH_METHODS.GET,
        skipAuth: false,
        responseHandling: [FETCH_ERRORS.CATCH_ALL],
    });

    // as consulting types are not used anymore and will be removed in the future we simply pick the first entry here
    return consultingTypeResponse[0].id;
}
