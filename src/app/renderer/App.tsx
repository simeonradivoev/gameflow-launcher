import { ipcRenderer, IpcRendererEvent } from 'electron';
import ElectronStore from 'electron-store';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import React, { useEffect, useState } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { Commands, Events } from '../common/NetworkChannels';
import SettingsElectronStore from '../common/SettingsElectronStore';
import './App.global.scss';
import Home from './components/Home';
import Library from './components/Library';
import Settings from './components/Settings/Settings';
import TextContextMenu from './components/TextContextMenu';
import UpdateGameInstaller from './components/UpdateGame/UpdateGameInstaller';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

export default function App() {
  const [isBlurred, setIsBlurred] = useState(false);
  const store = new ElectronStore<SettingsElectronStore>({ watch: true });

  useEffect(() => {
    const blurWindowCallback = (_e: IpcRendererEvent, value: boolean) => {
      setIsBlurred(value);
    };
    typedIpcRenderer.on('BlurWindow', blurWindowCallback);

    const dropCallback = (e: DragEvent) => {
      if (e.dataTransfer) {
        e.preventDefault();
        e.stopPropagation();

        const files: Array<string> = [];
        for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
          files.push(e.dataTransfer?.files[i].path);
        }
        typedIpcRenderer.send('DropFiles', files);
      }
    };
    document.addEventListener('drop', dropCallback);
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    return () => {
      typedIpcRenderer.off('BlurWindow', blurWindowCallback);
      document.removeEventListener('drop', dropCallback);
    };
  });

  return (
    <div className="bp3-dark">
      <TextContextMenu />
      <HashRouter>
        <Switch>
          <Route exact path="/">
            <Home store={store} />
          </Route>
          <Route exact path="/library">
            <Library store={store} />
          </Route>
          <Route exact path="/updateGame" component={UpdateGameInstaller} />
          <Route exact path="/settings">
            <Settings store={store} />
          </Route>
        </Switch>
      </HashRouter>
      <div
        style={{
          backdropFilter: `blur(${isBlurred ? '8px' : '0px'})`,
          backgroundColor: isBlurred ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
        }}
        className="root-blur"
      />
    </div>
  );
}
