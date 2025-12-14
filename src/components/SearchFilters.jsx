import { useState } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import './SearchFilters.css';

export default function SearchFilters({ onSearch, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    ageMin: '',
    ageMax: '',
    distance: 50,
    accessibility: false,
    price: '',
    difficulty: ''
  });

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'sport', label: '⚽ Sport' },
    { value: 'culture', label: '🎭 Culture' },
    { value: 'nature', label: '🌳 Nature' },
    { value: 'art', label: '🎨 Art & Créativité' },
    { value: 'cuisine', label: '👨‍🍳 Cuisine' },
    { value: 'jeux', label: '🎮 Jeux' },
    { value: 'musique', label: '🎵 Musique' },
    { value: 'lecture', label: '📚 Lecture' }
  ];

  const priceOptions = [
    { value: '', label: 'Tous les prix' },
    { value: 'free', label: 'Gratuit' },
    { value: 'low', label: '€ (0-20€)' },
    { value: 'medium', label: '€€ (20-50€)' },
    { value: 'high', label: '€€€ (50€+)' }
  ];

  const difficultyLevels = [
    { value: '', label: 'Tous niveaux' },
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Real-time search
    if (onSearch) {
      onSearch(value, filters);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
    
    // Trigger search with new filters
    if (onSearch) {
      onSearch(searchTerm, newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      ageMin: '',
      ageMax: '',
      distance: 50,
      accessibility: false,
      price: '',
      difficulty: ''
    };
    setFilters(clearedFilters);
    
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
    
    if (onSearch) {
      onSearch(searchTerm, clearedFilters);
    }
  };

  const hasActiveFilters = () => {
    return filters.category !== '' ||
           filters.ageMin !== '' ||
           filters.ageMax !== '' ||
           filters.accessibility !== false ||
           filters.price !== '' ||
           filters.difficulty !== '' ||
           filters.distance !== 50;
  };

  return (
    <div className="search-filters">
      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher une activité, un lieu..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm('');
                if (onSearch) {
                  onSearch('', filters);
                }
              }}
              aria-label="Effacer la recherche"
            >
              <XMarkIcon className="clear-icon" />
            </button>
          )}
        </div>
        <button
          className={`filters-toggle-btn ${hasActiveFilters() ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filtres"
        >
          <AdjustmentsHorizontalIcon className="filters-icon" />
          {hasActiveFilters() && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3 className="filters-title">Filtres</h3>
            {hasActiveFilters() && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Effacer tout
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Category Filter */}
            <div className="filter-group">
              <label className="filter-label">Catégorie</label>
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Age Range Filter */}
            <div className="filter-group">
              <label className="filter-label">Âge recommandé</label>
              <div className="age-range-inputs">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Min"
                  value={filters.ageMin}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                  min="0"
                  max="99"
                />
                <span className="age-separator">-</span>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Max"
                  value={filters.ageMax}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                  min="0"
                  max="99"
                />
              </div>
            </div>

            {/* Distance Filter */}
            <div className="filter-group full-width">
              <label className="filter-label">
                Distance maximale: {filters.distance} km
              </label>
              <input
                type="range"
                className="filter-slider"
                min="1"
                max="100"
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
              />
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <label className="filter-label">Prix</label>
              <select
                className="filter-select"
                value={filters.price}
                onChange={(e) => handleFilterChange('price', e.target.value)}
              >
                {priceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="filter-group">
              <label className="filter-label">Difficulté</label>
              <select
                className="filter-select"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                {difficultyLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            {/* Accessibility Filter */}
            <div className="filter-group full-width">
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={filters.accessibility}
                  onChange={(e) => handleFilterChange('accessibility', e.target.checked)}
                />
                <span>♿ Accessible PMR (Personnes à Mobilité Réduite)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
