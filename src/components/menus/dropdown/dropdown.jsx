import React, { PropTypes } from 'react';
import { flatten, find, flow, map } from 'lodash/fp';

// Styles
import './dropdown.css';

// Renderer
import DropdownRenderer from './dropdown-renderer';

/**
 * This is a stateful component providing a rich version of a native select box.
 */
const Dropdown = React.createClass({
  displayName: 'Dropdown',
  /**
  * React component spec method
  * {@link https://facebook.github.io/react/docs/react-component.html#proptypes}
  * @return {object} Default properties
  */
  propTypes: {
    /**
    * Child items. The nodes which React will pass down, defined inside the DropdownRenderer tag
    */
    children: PropTypes.node.isRequired,
    /**
    * Default text to show in a closed unselected state
    */
    defaultText: PropTypes.string,
    /**
     * Callback function to be executed when a menu item is clicked, other than the one currently selected.
     */
    onChanged: PropTypes.func,
    /**
    * Callback to be executed after menu opens
    */
    onOpened: PropTypes.func,
    /**
    * Callback to be executed after menu closed
    */
    onClosed: PropTypes.func,
    /**
    * The theme for the component
    */
    theme: PropTypes.oneOf(['light', 'dark']),
    /**
    * The width for the component. Both the label and options are the same width
    */
    width: PropTypes.number
  },
  /**
   * React component spec method
   * {@link https://facebook.github.io/react/docs/react-component.html#getdefaultprops}
   * @return {object} Default properties
   */
  getDefaultProps() {
    return {
      children: null,
      defaultText: 'Please select...',
      onChanged: null,
      onClosed: null,
      onOpened: null,
      theme: 'light',
      width: 160
    };
  },
  /**
  * React component spec method
  * {@link https://facebook.github.io/react/docs/react-component.html#getinitialstate}
  * @return {object} An object to be used as the initial state
  */
  getInitialState() {
    // check children for a selected option
    // otherwise, default to first
    let selectedOption = {
      id: null,
      label: null,
      value: null
    };

    const selectedOptionElement = this._findSelectedOptionElement();

    if (selectedOptionElement) {
      const { id, primaryText, value } = selectedOptionElement.props;
      selectedOption = {
        id,
        label: primaryText,
        value
      };
    }

    return {
      selectedOption,
      open: false
    };
  },
  /**
   * Find the selected option by traversing sections and MenuOptions
   */
  _findSelectedOptionElement() {
    const children = React.Children.toArray(this.props.children);

    // we may have an array of options
    // or an array of sections, containing options
    return children[0].type === 'section'
    ? flow(
        map(x => x.props.children),
        flatten,
        find(x => x.props.selected)
      )(children)
    : find(children, c => c.props.selected);
  },
  /**
   * Event handler which is fired when the label is clicked
   */
  _handleLabelClicked() {
    const { open } = this.state;
    const { onOpened, onClosed } = this.props;

    let callback = null;

    // set callbacks, if defined
    if (typeof onOpened === 'function' && !open) {
      callback = onOpened;
    } else if (typeof onClosed === 'function' && open) {
      callback = onClosed;
    }

    this.setState({ open: !open }, callback);
  },
  /**
   * Event handler which is fired when a child item is selected
   */
  _handleOptionSelected(obj) {
    const { label, id, value } = obj;
    const { onChanged, onClosed } = this.props;

    // detect if the selected item has changed
    const hasChanged = value !== this.state.selectedOption.value;
    if (hasChanged) {
      const selectedOption = { label, value, id };
      this.setState({ open: false, selectedOption }, () => {
        if (typeof onChanged === 'function') {
          onChanged(obj);
        }
        if (typeof onClosed === 'function') {
          onClosed();
        }
      });
    } else {
      this.setState({ open: false });
    }
  },
  /**
   * API method to open the dropdown
   */
  open() {
    const { onOpened } = this.props;
    this.setState({ open: true }, () => {
      if (typeof onOpened === 'function') {
        onOpened();
      }
    });
  },
  /**
   * API method to close the dropdown
   */
  close() {
    const { onClosed } = this.props;
    this.setState({ open: false }, () => {
      if (typeof onClosed === 'function') {
        onClosed();
      }
    });
  },
  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#render}
   * @return {object} JSX for this component
   */
  render() {
    const { children, defaultText, theme, width } = this.props;
    const { open, selectedOption } = this.state;

    return (
      <DropdownRenderer
        defaultText={defaultText}
        onLabelClicked={this._handleLabelClicked}
        onOptionSelected={this._handleOptionSelected}
        open={open}
        selectedOption={selectedOption}
        theme={theme}
        width={width}>
        {children}
      </DropdownRenderer>
    );
  }
});

export default Dropdown;
