export const ButtonActions = {
  names: {
    onClick: 'onClick',
    onDoubleClick: 'onDoubleClick',
    onMouseEnter: 'onMouseEnter',
    onMouseLeave: 'onMouseLeave',
    onFocus: 'onFocus',
    onBlur: 'onBlur',
    onDisabledClick: 'onDisabledClick',
    onLoadingClick: 'onLoadingClick',
    clearFormValues: 'clearFormValues',
  },
  actions: {
    onClick: () => ({
      type: 'BUTTON_ON_CLICK',
      payload: {},
    }),
    onDoubleClick: () => ({
      type: 'BUTTON_ON_DOUBLE_CLICK',
      payload: {},
    }),
    onMouseEnter: () => ({
      type: 'BUTTON_ON_MOUSE_ENTER',
      payload: {},
    }),
    onMouseLeave: () => ({
      type: 'BUTTON_ON_MOUSE_LEAVE',
      payload: {},
    }),
    onFocus: () => ({
      type: 'BUTTON_ON_FOCUS',
      payload: {},
    }),
    onBlur: () => ({
      type: 'BUTTON_ON_BLUR',
      payload: {},
    }),
    onDisabledClick: () => ({
      type: 'BUTTON_ON_DISABLED_CLICK',
      payload: {},
    }),
    onLoadingClick: () => ({
      type: 'BUTTON_ON_LOADING_CLICK',
      payload: {},
    }),
    clearFormValues: () => ({
      type: 'BUTTON_CLEAR_FORM_VALUES',
      payload: {},
    }),
  },
};
