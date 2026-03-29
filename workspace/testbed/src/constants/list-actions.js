export const ListActions = {
  names: {
    onSelect: 'onSelect',
    onDeselect: 'onDeselect',
    onSelectAll: 'onSelectAll',
    onDeselectAll: 'onDeselectAll',
    onSort: 'onSort',
    onFilter: 'onFilter',
    onPaginate: 'onPaginate',
    onSearch: 'onSearch',
    onRefresh: 'onRefresh',
    validateForm: 'validateForm',
  },
  actions: {
    onSelect: (item) => ({
      type: 'LIST_ON_SELECT',
      payload: { item },
    }),
    onDeselect: (item) => ({
      type: 'LIST_ON_DESELECT',
      payload: { item },
    }),
    onSelectAll: () => ({
      type: 'LIST_ON_SELECT_ALL',
      payload: {},
    }),
    onDeselectAll: () => ({
      type: 'LIST_ON_DESELECT_ALL',
      payload: {},
    }),
    onSort: (field, direction) => ({
      type: 'LIST_ON_SORT',
      payload: { field, direction },
    }),
    onFilter: (filters) => ({
      type: 'LIST_ON_FILTER',
      payload: { filters },
    }),
    onPaginate: (page, pageSize) => ({
      type: 'LIST_ON_PAGINATE',
      payload: { page, pageSize },
    }),
    onSearch: (query) => ({
      type: 'LIST_ON_SEARCH',
      payload: { query },
    }),
    onRefresh: () => ({
      type: 'LIST_ON_REFRESH',
      payload: {},
    }),
    validateForm: () => ({
      type: 'LIST_VALIDATE_FORM',
      payload: {},
    }),
  },
};
