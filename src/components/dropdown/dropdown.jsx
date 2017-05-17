import React from 'react';
import PropTypes from 'prop-types';
import { flatten, find, flow, map } from 'lodash/fp';

// Styles
import './dropdown.css';

// Renderer
import DropdownRenderer from './dropdown-renderer';

/**
 * This is a stateful component providing a rich version of a native select box.
 *
 * *Note: you'll also need to import MenuOption if you with to use this inside the component.*
 * {@see /#!/MenuOption}
 */
class Dropdown extends React.Component {
  /**
   * Create a new Dropdown view
   * @param  {Object} props
   */
  constructor(props) {
    super(props);

    this.displayName = 'Dropdown';

    // bind method scope
    this._findSelectedOptionElement = this._findSelectedOptionElement.bind(this);
    this._handleRef = this._handleRef.bind(this);
    this._getOptionsList = this._getOptionsList.bind(this);
    this._handleLabelClicked = this._handleLabelClicked.bind(this);
    this._handleOptionSelected = this._handleOptionSelected.bind(this);
    this._handleFocusChange = this._handleFocusChange.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

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

    this.state = {
      focusedOption: null,
      selectedOption,
      open: false
    };
  }

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
    : find(c => c.props.selected)(children);
  }

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
    this._focusLabel();
  }

  /**
   * Sort, filter and flatten the list of children to retrieve just the MenuOptions,
   * with any Sections removed.
   * @return {Object} A flat list of MenuOptions
   */
  _getOptionsList() {
    /**
     * Recurse through sections to retrieve a list of all MenuOptions
     * @param  {Object} previous The Options array as of the previous iteration
     * @param  {Object} current  The current item (either a MenuOption or Section)
     * @return {Object}          The current state of the Options array
     */
    const getSectionChildren = (previous, current) => {
      if (current.props.primaryText) {
        // MenuOption: Add to list
        return previous.concat(current);
      } else if (current.type === 'section') {
        // Section: Keep recursing
        return previous.concat(
          current.props.children.reduce(getSectionChildren, [])
        );
      }
      return previous;
    };

    return React.Children.toArray(this.props.children)
      .reduce(getSectionChildren, []);
  }

  /**
   * Convenience method to return focus from an option to the label
   */
  _focusLabel() {
    this.dropdown.querySelector('.cbn-dropdown__label')
      .focus();

    this.setState({
      focusedOption: null
    });
  }

  /**
   * When the focused option changes (e.g. via up/down keyboard controls),
   * update the focusedOption index state and select the new one
   * @param {number} direction - The direction that focus is travelling through the list:
   * negative is up and positive is down.
   */
  _handleFocusChange(direction) {
    let { focusedOption } = this.state;
    const optionsLength = this._getOptionsList().length;

    if (focusedOption === null) {
      focusedOption = (direction > 0) ? 0 : optionsLength - 1;
    } else {
      focusedOption += direction;
    }
    if (focusedOption >= optionsLength || focusedOption < 0) {
      focusedOption = null;
    }

    this.setState({ focusedOption }, () => {
      const focusClass = focusedOption !== null
        ? '.cbn-menu-option--focused'
        : '.cbn-dropdown__label';
      this.dropdown.querySelector(focusClass)
        .focus();
    });
  }

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
      this.setState({ open: false }, () => {
        if (typeof onClosed === 'function') {
          onClosed();
        }
      });
    }
    this._focusLabel();
  }

  /**
   * Retrieve a reference to the dropdown DOM node (from the renderer component),
   * and assign it to a class-wide variable property.
   * @param {object} el - The ref for the Dropdown container node
   */
  _handleRef(el) {
    this.dropdown = el;
  }

  /**
   * API method to open the dropdown
   */
  open() {
    const { onOpened } = this.props;
    this.setState({ open: true }, () => {
      this._focusLabel();
      if (typeof onOpened === 'function') {
        onOpened();
      }
    });
  }

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
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#render}
   * @return {object} JSX for this component
   */
  render() {
    const { children, defaultText, theme, width } = this.props;
    const { open, focusedOption, selectedOption } = this.state;

    return (
      <DropdownRenderer
        defaultText={defaultText}
        handleRef={this._handleRef}
        onLabelClicked={this._handleLabelClicked}
        onOptionSelected={this._handleOptionSelected}
        onSelectChanged={this._handleFocusChange}
        open={open}
        focusedOption={focusedOption}
        selectedOption={selectedOption}
        theme={theme}
        width={width}>
        {children}
      </DropdownRenderer>
    );
  }
}

Dropdown.defaultProps = {
  children: null,
  defaultText: 'Please select...',
  onChanged: null,
  onClosed: null,
  onOpened: null,
  theme: 'light',
  width: 160
};

Dropdown.propTypes = {
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
};

export default Dropdown;
