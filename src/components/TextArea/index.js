import React from 'react';

import './TextArea.scss';

export default function TextArea({ ...rest }) {
  return (
    <div className="textarea-wrapper">
      <textarea spellCheck="false" {...rest} />
    </div>
  );
}
