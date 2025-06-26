'use client';

import React from 'react';
import './CharacterCard.css';

function CharacterCard({ character }) {
    const defaultImage = './default-avatar.png';
    return (
        <div className="character-card">
            <img src={character.image || defaultImage} alt={character.name} className="character-image" />
            <h3 className="character-name">{character.name}</h3>

            <div className="character-info">
                <p><strong>Species:</strong> {character.species || 'Unknown'}</p>
                <p><strong>Gender:</strong> {character.gender || 'Unknown'}</p>
                <p><strong>House:</strong> {character.house || 'Unknown'}</p>
                <p><strong>Birth:</strong> {character.dateOfBirth || 'Unknown'}</p>
                <p><strong>Wizard:</strong> {character.wizard ? 'Yes' : 'No'}</p>
                <p><strong>Ancestry:</strong> {character.ancestry || 'Unknown'}</p>
                <p><strong>Wand Wood:</strong> {character.wand?.wood || 'Unknown'}</p>
                <p><strong>Wand Core:</strong> {character.wand?.core || 'Unknown'}</p>
                <p><strong>Wand Length:</strong> {character.wand?.length ? `${character.wand.length}"` : 'Unknown'}</p>
            </div>

        </div>
    );
}

export default CharacterCard;
