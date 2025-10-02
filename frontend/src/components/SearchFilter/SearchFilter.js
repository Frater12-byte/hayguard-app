import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import './SearchFilter.css';

const SearchFilter = ({
  data = [],
  onFilterChange,
  searchFields = ['name'],
  filterOptions = {},
  sortOptions = [],
  placeholder = 'Search...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeFilters, sortBy, sortOrder, data]);

  const applyFilters = () => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field =>
          String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => {
          const itemValue = item[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return itemValue === value;
        });
      }
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    onFilterChange(filtered);
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilters({});
    setSortBy('');
    setSortOrder('asc');
  };

  const removeFilter = (key) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const activeFilterCount = Object.keys(activeFilters).filter(key => activeFilters[key]).length;

  return (
    <div className="search-filter">
      <div className="search-filter-header">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>

          {(searchTerm || activeFilterCount > 0) && (
            <button onClick={clearFilters} className="clear-all">
              Clear All
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {sortOptions.length > 0 && (
              <div className="filter-group">
                <label>Sort By</label>
                <div className="sort-controls">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {sortBy && (
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="filter-group">
                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <select
                  value={activeFilters[key] || ''}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                >
                  <option value="">All {key}s</option>
                  {options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <div className="active-filters">
              <span className="active-filters-label">Active filters:</span>
              {Object.entries(activeFilters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span key={key} className="active-filter-tag">
                    {key}: {value}
                    <button
                      onClick={() => removeFilter(key)}
                      className="remove-filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
