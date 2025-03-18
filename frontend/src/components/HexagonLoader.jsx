import React from 'react';
import './HexagonLoader.css';

const HexagonLoader = ({ isFullScreen = true }) => {
  // If fullscreen, wrap in a container that takes up the entire screen
  if (isFullScreen) {
    return (
      <div className="loader-wrapper">
        <div className="loader">
          <ul className="hexagon-container">
            <li className="hexagon hex_1"></li>
            <li className="hexagon hex_2"></li>
            <li className="hexagon hex_3"></li>
            <li className="hexagon hex_4"></li>
            <li className="hexagon hex_5"></li>
            <li className="hexagon hex_6"></li>
            <li className="hexagon hex_7"></li>
          </ul>
        </div>
      </div>
    );
  }
  
  // If not fullscreen, just return the loader itself
  return (
    <div className="loader">
      <ul className="hexagon-container">
        <li className="hexagon hex_1"></li>
        <li className="hexagon hex_2"></li>
        <li className="hexagon hex_3"></li>
        <li className="hexagon hex_4"></li>
        <li className="hexagon hex_5"></li>
        <li className="hexagon hex_6"></li>
        <li className="hexagon hex_7"></li>
      </ul>
    </div>
  );
};

export default HexagonLoader;
