export interface ZoningDistrictInfo {
  code: string;
  type: string;
  is_primary: boolean;
}

export interface NearbyLandmarkInfo {
  name: string;
  landmark_type: string;
  distance_feet: number;
}

export interface Property {
  id: string;
  bbl: string;
  address: string | null;
  borough: string;
  block: number;
  lot: number;
  land_area: number | null;
  year_built: number | null;
  num_floors: number | null;
  units_res: number | null;
  units_total: number | null;
  assessed_value: number | null;
  zoning_districts: ZoningDistrictInfo[];
  nearby_landmarks: NearbyLandmarkInfo[];
  created_at: string;
  updated_at: string;
}

export interface PropertyLookupResponse {
  property: Property | null;
  error: string | null;
}
