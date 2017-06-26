import React from 'react';
import Carousel, { CarouselNavigatorType } from './Carousel';

class App extends React.Component {
  render() {
    return (
      <div>
        <Carousel
          naviType={CarouselNavigatorType.DOT}
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