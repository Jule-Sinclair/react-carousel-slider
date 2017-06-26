import React, { PropTypes } from 'react';

export const CarouselNavigatorType = {
  DOT: '0',
  NUMBER: '1'
};

class Carousel extends React.Component {
  constructor() {
    super();
    this.timer = null;
    this.state = {
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

  renderSlider() {
    const { children } = this.props;
    const { currentSlide } = this.state;

    return (
      <ul
        className="slider"
      >
        {children.map((child, idx) => (
          <li
            className={`slide_item${idx === (currentSlide - 1) ? ' active' : ''}`}
            key={`slide_${idx}`}
          >
            {child}
          </li>
        ))}
      </ul>
    );
  }

  renderDotNavigator() {
    const { currentSlide, slideCount } = this.state;
    const tmpArray = [];

    for (let idx = 1; idx <= slideCount; idx++) {
      tmpArray.push(
        (
          <li
            className={`carousel_navigator_unit${currentSlide === idx ? ' active' : ''}`}
            key={`dot_navigator_${idx}`}
          >
            <span className="unit_dot" />
          </li>
        )
      );
    }
    return (
      <ul className="carousel_navigator type_dot">
        {tmpArray}
      </ul>
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
    const { fullWidth } = this.props;

    return (
      <div className={`carousel_slider_wrapper${fullWidth ? ' full_width_gallery' : ''}`}>
        {this.renderSlider()}
        {this.renderNavigator()}
      </div>
    );
  }
}

Carousel.propTypes = {
  children: PropTypes.node,
  naviType: PropTypes.string,
  fullWidth: PropTypes.bool,
  autoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number
};

Carousel.defaultProps = {
  autoPlayInterval: 1000
};

export default Carousel;
