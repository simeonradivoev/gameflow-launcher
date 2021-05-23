import ElectronStore from 'electron-store';
import React from 'react';
import SettingsElectronStore from '../../common/SettingsElectronStore';
import Header from './Header';

interface HomeProps {
  store: ElectronStore<SettingsElectronStore>;
}

const Home: React.FC<HomeProps> = ({ store }) => {
  return (
    <div className="opaque-view">
      <Header store={store} />
    </div>
  );
};

export default Home;
