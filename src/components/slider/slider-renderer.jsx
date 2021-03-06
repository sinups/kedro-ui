import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Input from '../input';
import TickRenderer from './tick-renderer';

/**
 * Creates a single slider component consisting of single thumb and number input.
 */
class SliderRenderer extends React.Component {
  /**
   * constructor - create new component with given props
   * @param  {object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value
    };

    this._handleChanged = this._handleChanged.bind(this);
    this._handleBlured = this._handleBlured.bind(this);
    this._updatePercentage = this._updatePercentage.bind(this);
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#componentdidmount}
   * @return {object} JSX for this component
   */
  componentDidMount() {
    this._updatePercentage();

    // fire the onchange with the range values
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(null, { min: 0, max: this.state.value });
    }
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#componentdidupdate}
   * @return {object} JSX for this component
   */
  componentDidUpdate() {
    this._updatePercentage();
  }

  /**
   * _updateValue - updates the state and calls the on change callback
   * @param {object} event
   * @param {number} value the value of the new range
   */
  _updateValue(event, value) {
    this.setState({
      value
    });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(event, { min: 0, max: value });
    }
  }

  /**
   * _handleChanged - updates the state with the new value from the slider
   * @param  {object} event
   */
  _handleChanged(event) {
    // check if the value is a number and parse it from the event
    const value = isNaN(parseFloat(event.target.value)) ? 0 : parseFloat(event.target.value);

    this._updateValue(event, value);
  }

  /**
   * _handleBlured - updates the state with the new value from the input field;
   * If slider is stepped, it changes the value to the correct one and then calls the update
   * @param  {object} event
   */
  _handleBlured(event, { value }) {
    const { max, min, step } = this.props;
    // check if the value is a number and parse it from the event
    let inputValue = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    // if the value is out of range, set the max or min value as the new value
    if (inputValue > max) {
      inputValue = max;
    } else if (inputValue < min) {
      inputValue = min;
    }

    // if the slider is set to be stepped, find the correct nearest step value
    const normalisedValue = (step !== 1 && event.target.value !== '')
      ? (min % step) + (Math.round(inputValue / step) * step)
      : inputValue;

    this._updateValue(event, normalisedValue);
  }

  /**
   * _updatePercentage - injects the CSS variables into the child to correctly update the input track
   */
  _updatePercentage() {
    if (!this._lineFilled) return;

    this._lineFilled.style.setProperty('background', `
      linear-gradient(to right,
      ${this.props.backgroundColor} 0,
      ${this.props.fillColor} 0,
      ${this.props.fillColor} ${this.props.percentage(this.state.value, this.props.min, this.props.max)}%,
      ${this.props.backgroundColor} 0)
     `);
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#render}
   * @return {object} JSX for this component
   */
  render() {
    const label = this.props.label && (
      <div
        className={classnames(
          'kui-slider__label',
          'kui-slider__label--single'
        )}>
        {this.props.label}
      </div>
    );

    return (
      <div className='kui-slider__wrapper'>
        {label}
        <div className='kui-slider__controls'>
          <div className='kui-slider__range'>
            <TickRenderer
              componentPrefix='kui-slider'
              id={this.props.listId}
              min={this.props.min}
              max={this.props.max}
              minRange={0}
              maxRange={this.state.value}
              numberWidth={this.props.tickNumberWidth}
              step={this.props.tickStep}
              percentage={this.props.percentage}
              type='number'
              width={this.props.sliderWidth} />
            <TickRenderer
              componentPrefix='kui-slider'
              min={this.props.min}
              max={this.props.max}
              minRange={0}
              maxRange={this.state.value}
              numberWidth={this.props.tickNumberWidth}
              step={this.props.tickStep}
              percentage={this.props.percentage}
              type='symbol'
              width={this.props.sliderWidth} />
            <div
              ref={lineFilled => { this._lineFilled = lineFilled; }}
              className='kui-slider__line' />
            <input
              className='kui-slider__input'
              type='range'
              list={this.props.listId}
              name={this.props.name}
              min={this.props.min}
              max={this.props.max}
              step={this.props.step}
              value={this.state.value}
              onChange={this._handleChanged} />
          </div>
          <div
            className={classnames(
              'kui-slider__number-input',
              'kui-slider__number-input--single'
            )}>
            <Input
              value={this.state.value.toString()}
              onBlur={this._handleBlured} />
          </div>
        </div>
      </div>
    );
  }
}

SliderRenderer.defaultProps = {
  backgroundColor: 'transparent',
  fillColor: 'transparent',
  label: '',
  listId: 'slider-simple-list',
  max: 100,
  min: 0,
  name: 'slider',
  onChange: null,
  sliderWidth: 174,
  step: 1,
  tickNumberWidth: 24,
  tickStep: 0,
  value: 50
};

SliderRenderer.propTypes = {
  /**
   * Color used for the background of the range.
   */
  backgroundColor: PropTypes.string,
  /**
   * Color used for highlighting the selected range.
   */
  fillColor: PropTypes.string,
  /**
   * Label to be shown for the slider.
   */
  label: PropTypes.string,
  /**
   * The ID used for list attribute - ticks.
   */
  listId: PropTypes.string,
  /**
   * Minimal value of the slider.
   */
  min: PropTypes.number,
  /**
   * Maximum value of the slider.
   */
  max: PropTypes.number,
  /**
   * Name of the slider, which is submitted with form data.
   */
  name: PropTypes.string,
  /**
   * Event listener which will be trigerred on change of the slider.
   */
  onChange: PropTypes.func,
  /**
   * Function that calculates the percentage value of slider's range for given number.
   */
  percentage: PropTypes.func.isRequired,
  /**
   * Width of the input range slider.
   */
  sliderWidth: PropTypes.number,
  /**
   * Step of the slider.
   */
  step: PropTypes.number,
  /**
   * Width of the tick for the number.
   */
  tickNumberWidth: PropTypes.number,
  /**
   * Step of the ticks shown below the slider.
   * By default only the min and max is shown.
   */
  tickStep: PropTypes.number,
  /**
   * The value of the slider - either array for ranged slider or a single number for simple slider.
   */
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.number])
};

export default SliderRenderer;
