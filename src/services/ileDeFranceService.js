/**
 * Île-de-France Activities API Service
 * Fetches real activities and equipment data from the open data portal
 */

const IDF_API_BASE_URL = 'https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/recensement-des-equipements-sportifs-loisirs-socio-culturels-en-ile-de-france/records';

/**
 * Fetch activities from Île-de-France API
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of results (default: 20)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {string} options.category - Filter by equipment type
 * @param {string} options.city - Filter by city/commune
 * @returns {Promise<Array>} Array of activities
 */
export const fetchIDFActivities = async ({ limit = 20, offset = 0, category = null, city = null } = {}) => {
  try {
    let url = `${IDF_API_BASE_URL}?limit=${limit}&offset=${offset}`;
    
    // Add filters if provided
    const filters = [];
    if (category) {
      filters.push(`equip_type_famille:"${category}"`);
    }
    if (city) {
      filters.push(`new_name:"${city}"`);
    }
    
    if (filters.length > 0) {
      url += `&where=${filters.join(' AND ')}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch IDF activities');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching IDF activities:', error);
    return [];
  }
};

/**
 * Convert IDF API activity to Nesti format
 * @param {Object} idfActivity - Activity from IDF API
 * @returns {Object} Activity in Nesti format
 */
export const convertIDFToNestiFormat = (idfActivity) => {
  try {
    return {
      id: `idf_${idfActivity.equip_numero}`,
      title: idfActivity.equip_nom || 'Activité sans nom',
      description: `${idfActivity.equip_type_name || 'Équipement'} - ${idfActivity.inst_nom || 'Installation'}`,
      location: {
        address: idfActivity.inst_adresse || '',
        city: idfActivity.new_name || '',
        postalCode: idfActivity.inst_cp || '',
        coordinates: idfActivity.coordonnees ? {
          lat: idfActivity.coordonnees.lat,
          lon: idfActivity.coordonnees.lon
        } : null
      },
      category: mapIDFCategoryToNesti(idfActivity.equip_type_famille),
      type: idfActivity.equip_type_name || 'Sport',
      accessibility: {
        handicapAccess: idfActivity.inst_acc_handi_bool === 'true',
        pmrAccess: idfActivity.equip_pmr_acc === 'true',
        publicTransport: idfActivity.inst_trans_bool === 'true',
        transportTypes: idfActivity.inst_trans_type || []
      },
      amenities: {
        showers: idfActivity.equip_douche === 'true',
        lockers: idfActivity.equip_sanit === 'true',
        publicAccess: idfActivity.equip_ouv_public_bool === 'true',
        freeAccess: idfActivity.equip_acc_libre === 'true'
      },
      source: 'Île-de-France Open Data',
      sourceUrl: `https://data.iledefrance.fr`,
      lastUpdated: idfActivity.inst_enqu_date || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error converting IDF activity:', error);
    return null;
  }
};

/**
 * Map IDF equipment family to Nesti categories
 */
const mapIDFCategoryToNesti = (idfFamily) => {
  const categoryMap = {
    'Court de tennis': 'sport',
    'Terrain de football': 'sport',
    'Piscine': 'sport',
    'Salle de sport': 'sport',
    'Gymnase': 'sport',
    'Stade': 'sport',
    'Parc': 'decouverte',
    'Jardin': 'decouverte',
    'Bibliothèque': 'dialogue',
    'Médiathèque': 'dialogue',
    'Centre culturel': 'inclusion',
    'Théâtre': 'inclusion',
    'Cinéma': 'inclusion',
    'Musée': 'decouverte',
  };

  return categoryMap[idfFamily] || 'decouverte';
};

/**
 * Get nearby activities based on user location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Radius in km (default: 5)
 * @returns {Promise<Array>} Nearby activities
 */
export const getNearbyActivities = async (lat, lon, radius = 5) => {
  try {
    // IDF API supports geographic queries
    const url = `${IDF_API_BASE_URL}?limit=50&where=distance(coordonnees, geom'POINT(${lon} ${lat})', ${radius}km)`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch nearby activities');
    }

    const data = await response.json();
    return (data.results || []).map(convertIDFToNestiFormat).filter(Boolean);
  } catch (error) {
    console.error('Error fetching nearby activities:', error);
    return [];
  }
};

/**
 * Get equipment types/families available in the API
 * @returns {Promise<Array>} List of equipment types
 */
export const getEquipmentTypes = async () => {
  try {
    const url = `${IDF_API_BASE_URL}?select=equip_type_famille&limit=100&group_by=equip_type_famille`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch equipment types');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    return [];
  }
};

/**
 * Search activities by keyword
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Matching activities
 */
export const searchIDFActivities = async (query, limit = 20) => {
  try {
    const url = `${IDF_API_BASE_URL}?limit=${limit}&where=search(equip_nom, "${query}") OR search(inst_nom, "${query}") OR search(equip_type_name, "${query}")`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to search activities');
    }

    const data = await response.json();
    return (data.results || []).map(convertIDFToNestiFormat).filter(Boolean);
  } catch (error) {
    console.error('Error searching IDF activities:', error);
    return [];
  }
};

export default {
  fetchIDFActivities,
  convertIDFToNestiFormat,
  getNearbyActivities,
  getEquipmentTypes,
  searchIDFActivities
};
