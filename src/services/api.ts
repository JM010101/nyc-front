import axios from 'axios';
import { API_BASE } from '../config';
import { PropertyLookupResponse, Property } from '../types';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const propertyService = {
  lookup: async (params: {
    address?: string;
    bbl?: string;
    lat?: number;
    lon?: number;
  }): Promise<PropertyLookupResponse> => {
    const response = await api.get<PropertyLookupResponse>('/properties/lookup', { params });
    return response.data;
  },

  getByBBL: async (bbl: string): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${bbl}`);
    return response.data;
  },

  getGeometry: async (bbl: string): Promise<any> => {
    const response = await api.get(`/properties/${bbl}/geometry`);
    return response.data;
  },

  getNearbyGeometry: async (bbl: string, distanceFeet: number = 150): Promise<any> => {
    const response = await api.get(`/properties/${bbl}/nearby-geometry`, {
      params: { distance_feet: distanceFeet },
    });
    return response.data;
  },
};

export default api;
