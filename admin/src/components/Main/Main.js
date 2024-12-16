import React from 'react';
import Logo from '../assets/logo/logo_black.png';

const Main = () => {
  return (
    <div>
      <img
        src={Logo}
        alt=""
        style={{
          width: '100%',
          maxWidth: '280px',
          textAlign: 'center',
        }}
      />
      <p
        style={{
          marginLeft: '20px',
          marginTop: '30px',
          fontSize: '20px',
          color: 'var(--text-gray-medium)',
        }}
      >
        Loading...
      </p>
    </div>
  );
};

export default Main;
