import React, { PropTypes } from 'react';
import classnames from 'classnames';

import './input-field.css';

const InputField = ({ disabled, label, placeholder, status, statusDescription, theme }) => {
  // status indicating error or success; ignored when it is default
  const validatedStatus = status !== 'default' ? status : false;

  const labelWrapper = label && (
    <div className='cbn-input-field__label'>
      {label}
    </div>
  );

  // status description shown only if status is relevant and description is passed
  const description = status !== 'default' && statusDescription && (
    <div className='cbn-input-field__description'>
      {statusDescription}
    </div>
  );

  return (
    <div
      className={classnames(
        'cbn-input-field',
        `cbn-theme--${theme}`,
        { [`cbn-input-field--${validatedStatus}`]: !!validatedStatus },
        { 'cbn-input-field--labeled': !!labelWrapper }
      )}
      disabled={disabled}>
      {labelWrapper}
      <input
        className={classnames('cbn-input-field__text')}
        type='text'
        placeholder={placeholder}
        disabled={disabled} />
      <div className='cbn-input-field__line' />
      {description}
    </div>
  );
};

InputField.defaultProps = {
  disabled: false,
  label: '',
  placeholder: '',
  status: 'default',
  statusDescription: '',
  theme: 'dark'
};

InputField.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  status: PropTypes.oneOf(['error', 'success', 'defaut']),
  statusDescription: PropTypes.string,
  theme: PropTypes.oneOf(['dark', 'light'])
};

export default InputField;
