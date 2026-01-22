import { useQuery } from 'react-query';
import { propertyService } from '../services/api';
import { PropertyLookupResponse } from '../types';

interface LookupParams {
  address?: string;
  bbl?: string;
  lat?: number;
  lon?: number;
}

export const usePropertyLookup = (params: LookupParams, enabled: boolean = true) => {
  const hasParams = !!params.address || !!params.bbl || (!!params.lat && !!params.lon);
  
  return useQuery<PropertyLookupResponse>(
    ['property-lookup', params],
    () => propertyService.lookup(params),
    {
      enabled: enabled && hasParams,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};
