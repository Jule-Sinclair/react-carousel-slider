import React from 'react';
import Carousel, { CarouselNavigatorType, CAROUSEL_AUTO_WIDTH } from './Carousel';

const divStyle = {
  fontSize: '100px',
  height: '200px',
  textAlign: 'center'
};

class App extends React.Component {
  render() {
    return (
      <div>
        <Carousel
          naviType={CarouselNavigatorType.NUMBER}
          fullWidth={Boolean(false)}
          containerWidth={window.innerWidth}
          elementWidth={100}
          duration={200}
          autoPlay={Boolean(true)}
          autoPlayInterval={2000}
          isInfinite={Boolean(true)}
          targetSlide={2}
          slideToShow={3}
        >
          <div className="a" style={divStyle}>a</div>
          <div className="b" style={divStyle}>b</div>
          <div className="c" style={divStyle}>c</div>
          <div className="d" style={divStyle}>d</div>
          <div className="e" style={divStyle}>e</div>
          <div className="f" style={divStyle}>f</div>
        </Carousel>
      </div>
    );
  }
}

export default App;