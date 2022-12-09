import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import { fetchData, FETCH_ERRORS, FETCH_METHODS, FETCH_SUCCESS } from '../api/fetchData';
import { topicAdminEndpoint } from '../appConfig';
import { TopicAdminData } from '../types/TopicAdmin';
import { TOPIC_ADMIN_KEY } from './useTopicAdmin';

interface UseAddOrUpdateTopicOptions
    extends UseMutationOptions<TopicAdminData, Error, TopicAdminData, Error | Response> {
    id?: number | string;
}

export const useAddOrUpdateTopicAdmin = ({ id, ...options }: UseAddOrUpdateTopicOptions) => {
    const queryClient = useQueryClient();

    return useMutation(
        (formData) => {
            const bodyData = JSON.stringify({
                ...formData,
                name: {
                    ...(formData?.name || {}),
                    translate: undefined,
                },
                description: {
                    ...(formData?.description || {}),
                    translate: undefined,
                },
                external: false,
                dioceseId: 0,
                status: formData.status ? 'ACTIVE' : 'INACTIVE',
            });

            if (id) {
                return fetchData({
                    url: `${topicAdminEndpoint}/${id}`,
                    method: FETCH_METHODS.PUT,
                    responseHandling: [FETCH_ERRORS.CATCH_ALL],
                    bodyData,
                });
            }
            return fetchData({
                url: `${topicAdminEndpoint}`,
                method: FETCH_METHODS.POST,
                responseHandling: [FETCH_ERRORS.CATCH_ALL, FETCH_SUCCESS.CONTENT],
                bodyData,
            });
        },
        {
            ...options,
            onSuccess: (response, vars, context) => {
                queryClient.invalidateQueries(TOPIC_ADMIN_KEY);
                options?.onSuccess?.(response, vars, context);
            },
        },
    );
};
