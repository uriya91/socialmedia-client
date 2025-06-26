import React from 'react';
import './CharacterFilterBar.css';
import { FaSearch, FaDragon, FaVenusMars, FaHome, FaMagic, FaUserSecret } from 'react-icons/fa';

const CharacterFilterBar = ({
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    options
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="character-filter-bar">
            <div className="filter-field">
                <FaSearch />
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-field">
                <FaDragon />
                <select name="species" onChange={handleChange} value={filters.species}>
                    <option value="">All Species</option>
                    {options.species.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            <div className="filter-field">
                <FaVenusMars />
                <select name="gender" onChange={handleChange} value={filters.gender}>
                    <option value="">All Genders</option>
                    {options.gender.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            <div className="filter-field">
                <FaHome />
                <select name="house" onChange={handleChange} value={filters.house}>
                    <option value="">All Houses</option>
                    {options.house.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            <div className="filter-field">
                <FaMagic />
                <select name="wizard" onChange={handleChange} value={filters.wizard}>
                    <option value="">Wizard & Muggle</option>
                    <option value="true">Wizard</option>
                    <option value="false">Not Wizard</option>
                </select>
            </div>

            <div className="filter-field">
                <FaUserSecret />
                <select name="ancestry" onChange={handleChange} value={filters.ancestry}>
                    <option value="">All Ancestries</option>
                    {options.ancestry.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <button className="clear-filters-btn" onClick={() => {
                setSearchTerm('');
                setFilters({
                    species: '',
                    gender: '',
                    house: '',
                    wizard: '',
                    ancestry: ''
                });
            }}>
                Clear Filters
            </button>
        </div>
    );
};

export default CharacterFilterBar;
