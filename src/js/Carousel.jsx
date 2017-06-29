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
    this.setAfterTransitionFunc = null;
    this.setAfterWindowResizeFunc = null;
    this.autoPlayer = null;
    this.clickSafe = false;
    this.touchObject = {};
    this.state = {
      dragging: false,
      currentSlide: 1,
      tempPositionX: undefined,
      currentPositionX: 0,
      slideCount: 0,
      autoPlaying: false
    };
  }

  componentWillMount() {
    const { children, targetSlide } = this.props;

    this.setState({
      slideCount: children.length,
      currentSlide: targetSlide,
      currentPositionX: this.getHorizontalPosition(targetSlide)
    });
  }

  componentDidMount() {
    this.setAfterWindowResizeFunc = this._setAfterWindowResize.bind(this);
    this.setAfterTransitionFunc = this._setAfterTransition.bind(this);
    this.autoPlayer = this._autoPlayer.bind(this);

    window.addEventListener('resize', this.setAfterWindowResizeFunc);
    this.setTimerStart();
  }

  componentWillUnmount() {
    if (this.setAfterWindowResizeFunc) {
      window.removeEventListener('resize', this.setAfterWindowResizeFunc);
    }
    if (this.setAfterTransitionFunc) {
      this.slidingArea.removeEventListener('transitionend', this.setAfterTransitionFunc);
    }
  }


  // TouchEvent ----------------------------------------------------------------------------------------------
  onTouchStart(e) {
    if (this.state.dragging) {
      return;
    }
    this.touchObject = {
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY
    };
    this.setState({ dragging: true });
    this.handleFocusOn();
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

    this.setSlidingAreaLeft(-(length * direction));
  }

  onTouchEnd(e) {
    this.setSlidingAreaLeft(0);
    this.handleSwipe(e);
    this.handleFocusOut();
  }

  onTouchCancel(e) {
    this.handleSwipe(e);
    this.handleFocusOut();
  }
  // TouchEvent ----------------------------------------------------------------------------------------------


  // MouseEvent ----------------------------------------------------------------------------------------------
  onMouseOver() {
    this.handleFocusOn();
  }

  onMouseOut() {
    this.handleFocusOut();
  }

  onMouseDown(e) {
    if (this.state.dragging) {
      return;
    }
    this.touchObject = {
      startX: e.clientX,
      startY: e.clientY
    };
    this.setState({ dragging: true });
  }

  onMouseMove(e) {
    const direction = this.swipeDirection(
      this.touchObject.startX,
      e.clientX,
      this.touchObject.startY,
      e.clientY
    );

    if (direction !== 0) {
      e.preventDefault();
    }

    const length = Math.round(Math.sqrt((e.clientX - this.touchObject.startX) ** 2));

    this.touchObject = {
      startX: this.touchObject.startX,
      startY: this.touchObject.startY,
      endX: e.clientX,
      endY: e.clientY,
      length,
      direction
    };
    this.setSlidingAreaLeft(-(length * direction));
  }

  onMouseUp(e) {
    this.setSlidingAreaLeft(0);
    this.handleSwipe(e);
    this.handleFocusOut();
  }

  onMouseLeave(e) {
    this.handleSwipe(e);
    this.handleFocusOut();
  }
  // MouseEvent ----------------------------------------------------------------------------------------------


  setTimerStart() {
    const { autoPlay, autoPlayInterval } = this.props;
    const { autoPlaying } = this.state;
    if (autoPlay && !autoPlaying) {
      this.timer = setInterval(() => {
        this.autoPlayer();
      }, Number(autoPlayInterval));
      this.setState({ autoPlaying: true });
    }
  }

  setTimerStop() {
    const { autoPlaying } = this.state;
    if (autoPlaying) {
      clearInterval(this.timer);
      this.setState({ autoPlaying: false });
    }
  }

  getHorizontalPosition(targetSlider) {
    const {
      width,
      isInfinite
    } = this.props;
    const windowWidth = window.innerWidth;

    let positionX = (windowWidth / 2) - ((Number(width) * (Number(targetSlider) - 1)) + (Number(width) / 2));
    if (isInfinite) {
      positionX -= (Number(width) * 2);
    }

    this.setState({ currentPositionX: positionX });
    return positionX;
  }

  setSlidingAreaLeft(positionX) {
    const { currentPositionX } = this.state;
    if (positionX === 0) {
      this.setState({ tempPositionX: undefined });
      return;
    }
    this.setState({ tempPositionX: currentPositionX + positionX });
  }

  setSliderTransition() {
    const { duration, isInfinite, cssEase } = this.props;
    this.slidingArea.style.transition = `transform ${duration}ms ${cssEase}`;

    if (isInfinite) {
      this.slidingArea.removeEventListener('transitionend', this.setAfterTransitionFunc);
      this.slidingArea.addEventListener('transitionend', this.setAfterTransitionFunc);
    }
  }

  removeSliderTransition() {
    this.slidingArea.style.transition = `none`;
    this.slidingArea.removeEventListener('transitionend', this.setAfterTransitionFunc);
  }

  nextSlide() {
    const { isInfinite } = this.props;
    const { currentSlide, slideCount } = this.state;

    if (!isInfinite && currentSlide === slideCount) {
      return;
    }

    this.setState({
      currentSlide: currentSlide + 1,
      currentPositionX: this.getHorizontalPosition(currentSlide + 1)
    });
  }

  prevSlide() {
    const { isInfinite } = this.props;
    const { currentSlide } = this.state;

    if (!isInfinite && currentSlide === 1) {
      return;
    }

    this.setState({
      currentSlide: currentSlide - 1,
      currentPositionX: this.getHorizontalPosition(currentSlide - 1)
    });
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

  handleFocusOn() {
    if (this.props.autoPlay) {
      this.setTimerStop();
    }
  }

  handleFocusOut() {
    if (this.props.autoPlay) {
      this.setTimerStart();
    }
  }

  handleSwipe() {
    const { width } = this.props;
    this.clickSafe = (typeof (this.touchObject.length) !== 'undefined' && this.touchObject.length > 44);
    this.setSliderTransition();
    if (!this.clickSafe) {
      return;
    }
    if (this.touchObject.length > (width / 2)) {
      if (this.touchObject.direction === 1) {
        this.nextSlide();
      } else if (this.touchObject.direction === -1) {
        this.prevSlide();
      }
    }
    this.setState({ dragging: false });
    this.touchObject = {};
  }


  // event bind based Functions ------------------------------------------------------------
  _setAfterTransition() {
    const { currentSlide, slideCount } = this.state;
    this.removeSliderTransition();

    if (currentSlide === (slideCount + 1)) {
      this.setState({
        currentSlide: 1,
        currentPositionX: this.getHorizontalPosition(1)
      });
    } else if (currentSlide === 0) {
      this.setState({
        currentSlide: slideCount,
        currentPositionX: this.getHorizontalPosition(slideCount)
      });
    }
    this.setState({ dragging: false });
  }

  _setAfterWindowResize() {
    const { currentSlide } = this.state;
    this.getHorizontalPosition(currentSlide);
  }

  _autoPlayer() {
    this.setSliderTransition();
    if (this.props.isInfinite) {
      this.nextSlide();
      return;
    }
    if (this.state.currentSlide === this.state.slideCount) {
      this.setTimerStop();
    } else {
      this.nextSlide();
    }
  }
  // bindable Functions ------------------------------------------------------------


  renderSlider() {
    const {
      children,
      isInfinite,
      width,
      fullWidth,
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
        className={`slide_item${(idx + 1) === currentSlide ? ' active' : ''}`}
        key={`slide_${idx + 1}`}
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
    const { currentPositionX, tempPositionX } = this.state;
    const { centerMode } = this.props;

    return (
      <div className="carousel_slider_wrapper">
        <ul
          className="slider"
          ref={ul => { this.slidingArea = ul; }}
          onTouchStart={e => this.onTouchStart(e)}
          onTouchMove={e => this.onTouchMove(e)}
          onTouchEnd={e => this.onTouchEnd(e)}
          onTouchCancel={e => this.onTouchCancel(e)}
          onMouseOver={e => this.onMouseOver(e)}
          onMouseOut={e => this.onMouseOut(e)}
          onMouseDown={e => this.onMouseDown(e)}
          onMouseMove={e => this.onMouseMove(e)}
          onMouseUp={e => this.onMouseUp(e)}
          onMouseLeave={e => this.onMouseLeave(e)}
          style={centerMode ? {
            transform: `translate3d(${tempPositionX !== undefined ? tempPositionX : currentPositionX}px, 0, 0)`,
          } : {}}
        >
          {this.renderSlider()}
        </ul>
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
  duration: PropTypes.number,
  autoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number,
  isInfinite: PropTypes.bool,
  centerMode: PropTypes.bool,
  targetSlide: PropTypes.number,
  cssEase: PropTypes.string,
};

Carousel.defaultProps = {
  autoPlayInterval: 1000,
  targetSlide: 1,
  cssEase: 'cubic-bezier(0.420, 0.000, 0.580, 1.000)'
};

export default Carousel;
