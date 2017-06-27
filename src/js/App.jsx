import React from 'react';
import Carousel, { CarouselNavigatorType } from './Carousel';

class App extends React.Component {
  render() {
    return (
      <div>
        <Carousel
          naviType={CarouselNavigatorType.DOT}
          fullWidth={Boolean(true)}
          autoPlay={Boolean(true)}
          autoPlayInterval={500}
          isInfinite={Boolean(true)}
        >
          <div className="a">a</div>
          <div className="b">b</div>
          <div className="c">c</div>
        </Carousel>
      </div>
    );
  }
}

export default App;