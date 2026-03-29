export const CardActions = {
  names: {
    onExpand: 'onExpand',
    onCollapse: 'onCollapse',
    onRefresh: 'onRefresh',
    onDelete: 'onDelete',
    onEdit: 'onEdit',
    onSave: 'onSave',
    onCancel: 'onCancel',
    validateField: 'validateField',
    validateForm: 'validateForm',
  },
  actions: {
    onExpand: () => ({
      type: 'CARD_ON_EXPAND',
      payload: {},
    }),
    onCollapse: () => ({
      type: 'CARD_ON_COLLAPSE',
      payload: {},
    }),
    onRefresh: () => ({
      type: 'CARD_ON_REFRESH',
      payload: {},
    }),
    onDelete: () => ({
      type: 'CARD_ON_DELETE',
      payload: {},
    }),
    onEdit: () => ({
      type: 'CARD_ON_EDIT',
      payload: {},
    }),
    onSave: (data) => ({
      type: 'CARD_ON_SAVE',
      payload: { data },
    }),
    onCancel: () => ({
      type: 'CARD_ON_CANCEL',
      payload: {},
    }),
    validateField: (field) => ({
      type: 'CARD_VALIDATE_FIELD',
      payload: { field },
    }),
    validateForm: () => ({
      type: 'CARD_VALIDATE_FORM',
      payload: {},
    }),
  },
};
