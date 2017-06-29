import React from 'react';
import Carousel, { CarouselNavigatorType } from './Carousel';

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
          naviType={CarouselNavigatorType.DOT}
          autoPlay={Boolean(true)}
          autoPlayInterval={2000}
          duration={0.2}
          isInfinite={Boolean(true)}
          fullWidth={Boolean(false)}
          centerMode={Boolean(true)}
          width={100}
        >
          <div className="a" style={divStyle}>a</div>
          <div className="b" style={divStyle}>b</div>
          <div className="c" style={divStyle}>c</div>
        </Carousel>
      </div>
    );
  }
}

export default App;