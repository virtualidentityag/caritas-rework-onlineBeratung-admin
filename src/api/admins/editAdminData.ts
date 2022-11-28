import { LabeledValue } from 'antd/lib/select';
import { CounselorData } from '../../types/counselor';
import { FETCH_ERRORS, FETCH_METHODS, fetchData } from '../fetchData';
import { adminEndpoint } from '../../appConfig';
import { encodeUsername } from '../../utils/encryptionHelpers';
import { AdminData } from '../../types/admin';
import { putAgenciesForAdmin } from '../agency/putAgenciesForAdmin';

/**
 * edit admin
 * @param formData - input data from form
 * @return data
 */
export const editAdminData = async (id: string, formData: AdminData): Promise<AdminData> => {
    const { firstname, lastname, email, username, twoFactorAuth } = formData;

    const ids = ((formData.agencies as LabeledValue[])?.map(({ value }) => value) || []) as string[];
    await putAgenciesForAdmin(id, ids);

    return (
        fetchData({
            url: `${adminEndpoint}/${id}`,
            method: FETCH_METHODS.PUT,
            skipAuth: false,
            responseHandling: [FETCH_ERRORS.CATCH_ALL],
            bodyData: JSON.stringify({
                firstname,
                lastname,
                email,
                username: encodeUsername(username),
                twoFactorAuth,
            }),
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                return response.json();
            })
            // eslint-disable-next-line no-underscore-dangle
            .then((data: { _embedded: CounselorData }) => data?._embedded)
    );
};
