import { ipcRenderer } from 'electron-better-ipc';
import React, { useEffect, useState } from 'react';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import { v4 as uuidv4 } from 'uuid';
import update from 'immutability-helper';
import { Button, MenuItem } from '@blueprintjs/core';
import { MdAddCircle } from 'react-icons/md';
import { IpcRendererEvent } from 'electron';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import { GameSource } from '../../../common/Types';
import { Commands, Events } from '../../../common/NetworkChannels';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

interface UpdateGameSourceFieldDropdownProps {
  target: any;
  updateTarget: (target: any) => void;
}

const UpdateGameSourceFieldDropdown: React.FC<UpdateGameSourceFieldDropdownProps> = ({
  target,
  updateTarget,
}) => {
  const [sources, setSources] = useState<Array<GameSource>>([]);

  useEffect(() => {
    typedIpcRenderer.send('GetSourcesListRequest');

    const updateSourcesRequest = (
      _e: IpcRendererEvent,
      updatedSources: Array<GameSource>
    ) => {
      setSources(updatedSources);
    };
    typedIpcRenderer.on('GetSourcesListResponse', updateSourcesRequest);
    return () => {
      typedIpcRenderer.off('GetSourcesListResponse', updateSourcesRequest);
    };
  }, []);

  const GameSourceSelect = Select.ofType<GameSource>();

  const filterSource: ItemPredicate<GameSource> = (query, s) => {
    return s.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  const renderSource: ItemRenderer<GameSource> = (
    source,
    { handleClick, modifiers }
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={source.id}
        onClick={handleClick}
        text={source.name}
      />
    );
  };

  const renderCreateSource = (
    query: string,
    active: boolean,
    handleClick: React.MouseEventHandler<HTMLElement>
  ) => {
    if (sources.find((s) => s.name === query)) {
      return undefined;
    }

    return (
      <MenuItem
        active={active}
        onClick={handleClick}
        icon={<MdAddCircle />}
        text={`Create new '${query}'`}
      />
    );
  };

  const selectItem = (item: GameSource) => {
    if (item.id === '') {
      item.id = uuidv4();
      typedIpcRenderer.send('CreateSourceRequest', item);
    }
    updateTarget(update(target, { source: { $set: item.id } }));
  };

  const createNewItemFromQuery = (query: string): GameSource => {
    return {
      id: '',
      name: query,
    };
  };

  return (
    <GameSourceSelect
      className="full-width"
      createNewItemFromQuery={createNewItemFromQuery}
      activeItem={sources.find((s) => s.id === target.source) ?? null}
      items={sources}
      itemRenderer={renderSource}
      createNewItemRenderer={renderCreateSource}
      itemPredicate={filterSource}
      noResults={<MenuItem disabled text="No results." />}
      onItemSelect={selectItem}
      popoverProps={{ minimal: true }}
    >
      <Button
        text={sources.find((s) => s.id === target.source)?.name ?? 'None'}
        rightIcon="caret-down"
        alignText="left"
        fill
      />
    </GameSourceSelect>
  );
};

export default UpdateGameSourceFieldDropdown;
