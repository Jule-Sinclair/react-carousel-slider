import React, { PropTypes } from 'react';


export const CarouselNavigatorType = {
  DOT: '0',
  NUMBER: '1'
};

export const DOMEventConstants = {
  CLICK: 'click',
  SCROLL: 'scroll',
  TOUCH_MOVE: 'touchmove',
  MOUSE_WHEEL: 'mousewheel',
  KEY_DOWN: 'keydown',
  RESIZE: 'resize',
  FOCUS: 'focus',
  BLUR: 'blur',
  ERROR: 'error',
  CHANGE: 'change',
  ANIMATION_END: 'animationend',
  TRANSITION_END: 'transitionend',
  WEBKIT_TRANSITION_END: 'webkitTransitionEnd',
};

class Carousel extends React.Component {
  constructor() {
    super();
    this.slidingArea = null;
    this.timer = null;
    this.maximumDrag = 200;
    this.clickSafe = true;
    this.touchObject = {};
    this.draggable = true;
    this.sliderItemWidth = 100;
    this.state = {
      currentSlide: 1,
      tempPositionX: undefined,
      currentPositionX: 0,
      slideCount: 0,
      autoPlaying: false
    };

    this._setAfterWindowResize = this._setAfterWindowResize.bind(this);
    this._setAfterTransition = this._setAfterTransition.bind(this);
    this._windowFocusOn = this._windowFocusOn.bind(this);
    this._windowFocusOut = this._windowFocusOut.bind(this);
    this._autoPlayer = this._autoPlayer.bind(this);
  }

  componentWillMount() {
    this.sliderItemWidth = this.props.isFullWidth ? window.innerWidth : this.props.elementWidth;
    this._setCurrentSlideAndPosition(this.props);
  }

  componentDidMount() {
    window.addEventListener(DOMEventConstants.RESIZE, this._setAfterWindowResize);
    window.addEventListener(DOMEventConstants.FOCUS, this._windowFocusOn);
    window.addEventListener(DOMEventConstants.BLUR, this._windowFocusOut);
    this.setTimerStart();
  }

  componentWillReceiveProps(nextProps) {
    this._setCurrentSlideAndPosition(nextProps);
  }

  componentWillUnmount() {
    const { saveStateFunc, isResetToFirst } = this.props;
    const { currentSlide } = this.state;
    if (this._setAfterWindowResize) {
      window.removeEventListener(DOMEventConstants.RESIZE, this._setAfterWindowResize);
    }
    if (this._windowFocusOn) {
      window.removeEventListener(DOMEventConstants.FOCUS, this._windowFocusOn);
    }
    if (this._windowFocusOut) {
      window.removeEventListener(DOMEventConstants.BLUR, this._windowFocusOut);
    }
    if (this._setAfterTransition) {
      this.setAfterTransitionEventListener(true);
    }
    if (this.timer) {
      clearInterval(this.timer);
    }

    if (saveStateFunc) {
      if (isResetToFirst) {
        saveStateFunc(1);
      } else {
        saveStateFunc(currentSlide);
      }
    }
  }

  // TouchEvent ----------------------------------------------------------------------------------------------
  onTouchStart(e) {
    this.touchObject = {
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY
    };
    this.handleFocusOn();
  }

  onTouchMove(e) {
    const direction = this.swipeDirection(
      this.touchObject.startX,
      e.touches[0].pageX,
      this.touchObject.startY,
      e.touches[0].pageY
    );

    if (direction !== 0 || this.touchObject.length > 44) {
      e.preventDefault();
    }
    // ** 연산자는 빌드가 안되고 Math.pow 는 lint에 걸린다...
    const movedLength = (e.touches[0].pageX - this.touchObject.startX);
    const length = Math.round(Math.sqrt(movedLength * movedLength));
    let slidingLength = length;

    this.touchObject = {
      startX: this.touchObject.startX,
      startY: this.touchObject.startY,
      endX: e.touches[0].pageX,
      endY: e.touches[0].pageY,
      length,
      direction
    };

    if (length > this.maximumDrag) {
      slidingLength = this.maximumDrag;
    }
    this.setSlidingAreaLeft(-(slidingLength * direction));
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
    this.touchObject = {
      startX: e.clientX,
      startY: e.clientY
    };
  }

  onMouseMove(e) {
    const direction = this.swipeDirection(
      this.touchObject.startX,
      e.clientX,
      this.touchObject.startY,
      e.clientY
    );

    if (direction !== 0 || this.touchObject.length > 44) {
      e.preventDefault();
    }
    // ** 연산자는 빌드가 안되고 Math.pow 는 lint에 걸린다...
    const movedLength = (e.clientX - this.touchObject.startX);
    const length = Math.round(Math.sqrt(movedLength * movedLength));

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
    const { isAutoPlay, autoPlayInterval } = this.props;
    const { autoPlaying } = this.state;
    if (isAutoPlay && !autoPlaying) {
      this.timer = setInterval(() => {
        this._autoPlayer();
      }, Number(autoPlayInterval));
      this.setState({ autoPlaying: true });
    }
  }

  setTimerStop() {
    const { autoPlaying } = this.state;
    if (this.timer || autoPlaying) {
      clearInterval(this.timer);
      this.timer = false;
      this.setState({ autoPlaying: false });
    }
  }

  getHorizontalPosition(targetSlider) {
    const {
      isInfinite,
      isFullWidth,
      containerWidth
    } = this.props;
    let wrapperWidth = containerWidth;
    if (isFullWidth) {
      wrapperWidth = window.innerWidth;
    }

    let positionX = (wrapperWidth / 2) - ((Number(this.sliderItemWidth) * (Number(targetSlider) - 1)) + (Number(this.sliderItemWidth) / 2));
    if (isInfinite) {
      positionX -= (Number(this.sliderItemWidth) * 2);
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
    if (this.slidingArea === null || this.slidingArea === undefined) {
      return;
    }
    this.setTransitionPrefixed(`transform,-webkit-transform ${duration}ms ${cssEase}`);

    if (isInfinite) {
      this.setAfterTransitionEventListener(false);
    }
  }

  setTransitionPrefixed(value) {
    this.slidingArea.style.transition = value;
    this.slidingArea.style.webkitTransition = value;
  }

  setAfterTransitionEventListener(isRemove) {
    const eventType = [DOMEventConstants.TRANSITION_END, DOMEventConstants.WEBKIT_TRANSITION_END];
    eventType.map(type => this.slidingArea.removeEventListener(type, this._setAfterTransition));
    if (!isRemove) {
      eventType.map(type => this.slidingArea.addEventListener(type, this._setAfterTransition));
    }
  }

  disableDrag() {
    this.draggable = false;
    setTimeout(() => (this.enableDrag()), this.props.duration);
  }

  enableDrag() {
    this.draggable = true;
    this._setAfterTransition();
  }

  removeSliderTransition() {
    if (
      this.slidingArea === undefined
      || this.slidingArea === null
      || typeof this.slidingArea === 'string'
      || this.slidingArea instanceof String
    ) {
      return;
    }
    this.slidingArea.style.transition = `none`;
    this.slidingArea.removeEventListener('transitionend', this.setAfterTransitionFunc);
  }

  nextSlide() {
    const { isInfinite } = this.props;
    const { currentSlide, slideCount } = this.state;

    if (!this.draggable) {
      return;
    }

    if (!isInfinite && currentSlide === slideCount) {
      this.setState({
        currentPositionX: this.getHorizontalPosition(currentSlide)
      });
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
      this.setState({
        currentPositionX: this.getHorizontalPosition(currentSlide)
      });
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

  isMobile() {
    return (
      navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
    );
  }

  handleFocusOn() {
    if (this.props.isAutoPlay) {
      this.setTimerStop();
    }
  }

  handleFocusOut() {
    if (this.props.isAutoPlay) {
      this.setTimerStart();
    }
  }

  handleSwipe() {
    this.clickSafe = (typeof (this.touchObject.length) !== 'undefined' && this.touchObject.length > 44);
    this.setSliderTransition();
    if (!this.clickSafe) {
      return;
    }
    if (this.touchObject.length > (this.sliderItemWidth / 4)) {
      if (this.touchObject.direction === 1) {
        this.nextSlide();
      } else if (this.touchObject.direction === -1) {
        this.prevSlide();
      }
    }
    this.touchObject = {};
  }

  handleClick(e) {
    if (this.clickSafe === true) {
      e.preventDefault();
      e.stopPropagation();

      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
      }
    }
  }

  // event bind based Functions ------------------------------------------------------------
  _setCurrentSlideAndPosition(props) {
    let currentSlide = 1;
    const state = {};
    state.slideCount = props.children.length;
    this.maximumDrag = (props.containerWidth / 5) * 4;
    if (props.lastState) {
      currentSlide = props.lastState.index;
    } else if (props.targetSlide > 1) {
      currentSlide = props.targetSlide;
    }
    const isInRange = (currentSlide >= 1) && (currentSlide <= state.slideCount);
    state.currentSlide = isInRange ? currentSlide : 1;
    state.currentPositionX = this.getHorizontalPosition(state.currentSlide);
    this.setState(state);
  }

  _setAfterTransition() {
    const { currentSlide, slideCount } = this.state;
    this.removeSliderTransition();

    if (currentSlide > slideCount) {
      this.setState({
        currentSlide: 1,
        currentPositionX: this.getHorizontalPosition(1)
      });
    } else if (currentSlide < 1) {
      this.setState({
        currentSlide: slideCount,
        currentPositionX: this.getHorizontalPosition(slideCount)
      });
    }
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

  _windowFocusOn() {
    this.handleFocusOut();
  }

  _windowFocusOut() {
    this.handleFocusOn();
  }
  // event bind based Functions ------------------------------------------------------------

  renderSlider() {
    const {
      children,
      isInfinite,
      isFullWidth,
    } = this.props;
    const { currentSlide } = this.state;
    const length = children.length;
    const sliders = [];
    let itemWidth = '';

    if (isFullWidth) {
      itemWidth = '100%';
    } else {
      itemWidth = `${this.sliderItemWidth}px`;
    }

    if (!Array.isArray(children) || children.length === 1) {
      return (
        <li
          className="slide_item active"
          key="slide_1"
          style={{ width: itemWidth }}
        >
          {children}
        </li>
      );
    }

    if (isInfinite) {
      sliders.push((
        <li
          className="slide_item"
          key="slide_negative_2"
          style={{ width: itemWidth }}
        >
          {children[length - 2]}
        </li>
      ));
      sliders.push((
        <li
          className="slide_item"
          key="slide_negative_1"
          style={{ width: itemWidth }}
        >
          {children[length - 1]}
        </li>
      ));
    }

    children.map((child, idx) => sliders.push((
      <li
        className={`slide_item${(idx + 1) === currentSlide ? ' active' : ''}`}
        key={`slide_${idx + 1}`}
        style={{ width: itemWidth }}
      >
        {child}
      </li>
    )));

    if (isInfinite) {
      sliders.push((
        <li
          className="slide_item"
          key="slide_plus_1"
          style={{ width: itemWidth }}
        >
          {children[0]}
        </li>
      ));
      sliders.push((
        <li
          className="slide_item"
          key="slide_plus_2"
          style={{ width: itemWidth }}
        >
          {children[1]}
        </li>
      ));
    }

    return sliders;
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
    const { isInfinite } = this.props;
    const { currentSlide, slideCount } = this.state;
    let currentSlideNumber = currentSlide;

    if (isInfinite) {
      if (currentSlideNumber > slideCount) {
        currentSlideNumber = 1;
      } else if (currentSlideNumber < 1) {
        currentSlideNumber = slideCount;
      }
    }

    return (
      <p className="carousel_navigator type_number">
        <span className="current_slide_number">{currentSlideNumber}</span>/
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
    const { children } = this.props;
    const { currentPositionX, tempPositionX } = this.state;

    if (children === undefined || children === null) {
      return null;
    }

    if (!Array.isArray(children) || children.length === 1) {
      return (
        <div className="carousel_slider_wrapper">
          <ul
            className="slider"
            ref={ul => { this.slidingArea = ul; }}
          >
            {this.renderSlider()}
          </ul>
          {this.renderNavigator()}
        </div>
      );
    }

    const sliderEvents = {};
    if (this.isMobile()) {
      sliderEvents.onTouchStart = e => this.onTouchStart(e);
      sliderEvents.onTouchMove = e => this.onTouchMove(e);
      sliderEvents.onTouchEnd = e => this.onTouchEnd(e);
      sliderEvents.onTouchCancel = e => this.onTouchCancel(e);
    } else {
      sliderEvents.onMouseOver = e => this.onMouseOver(e);
      sliderEvents.onMouseOut = e => this.onMouseOut(e);
      sliderEvents.onMouseDown = e => this.onMouseDown(e);
      sliderEvents.onMouseMove = e => this.onMouseMove(e);
      sliderEvents.onMouseUp = e => this.onMouseUp(e);
      sliderEvents.onMouseLeave = e => this.onMouseLeave(e);
    }

    return (
      <div
        className="carousel_slider_wrapper"
      >
        <ul
          className="slider"
          role="presentation"
          ref={ul => { this.slidingArea = ul; }}
          {...sliderEvents}
          onClick={e => this.handleClick(e)}
          style={{
            transform: `translateX(${tempPositionX !== undefined ? tempPositionX : currentPositionX}px)`,
            WebkitTransform: `translateX(${tempPositionX !== undefined ? tempPositionX : currentPositionX}px)`,
            MozTransform: `translateX(${tempPositionX !== undefined ? tempPositionX : currentPositionX}px)`,
            OTransform: `translateX(${tempPositionX !== undefined ? tempPositionX : currentPositionX}px)`,
            msTransform: `translateX(${tempPositionX !== undefined ? tempPositionX : currentPositionX}px)`,
          }}
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
  isFullWidth: PropTypes.bool,
  containerWidth: PropTypes.number,
  elementWidth: PropTypes.number.isRequired,
  duration: PropTypes.number,
  isAutoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number,
  isInfinite: PropTypes.bool,
  targetSlide: PropTypes.number,
  cssEase: PropTypes.string,
  isResetToFirst: PropTypes.bool,
  lastState: PropTypes.object,
  saveStateFunc: PropTypes.func
};

Carousel.defaultProps = {
  children: null,
  saveStateFunc: null,
  naviType: CarouselNavigatorType.DOT,
  isFullWidth: Boolean(true),
  containerWidth: window.innerWidth,
  duration: 200,
  isAutoPlay: Boolean(true),
  autoPlayInterval: 1000,
  isInfinite: Boolean(true),
  targetSlide: 1,
  isResetToFirst: Boolean(false),
  cssEase: 'ease-out',
  lastState: undefined
};

export default Carousel;
