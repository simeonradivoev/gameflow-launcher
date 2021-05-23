import React, { useState } from 'react';
import {
  MdBlock,
  MdPermMedia,
  MdDescription,
  MdCloudDownload,
  MdLink,
  MdInfoOutline,
  MdSave,
  MdTune,
  MdFolderOpen,
  MdDirectionsWalk,
  MdPower,
  MdPhotoLibrary,
  MdAdd,
} from 'react-icons/md';
import { Button, Classes } from '@blueprintjs/core';
import { IGame, TreeInfoSection } from '../../../common/Types';
import UpdateGameFieldLabel from './UpdateGameFieldLabel';
import UpdateGameFolderField from './UpdateGameFolderField';
import UpdateGameLinks from './UpdateGameLinks';
import UpdateGameActions from './UpdateGameActions';
import Game from '../../../common/Types/Game';
import UpdateGameDescription from './UpdateGameDescription';
import UpdateGameDownloadMetadata from './UpdateGameDownloadMetadata';
import PopupMenu from '../Popup/PopupMenu';
import UpdateGameGeneral from './UpdateGameGeneral';

interface AddGamePopupProps {
  updateGame: IGame;
  sourceGame: IGame | undefined;
  setUpdateGame: (game: IGame) => void;
  cancelAction: () => void;
  saveGameAction: () => void;
  savingGame: boolean;
}

const UpdateGamePopup: React.FC<AddGamePopupProps> = ({
  cancelAction,
  saveGameAction,
  setUpdateGame,
  updateGame,
  savingGame,
  sourceGame,
}) => {
  const defaultNewGame = new Game('', '');
  const sourceGameNotNull = sourceGame ?? defaultNewGame;

  const contents: { [key: string]: JSX.Element } = {};

  const sections: Array<TreeInfoSection> = [
    {
      name: 'General',
      id: 'general',
      icon: <MdInfoOutline />,
    },
    {
      name: 'Description',
      id: 'general_description',
      icon: <MdDescription />,
    },
    {
      name: 'Advanced',
      id: 'advanced',
      icon: <MdTune />,
    },
    { name: 'Notes', id: 'advanced_notes', icon: <MdDescription /> },
    { name: 'Media', id: 'media', icon: <MdPermMedia /> },
    { name: 'Covers', id: 'media_covers', icon: <MdPhotoLibrary /> },
    {
      name: 'Links',
      id: 'links',
      icon: <MdLink />,
    },
    {
      name: 'Installation',
      id: 'installation',
      icon: <MdFolderOpen />,
    },
    {
      name: 'Actions',
      id: 'actions',
      icon: <MdDirectionsWalk />,
    },
    { name: 'Scripts', id: 'scripts', icon: <MdPower /> },
  ];

  contents.actions = (
    <UpdateGameActions
      target={updateGame}
      source={sourceGameNotNull}
      updateTarget={setUpdateGame}
    />
  );

  contents.installation = (
    <UpdateGameFieldLabel
      name="Installation"
      source={sourceGameNotNull}
      field="installationPath"
      target={updateGame}
      updateTarget={setUpdateGame}
    >
      <UpdateGameFolderField
        field="installationPath"
        target={updateGame}
        updateTarget={setUpdateGame}
      />
    </UpdateGameFieldLabel>
  );

  contents.links = (
    <UpdateGameLinks
      target={updateGame}
      source={sourceGameNotNull}
      updateTarget={setUpdateGame}
    />
  );

  contents.advanced = (
    <div className="field">
      <label htmlFor="id">
        <span className="label">Id</span>
        <input
          className={Classes.INPUT}
          type="text"
          value={updateGame.id}
          disabled
        />
      </label>
    </div>
  );

  contents.general_description = (
    <UpdateGameDescription
      target={updateGame}
      source={sourceGameNotNull}
      updateTarget={setUpdateGame}
    />
  );

  contents.general = (
    <UpdateGameGeneral
      target={updateGame}
      source={sourceGameNotNull}
      updateTarget={setUpdateGame}
    />
  );

  const [tabOpen, setTabOpen] = useState(sections[0]);
  const [downloadMetadataOpen, setDownloadMetadataOpen] = useState(false);
  const [metadataSearch, setMetadataSearch] = useState('');

  return (
    <div className="update-game-popup sub-window-popup">
      <div className="title-bar" />
      <div className="content">
        {downloadMetadataOpen ? (
          <UpdateGameDownloadMetadata
            setMetadataSearch={setMetadataSearch}
            metadataSearch={metadataSearch}
            setDownloadMetadataOpen={setDownloadMetadataOpen}
          />
        ) : (
          <>
            <div className="menu">
              <h1>{sourceGame ? sourceGame.name : 'New Game'}</h1>
              <div className="items">
                <PopupMenu
                  sections={sections}
                  selectedSection={tabOpen}
                  setSelectedSection={setTabOpen}
                />
              </div>
              <Button
                className="button round-button"
                icon="cloud-download"
                text="Download Metadata"
                onClick={() => {
                  setMetadataSearch(updateGame.name);
                  setDownloadMetadataOpen(true);
                }}
              />
            </div>
            <div className="options">
              <h1>{tabOpen.name}</h1>
              <div className="options-fields minimal-scroll">
                {contents[tabOpen.id]}
              </div>
              <div className="bottom-buttons">
                <Button
                  className="button round-button"
                  disabled={savingGame}
                  text={sourceGame ? 'Save' : 'Create'}
                  icon={sourceGame ? 'floppy-disk' : 'add'}
                  onClick={() => {
                    if (!savingGame) {
                      saveGameAction();
                    }
                  }}
                />
                <Button
                  className="button round-button"
                  icon="disable"
                  text="Cancel"
                  disabled={savingGame}
                  onClick={() => {
                    if (!savingGame) {
                      cancelAction();
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateGamePopup;
