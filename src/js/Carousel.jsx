import React, { PropTypes } from 'react';


export const CarouselNavigatorType = {
  DOT: '0',
  NUMBER: '1'
};

class Carousel extends React.Component {
  constructor() {
    super();
    this.slidingArea = null;
    this.timer = null;
    this.clickSafe = false;
    this.touchObject = {};
    this.state = {
      left: 0,
      currentSlide: 0,
      slideCount: 0,
    };
  }

  componentWillMount() {
    const { children } = this.props;
    this.setState({
      currentSlide: 1,
      slideCount: children.length
    });
  }

  // TouchEvent ----------------------------------------------------------------------------------------------
  onTouchStart(e) {
    this.touchObject = {
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY
    };
    this.handleMouseOver();
  }

  onTouchMove(e) {
    const direction = this.swipeDirection(
      this.touchObject.startX,
      e.touches[0].pageX,
      this.touchObject.startY,
      e.touches[0].pageY
    );

    if (direction !== 0) {
      e.preventDefault();
    }

    const length = Math.round(Math.sqrt((e.touches[0].pageX - this.touchObject.startX) ** 2));

    this.touchObject = {
      startX: this.touchObject.startX,
      startY: this.touchObject.startY,
      endX: e.touches[0].pageX,
      endY: e.touches[0].pageY,
      length,
      direction
    };
    this.setSlidingAreaLeft(e.touches[0].pageX - this.touchObject.startX);
  }

  onTouchEnd(e) {
    this.setSlidingAreaLeft(0);
    this.handleSwipe(e);
  }

  onTouchCancel(e) {
    this.handleSwipe(e);
  }
  // TouchEvent ----------------------------------------------------------------------------------------------

  setTimerStart() {
    const { autoPlay, autoPlayInterval } = this.props;
    const { currentSlide, slideCount } = this.state;
    if (autoPlay) {
      this.timer = setInterval(() => {
        this.setState({
          currentSlider: (currentSlide === slideCount) ? 1 : (currentSlide + 1)
        });
      }, Number(autoPlayInterval));
    }
  }

  getHorizontalPosition() {
    const {
      width,
      isInfinite
    } = this.props;
    const { currentSlide } = this.state;
    let marginLeft = -((Number(width) * (Number(currentSlide) - 1)) + (Number(width) / 2));
    if (isInfinite) {
      marginLeft -= (Number(width) * 2);
    }
    return marginLeft;
  }

  setSlidingAreaLeft(positionX) {
    this.slidingArea.style.transform = `translate3d(${positionX}px, 0, 0)`;
  }

  swipeDirection(x1, x2, y1, y2) {
    let swipeAngle;
    const xDist = x1 - x2;
    const yDist = y1 - y2;
    const r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round((r * 180) / Math.PI);
    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
      return 1;
    }
    if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
      return 1;
    }
    if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
      return -1;
    }
    return 0;
  }

  handleMouseOver() {
    if (this.props.autoPlay) {
      // 자동 재생 멈춤처리.
    }
  }

  handleSwipe(e) {
    const { width, children } = this.props;
    const { currentSlide, slideCount } = this.state;
    const slidesToShow = children.length;
    this.clickSafe = (typeof (this.touchObject.length) !== 'undefined' && this.touchObject.length > 44);

    if (this.touchObject.length > (width / 2)) {
      if (this.touchObject.direction === 1) {
        this.setState({
          currentSlide: (currentSlide === slideCount) ? 1 : (currentSlide + 1)
        });
        console.log('next slide');
      } else if (this.touchObject.direction === -1) {
        this.setState({
          currentSlide: (currentSlide === 1) ? slideCount : (currentSlide - 1)
        });
        console.log('prev slide');
      }
    } else {
      console.log('not moved');
    }

    this.touchObject = {};

    this.setState({
      dragging: false
    });
  }

  renderSlider() {
    const {
      children,
      isInfinite,
      width,
      fullWidth,
      centerMode
    } = this.props;
    const { currentSlide } = this.state;
    const length = children.length;
    const itemArray = [];

    if (isInfinite) {
      itemArray.push((
        <li
          className="slide_item"
          key="slide_negative_2"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[length - 2]}</li>
      ));
      itemArray.push((
        <li
          className="slide_item"
          key="slide_negative_1"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[length - 1]}</li>
      ));
    }

    children.map((child, idx) => itemArray.push((
      <li
        className={`slide_item${idx === (currentSlide - 1) ? ' active' : ''}`}
        key={`slide_${idx}`}
        style={{
          width: fullWidth ? '100%' : `${width}px`
        }}
      >{child}</li>
    )));

    if (isInfinite) {
      itemArray.push((
        <li
          className="slide_item"
          key="slide_plus_1"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[0]}</li>));
      itemArray.push((
        <li
          className="slide_item"
          key="slide_plus_2"
          style={{
            width: fullWidth ? '100%' : `${width}px`
          }}
        >{children[1]}</li>));
    }

    return itemArray;
  }

  renderDotNavigator() {
    const { currentSlide, slideCount } = this.state;
    const tmpArray = [];

    for (let idx = 1; idx <= slideCount; idx++) {
      tmpArray.push((
        <li className={`carousel_navigator_unit${currentSlide === idx ? ' active' : ''}`} key={`dot_navigator_${idx}`}>
          <span className="unit_dot" />
        </li>
      ));
    }
    return (
      <ul className="carousel_navigator type_dot">{tmpArray}</ul>
    );
  }

  renderNumberNavigator() {
    const { currentSlide, slideCount } = this.state;

    return (
      <p className="carousel_navigator type_number">
        <span className="current_slide_number">{currentSlide}</span>/
        <span className="total_slide_number">{slideCount}</span>
      </p>
    );
  }

  renderNavigator() {
    const { naviType } = this.props;

    if (naviType === CarouselNavigatorType.DOT) {
      return this.renderDotNavigator();
    }
    return this.renderNumberNavigator();
  }

  render() {
    const { children, centerMode } = this.props;
    const { left } = this.state;

    return (
      <div className="carousel_slider_wrapper">
        <div
          onTouchStart={e => this.onTouchStart(e)}
          onTouchMove={e => this.onTouchMove(e)}
          onTouchEnd={e => this.onTouchEnd(e)}
        >
          <ul
            className="slider handle"
            ref={ul => { this.slidingArea = ul; }}
            style={centerMode ? {
              left: '50%',
              marginLeft: this.getHorizontalPosition(),
            } : {}}
          >
            {this.renderSlider()}
          </ul>
        </div>
        {this.renderNavigator()}
      </div>
    );
  }
}

Carousel.propTypes = {
  children: PropTypes.node,
  naviType: PropTypes.string,
  fullWidth: PropTypes.bool,
  width: PropTypes.number,
  autoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number,
  isInfinite: PropTypes.bool,
  centerMode: PropTypes.bool
};

Carousel.defaultProps = {
  autoPlayInterval: 1000
};

export default Carousel;
