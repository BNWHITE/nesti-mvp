/**
 * Île-de-France Activities API Service
 * Fetches real activities and equipment data from the open data portal
 */

const IDF_API_BASE_URL = 'https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/recensement-des-equipements-sportifs-loisirs-socio-culturels-en-ile-de-france/records';
const IDF_LEISURE_ISLANDS_URL = 'https://data.iledefrance.fr/api/explore/v2.1/catalog/datasets/iles_de_loisirs_itineraires/records';

/**
 * Fallback activities data for when API is unavailable
 * Real activities in Île-de-France and Rennes
 */
const FALLBACK_ACTIVITIES = [
  {
    id: 'idf-1',
    title: 'Cité des Sciences et de l\'Industrie',
    category: 'culture',
    description: 'Explorez les sciences en famille avec des expositions interactives',
    location: 'Paris 19ème',
    address: '30 Avenue Corentin Cariou, 75019 Paris',
    ageRange: '3-99 ans',
    price: 'Gratuit - 12€',
    rating: 4.6,
    image: 'https://example.com/cite-sciences.jpg',
    coordinates: { lat: 48.8958, lng: 2.3878 },
    tags: ['musée', 'sciences', 'enfants', 'intérieur']
  },
  {
    id: 'idf-2',
    title: 'Parc Astérix',
    category: 'loisirs',
    description: 'Parc d\'attractions sur le thème de la Gaule antique',
    location: 'Plailly',
    address: 'Parc Astérix, 60128 Plailly',
    ageRange: '4-99 ans',
    price: '45€ - 55€',
    rating: 4.4,
    tags: ['parc', 'attractions', 'famille', 'extérieur']
  },
  {
    id: 'idf-3',
    title: 'Jardin d\'Acclimatation',
    category: 'nature',
    description: 'Parc de loisirs et jardin botanique au cœur du Bois de Boulogne',
    location: 'Paris 16ème',
    address: 'Bois de Boulogne, 75016 Paris',
    ageRange: '0-99 ans',
    price: '6€ - 35€',
    rating: 4.3,
    tags: ['parc', 'nature', 'manèges', 'extérieur']
  },
  {
    id: 'idf-4',
    title: 'Musée du Louvre',
    category: 'culture',
    description: 'Le plus grand musée d\'art et d\'antiquités au monde',
    location: 'Paris 1er',
    address: 'Rue de Rivoli, 75001 Paris',
    ageRange: '5-99 ans',
    price: '15€ - 17€',
    rating: 4.7,
    tags: ['musée', 'art', 'histoire', 'intérieur']
  },
  {
    id: 'idf-5',
    title: 'Château de Versailles',
    category: 'culture',
    description: 'Visitez le célèbre château et ses magnifiques jardins',
    location: 'Versailles',
    address: 'Place d\'Armes, 78000 Versailles',
    ageRange: '6-99 ans',
    price: '18€ - 27€',
    rating: 4.6,
    tags: ['château', 'jardins', 'histoire', 'extérieur']
  },
  {
    id: 'idf-6',
    title: 'La Villette',
    category: 'nature',
    description: 'Grand parc urbain avec espaces verts et activités culturelles',
    location: 'Paris 19ème',
    address: '211 Avenue Jean Jaurès, 75019 Paris',
    ageRange: '0-99 ans',
    price: 'Gratuit',
    rating: 4.5,
    tags: ['parc', 'culture', 'pique-nique', 'extérieur']
  },
  {
    id: 'idf-7',
    title: 'Disneyland Paris',
    category: 'loisirs',
    description: 'Le parc d\'attractions magique de Disney',
    location: 'Marne-la-Vallée',
    address: 'Boulevard de Parc, 77700 Coupvray',
    ageRange: '0-99 ans',
    price: '56€ - 109€',
    rating: 4.5,
    tags: ['parc', 'attractions', 'Disney', 'famille']
  },
  {
    id: 'idf-8',
    title: 'Aquarium de Paris',
    category: 'nature',
    description: 'Découvrez le monde sous-marin avec 10000 poissons',
    location: 'Paris 16ème',
    address: '5 Avenue Albert de Mun, 75016 Paris',
    ageRange: '2-99 ans',
    price: '21€ - 24€',
    rating: 4.2,
    tags: ['aquarium', 'poissons', 'intérieur', 'éducatif']
  },
  {
    id: 'idf-9',
    title: 'Bois de Vincennes',
    category: 'nature',
    description: 'Immense espace vert pour pique-niques, vélo et promenades',
    location: 'Paris 12ème',
    address: 'Route de la Pyramide, 75012 Paris',
    ageRange: '0-99 ans',
    price: 'Gratuit',
    rating: 4.4,
    tags: ['parc', 'vélo', 'nature', 'extérieur']
  },
  {
    id: 'idf-10',
    title: 'Palais de la Découverte',
    category: 'culture',
    description: 'Musée scientifique avec expériences interactives',
    location: 'Paris 8ème',
    address: 'Avenue Franklin D. Roosevelt, 75008 Paris',
    ageRange: '5-99 ans',
    price: '9€ - 12€',
    rating: 4.5,
    tags: ['musée', 'sciences', 'éducatif', 'intérieur']
  },
  {
    id: 'rennes-1',
    title: 'Parc du Thabor',
    category: 'nature',
    description: 'Magnifique jardin botanique et parc public',
    location: 'Rennes',
    address: 'Place Saint-Mélaine, 35000 Rennes',
    ageRange: '0-99 ans',
    price: 'Gratuit',
    rating: 4.6,
    tags: ['parc', 'jardins', 'nature', 'extérieur']
  },
  {
    id: 'rennes-2',
    title: 'Espace des Sciences',
    category: 'culture',
    description: 'Centre de culture scientifique avec planétarium',
    location: 'Rennes',
    address: 'Les Champs Libres, 35000 Rennes',
    ageRange: '5-99 ans',
    price: '5€ - 8€',
    rating: 4.4,
    tags: ['musée', 'sciences', 'planétarium', 'intérieur']
  },
  {
    id: 'rennes-3',
    title: 'La Prévalaye',
    category: 'sport',
    description: 'Grand espace naturel pour randonnées, vélo et sports',
    location: 'Rennes',
    address: 'La Prévalaye, 35000 Rennes',
    ageRange: '3-99 ans',
    price: 'Gratuit',
    rating: 4.3,
    tags: ['nature', 'sport', 'vélo', 'extérieur']
  },
  {
    id: 'rennes-4',
    title: 'Écomusée du Pays de Rennes',
    category: 'culture',
    description: 'Découvrez la vie rurale bretonne d\'autrefois',
    location: 'Rennes',
    address: 'Route de Châtillon-sur-Seiche, 35200 Rennes',
    ageRange: '4-99 ans',
    price: '4€ - 6€',
    rating: 4.2,
    tags: ['musée', 'histoire', 'ferme', 'extérieur']
  },
  {
    id: 'rennes-5',
    title: 'Piscine Gayeulles',
    category: 'sport',
    description: 'Centre aquatique familial avec toboggans',
    location: 'Rennes',
    address: 'Parc des Gayeulles, 35000 Rennes',
    ageRange: '0-99 ans',
    price: '3€ - 5€',
    rating: 4.1,
    tags: ['piscine', 'sport', 'toboggans', 'intérieur']
  },
  {
    id: 'idf-11',
    title: 'Musée Grévin',
    category: 'culture',
    description: 'Musée de cire avec personnalités célèbres',
    location: 'Paris 9ème',
    address: '10 Boulevard Montmartre, 75009 Paris',
    ageRange: '4-99 ans',
    price: '24€ - 27€',
    rating: 4.1,
    tags: ['musée', 'cire', 'célébrités', 'intérieur']
  },
  {
    id: 'idf-12',
    title: 'Parc Zoologique de Paris',
    category: 'nature',
    description: 'Zoo moderne avec animaux du monde entier',
    location: 'Paris 12ème',
    address: 'Avenue Daumesnil, 75012 Paris',
    ageRange: '2-99 ans',
    price: '20€ - 25€',
    rating: 4.3,
    tags: ['zoo', 'animaux', 'nature', 'extérieur']
  },
  {
    id: 'idf-13',
    title: 'Forêt de Fontainebleau',
    category: 'nature',
    description: 'Magnifique forêt pour randonnées et escalade',
    location: 'Fontainebleau',
    address: 'Forêt de Fontainebleau, 77300',
    ageRange: '5-99 ans',
    price: 'Gratuit',
    rating: 4.7,
    tags: ['forêt', 'randonnée', 'escalade', 'extérieur']
  },
  {
    id: 'idf-14',
    title: 'Musée de l\'Air et de l\'Espace',
    category: 'culture',
    description: 'Collection exceptionnelle d\'avions et engins spatiaux',
    location: 'Le Bourget',
    address: 'Aéroport de Paris-Le Bourget, 93350',
    ageRange: '5-99 ans',
    price: '9€ - 16€',
    rating: 4.5,
    tags: ['musée', 'avions', 'espace', 'intérieur']
  },
  {
    id: 'idf-15',
    title: 'France Miniature',
    category: 'loisirs',
    description: 'La France en miniature avec monuments emblématiques',
    location: 'Élancourt',
    address: '25 Route du Mesnil, 78990 Élancourt',
    ageRange: '3-99 ans',
    price: '17€ - 25€',
    rating: 4.2,
    tags: ['miniature', 'monuments', 'éducatif', 'extérieur']
  }
];

/**
 * Fetch leisure islands and itineraries from Île-de-France API
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of results (default: 20)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @returns {Promise<Array>} Array of leisure islands
 */
export const fetchLeisureIslands = async ({ limit = 20, offset = 0 } = {}) => {
  try {
    const url = `${IDF_LEISURE_ISLANDS_URL}?limit=${limit}&offset=${offset}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch leisure islands');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching leisure islands:', error);
    return [];
  }
};

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

/**
 * Convert leisure island data to Nesti format
 * @param {Object} island - Leisure island from IDF API
 * @returns {Object} Activity in Nesti format
 */
export const convertLeisureIslandToNestiFormat = (island) => {
  try {
    return {
      id: `island_${island.recordid || Math.random()}`,
      title: island.nom || 'Île de loisirs',
      description: island.description || 'Espace de loisirs en plein air',
      location: {
        address: island.adresse || '',
        city: island.commune || '',
        postalCode: island.code_postal || '',
        coordinates: island.geo_point_2d ? {
          lat: island.geo_point_2d.lat,
          lon: island.geo_point_2d.lon
        } : null
      },
      category: 'loisirs',
      type: 'Île de loisirs',
      accessibility: {
        handicapAccess: true, // Default for leisure islands
        publicTransport: true,
      },
      amenities: {
        publicAccess: true,
        freeAccess: island.acces_libre === 'true',
        activities: island.activites || []
      },
      source: 'Île-de-France - Îles de loisirs',
      sourceUrl: 'https://data.iledefrance.fr',
      geoShape: island.geo_shape || null
    };
  } catch (error) {
    console.error('Error converting leisure island:', error);
    return null;
  }
};

/**
 * Get fallback activities when API is unavailable
 * @param {number} limit - Number of activities to return
 * @returns {Array} Fallback activities
 */
export const getFallbackActivities = (limit = 20) => {
  return FALLBACK_ACTIVITIES.slice(0, limit);
};

const ileDeFranceService = {
  fetchIDFActivities,
  fetchLeisureIslands,
  convertIDFToNestiFormat,
  convertLeisureIslandToNestiFormat,
  getNearbyActivities,
  getEquipmentTypes,
  searchIDFActivities,
  getFallbackActivities
};

export default ileDeFranceService;
