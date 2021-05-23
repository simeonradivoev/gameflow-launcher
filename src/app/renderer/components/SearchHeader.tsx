import React from 'react';
import { CgLayoutList, CgLayoutGrid, CgOptions } from 'react-icons/cg';

type SearchHeaderParams = {
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
  startAddingNewGame: () => void;
};

const SearchHeader = ({
  searchFilter,
  setSearchFilter,
  startAddingNewGame,
}: SearchHeaderParams) => {
  return (
    <div className="search-header">
      <input
        type="search"
        id="search-field"
        className="search-field"
        name="search-field"
        placeholder="Search my games..."
        value={searchFilter}
        onChange={(d) => setSearchFilter(d.target.value)}
      />
      <div className="filter-button round-button">
        <CgOptions />
      </div>
      <div className="layout-button active">
        <CgLayoutList />
      </div>
      <div className="layout-button">
        <CgLayoutGrid />
      </div>
      <div
        onClick={startAddingNewGame}
        className="add-game-button round-button"
      >
        Add Game
      </div>
    </div>
  );
};

export default SearchHeader;
