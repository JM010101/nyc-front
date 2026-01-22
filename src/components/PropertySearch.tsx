import { useState } from 'react';
import { usePropertyLookup } from '../hooks/usePropertyLookup';
import { PropertyMap } from './PropertyMap';

export const PropertySearch = () => {
  const [searchType, setSearchType] = useState<'address' | 'bbl'>('address');
  const [address, setAddress] = useState('');
  const [bbl, setBBL] = useState('');

  const lookupParams = searchType === 'address' 
    ? { address } 
    : { bbl };

  const { data, isLoading, error, refetch } = usePropertyLookup(
    lookupParams,
    false // Don't auto-fetch, wait for button click
  );

  const handleSearch = () => {
    if (searchType === 'address' && address.trim()) {
      refetch();
    } else if (searchType === 'bbl' && bbl.trim()) {
      refetch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">NYC Property Zoning Lookup</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSearchType('address')}
            className={`px-4 py-2 rounded ${
              searchType === 'address'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Search by Address
          </button>
          <button
            onClick={() => setSearchType('bbl')}
            className={`px-4 py-2 rounded ${
              searchType === 'bbl'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Search by BBL
          </button>
        </div>

        <div className="flex gap-2">
          {searchType === 'address' ? (
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address (e.g., 123 Main St, Manhattan)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          ) : (
            <input
              type="text"
              value={bbl}
              onChange={(e) => setBBL(e.target.value)}
              placeholder="Enter BBL (e.g., 1000120001)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          )}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error instanceof Error ? error.message : 'Failed to fetch property'}
        </div>
      )}

      {data?.property && (
        <div className="space-y-6">
          {/* Map */}
          <PropertyMap property={data.property} />
          
          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Property Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">BBL</p>
              <p className="font-semibold">{data.property.bbl}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold">{data.property.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Borough</p>
              <p className="font-semibold">{data.property.borough}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Block / Lot</p>
              <p className="font-semibold">{data.property.block} / {data.property.lot}</p>
            </div>
            {data.property.land_area && (
              <div>
                <p className="text-sm text-gray-600">Land Area</p>
                <p className="font-semibold">{data.property.land_area.toLocaleString()} sq ft</p>
              </div>
            )}
            {data.property.year_built && (
              <div>
                <p className="text-sm text-gray-600">Year Built</p>
                <p className="font-semibold">{data.property.year_built}</p>
              </div>
            )}
          </div>

          {data.property.zoning_districts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Zoning Districts</h3>
              <div className="space-y-2">
                {data.property.zoning_districts.map((zd, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded">
                    <span className="font-semibold">{zd.code}</span>
                    <span className="text-gray-600 ml-2">({zd.type})</span>
                    {zd.is_primary && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.property.nearby_landmarks.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Nearby Landmarks (within 150 ft)</h3>
              <div className="space-y-2">
                {data.property.nearby_landmarks.map((lm, idx) => (
                  <div key={idx} className="bg-yellow-50 p-3 rounded">
                    <span className="font-semibold">{lm.name}</span>
                    <span className="text-gray-600 ml-2">({lm.landmark_type})</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {lm.distance_feet.toFixed(1)} ft away
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {data?.error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {data.error}
        </div>
      )}
    </div>
  );
};
