'use client';

import React from 'react';
import CharacterCard from './CharacterCard';
import './CharacterGrid.css';

function CharactersGrid({ characters }) {
  return (
    <div className="characters-grid">
      {characters.map((char) => (
        <CharacterCard key={char.uniqueId} character={char} />
      ))}
    </div>
  );
}

export default CharactersGrid;
