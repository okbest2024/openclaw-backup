export const FormActions = {
  names: {
    onChange: 'onChange',
    onBlur: 'onBlur',
    onFocus: 'onFocus',
    onSubmit: 'onSubmit',
    onValidate: 'onValidate',
    setFieldValue: 'setFieldValue',
    setFieldError: 'setFieldError',
    clearFormValues: 'clearFormValues',
    resetForm: 'resetForm',
    validateField: 'validateField',
    validateForm: 'validateForm',
  },
  actions: {
    onChange: (field, value) => ({
      type: 'FORM_ON_CHANGE',
      payload: { field, value },
    }),
    onBlur: (field) => ({
      type: 'FORM_ON_BLUR',
      payload: { field },
    }),
    onFocus: (field) => ({
      type: 'FORM_ON_FOCUS',
      payload: { field },
    }),
    onSubmit: (values) => ({
      type: 'FORM_ON_SUBMIT',
      payload: { values },
    }),
    onValidate: (errors) => ({
      type: 'FORM_ON_VALIDATE',
      payload: { errors },
    }),
    setFieldValue: (field, value) => ({
      type: 'FORM_SET_FIELD_VALUE',
      payload: { field, value },
    }),
    setFieldError: (field, error) => ({
      type: 'FORM_SET_FIELD_ERROR',
      payload: { field, error },
    }),
    clearFormValues: () => ({
      type: 'FORM_CLEAR_VALUES',
      payload: {},
    }),
    resetForm: () => ({
      type: 'FORM_RESET',
      payload: {},
    }),
    validateField: (field) => ({
      type: 'FORM_VALIDATE_FIELD',
      payload: { field },
    }),
    validateForm: () => ({
      type: 'FORM_VALIDATE',
      payload: {},
    }),
  },
};
