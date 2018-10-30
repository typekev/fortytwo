import React from 'react';
import ReactDOM from 'react-dom';
import './Counter.scss';

const appRoot = document.getElementById('root');

export default function Counter({ remainingAlterations = 42 }) {
  return ReactDOM.createPortal(
    <div className="counter" title={`${remainingAlterations} remaining alterations`}>
      <h1>{remainingAlterations}</h1>
    </div>,
    appRoot,
  );
}
