export const ModalActions = {
  names: {
    onOpen: 'onOpen',
    onClose: 'onClose',
    onBeforeOpen: 'onBeforeOpen',
    onBeforeClose: 'onBeforeClose',
    onSubmit: 'onSubmit',
    onValidate: 'onValidate',
    setFieldValue: 'setFieldValue',
    setFieldError: 'setFieldError',
    clearFormValues: 'clearFormValues',
    setModalValue: 'setModalValue',
    resetModal: 'resetModal',
  },
  actions: {
    onOpen: () => ({
      type: 'MODAL_ON_OPEN',
      payload: {},
    }),
    onClose: () => ({
      type: 'MODAL_ON_CLOSE',
      payload: {},
    }),
    onBeforeOpen: () => ({
      type: 'MODAL_ON_BEFORE_OPEN',
      payload: {},
    }),
    onBeforeClose: () => ({
      type: 'MODAL_ON_BEFORE_CLOSE',
      payload: {},
    }),
    onSubmit: (values) => ({
      type: 'MODAL_ON_SUBMIT',
      payload: { values },
    }),
    onValidate: (errors) => ({
      type: 'MODAL_ON_VALIDATE',
      payload: { errors },
    }),
    setFieldValue: (field, value) => ({
      type: 'MODAL_SET_FIELD_VALUE',
      payload: { field, value },
    }),
    setFieldError: (field, error) => ({
      type: 'MODAL_SET_FIELD_ERROR',
      payload: { field, error },
    }),
    clearFormValues: () => ({
      type: 'MODAL_CLEAR_FORM_VALUES',
      payload: {},
    }),
    setModalValue: (key, value) => ({
      type: 'MODAL_SET_VALUE',
      payload: { key, value },
    }),
    resetModal: () => ({
      type: 'MODAL_RESET',
      payload: {},
    }),
  },
};
