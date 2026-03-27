import { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  return (
    <FilterContext.Provider value={{
      search, setSearch,
      category, setCategory,
      sort, setSort,
      minPrice, setMinPrice,
      maxPrice, setMaxPrice,
      page, setPage
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}
