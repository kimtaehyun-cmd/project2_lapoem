import React from 'react';
import Slider from './Slider';
import Releases from './Releases';
import Bestseller from './Bestseller';
import HotForums from './HotForums';

function Main() {
  return (
    <div>
      <Slider />
      <Releases />
      <Bestseller />
      <HotForums />
    </div>
  );
}

export default Main;
