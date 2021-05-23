import { Button } from '@blueprintjs/core';
import humanizeDuration from 'humanize-duration';
import React, { useEffect, useState } from 'react';
import { typedIpcRenderer } from '../../common/NetworkChannels';
import { IGame } from '../../common/Types';
import Community from './Community';

interface DetailViewProps {
  selectedGame: IGame;
  deleteSelectedGame: (gameId: string) => void;
  startEditingGame: (gameId: string) => void;
}

const DetailView: React.FC<DetailViewProps> = ({
  selectedGame,
  deleteSelectedGame,
  startEditingGame,
}) => {
  const lastPlayed = selectedGame.lastPlayed.getTime() - new Date().getTime();
  const [icon, setIcon] = useState('');

  useEffect(() => {
    typedIpcRenderer
      .invoke('GetGameIcon', selectedGame.id)
      .then((iconPath) => setIcon(iconPath))
      .catch();
  }, [selectedGame]);

  return (
    <div className="detail-view minimal-scroll">
      <div id="header">
        <img className="cover" alt="Cover" src={icon} />
        <div className="info">
          <h1>{selectedGame.name}</h1>
          <div className="details">
            <div className="detail">
              <div className="label">You&apos;ve played</div>
              <div className="value">
                {humanizeDuration(selectedGame.timePlayed * 1000)}
              </div>
            </div>
            <div className="detail">
              <div className="label">Last played</div>
              <div className="value">
                {`${humanizeDuration(lastPlayed, {
                  largest: 1,
                  round: true,
                })} ago`}
              </div>
            </div>
          </div>
          <div className="buttons">
            <Button
              icon="play"
              text="Play"
              onClick={() => typedIpcRenderer.send('PlayGame', selectedGame.id)}
              disabled={!selectedGame.playAction?.path}
            />
            <Button
              icon="cog"
              onClick={() => startEditingGame(selectedGame.id)}
            />
          </div>
        </div>
      </div>
      <div id="links" className="content-box">
        {selectedGame.links &&
          selectedGame.links.map((link) => (
            <a
              key={link.link}
              href={link.link}
              rel="noreferrer"
              target="_blank"
            >
              {link.name}
            </a>
          ))}
      </div>
      <div id="description" className="content-box">
        {selectedGame.description}
      </div>
      <Community game={selectedGame} />
    </div>
  );
};

export default DetailView;
