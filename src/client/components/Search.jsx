import React from 'react';

const Search = ({ handleSearch, clearSearch }) => {
  const searchInput = document.getElementById('searchInput');

  const searchNominees = () => {
    handleSearch(searchInput.value)
  };

  return (
    <div>
      <label>Search Nominees
        <br />
        <input id="searchInput" type="text" placeholder="Enter Nominee Name" />
      </label>
      <button type="submit" onClick={searchNominees}>Submit</button>
      <button type="submit" onClick={clearSearch}>Reset Data</button>
    </div>
  );
}

export default Search;
