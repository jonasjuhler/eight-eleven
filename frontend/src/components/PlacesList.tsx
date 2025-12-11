import { PointOfInterest } from '../types';

interface PlacesListProps {
  places: PointOfInterest[];
}

export function PlacesList({ places }: PlacesListProps) {
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Historic Landmark': 'text-amber-700 bg-amber-50',
      'Waterfront District': 'text-blue-700 bg-blue-50',
      'Royal Palace': 'text-purple-700 bg-purple-50',
      'Amusement Park': 'text-pink-700 bg-pink-50',
      'Statue & Monument': 'text-gray-700 bg-gray-100',
      'Castle & Museum': 'text-indigo-700 bg-indigo-50',
      'District': 'text-gray-700 bg-gray-100',
      'Park': 'text-green-700 bg-green-50',
      'Museum': 'text-indigo-700 bg-indigo-50',
      'Square': 'text-orange-700 bg-orange-50',
      'Scenic Route': 'text-teal-700 bg-teal-50',
      'Gallery': 'text-violet-700 bg-violet-50'
    };
    return colors[category] || 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-gray-900">Nearby places</h2>
          <p className="text-gray-500 mt-1">Within 2km • Click any place for details</p>
        </div>
      </div>

      {places.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-sm">
          <p className="text-gray-500">No places found nearby. Try a different location.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <button
              key={place.id}
              className="border-2 border-gray-200 p-6 rounded-sm hover:border-gray-900 hover:shadow-md transition-all text-left group bg-white"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-gray-900 group-hover:text-gray-700 transition-colors">{place.name}</h3>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-gray-900 font-mono">
                      {formatDistance(place.distance)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
                
                <div className="pt-2">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-sm ${getCategoryColor(place.category || 'Point of interest')}`}
                  >
                    {place.category ?? 'Point of interest'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}