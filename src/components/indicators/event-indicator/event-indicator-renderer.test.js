import test from 'ava';
import React from 'react';
import { shallow } from 'enzyme';

import EventIndicatorRenderer from './event-indicator-renderer';

const mockData = [
  {
    color: 'blue',
    count: 1,
    name: 'mock one',
    theme: 'light'
  },
  {
    color: 'white',
    count: 22,
    name: 'mock two'
  }
];

mockData.forEach((data, i) => {
  test(`EventIndicatorRenderer should be a function - Test ${i}`, t => {
    t.is(typeof EventIndicatorRenderer, 'function');
  });

  test(`EventIndicatorRenderer should create a valid React Component when called with required props - Test ${i}`,
    t => {
      const eventIndicatorRendererJsx = (
        <EventIndicatorRenderer
          color={data.color}
          count={data.count}
          name={data.name}
          theme={data.theme} />
      );

      const wrapper = shallow(eventIndicatorRendererJsx);

      // should have two circles
      const indicatorCircles = wrapper.find('circle');
      t.true(indicatorCircles.nodes.length === 2);

      // should have two text elements
      const indicatorTexts = wrapper.find('text');
      t.true(indicatorTexts.nodes.length === 2);

      // one text element should contain the name
      const name = wrapper.find('.cbn-sg-playground__event-name');
      t.is(name.text(), data.name);

      // one text element should contain the count value
      const count = wrapper.find('.cbn-sg-playground__event-count');
      t.is(count.text(), data.count.toString());
    });
});
