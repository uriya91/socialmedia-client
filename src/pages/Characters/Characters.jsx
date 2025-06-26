import React, { useEffect, useState } from 'react';
import CharactersGrid from './CharacterGrid';
import CharacterFilterBar from './CharacterFilterBar';
import Spinner from '../../components/Spinner';
import './Characters.css';

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    species: '',
    gender: '',
    house: '',
    wizard: '',
    ancestry: ''
  });

  const [options, setOptions] = useState({
    species: [],
    gender: [],
    house: [],
    ancestry: []
  });

  useEffect(() => {
    const fetchCharacters = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://hp-api.onrender.com/api/characters');
        const data = await response.json();
        const formattedData = data.map((char, idx) => ({
          ...char,
          uniqueId: `${char.name}-${idx}`
        }));
        setCharacters(formattedData);

        const extractUnique = (key) => {
          return [...new Set(formattedData.map(c => c[key]).filter(Boolean))];
        };

        setOptions({
          species: extractUnique('species'),
          gender: extractUnique('gender'),
          house: extractUnique('house'),
          ancestry: extractUnique('ancestry'),
        });

      } catch (error) {
        console.error("Error fetching characters:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filters.species ? char.species === filters.species : true) &&
    (filters.gender ? char.gender === filters.gender : true) &&
    (filters.house ? char.house === filters.house : true) &&
    (filters.wizard ? String(char.wizard) === filters.wizard : true) &&
    (filters.ancestry ? char.ancestry === filters.ancestry : true)
  );

  return (
    <div className="characters-page">
      <CharacterFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        options={options}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <CharactersGrid characters={filteredCharacters} />
      )}
    </div>
  );
};

export default Characters;
