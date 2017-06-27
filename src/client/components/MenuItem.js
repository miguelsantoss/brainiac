import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';

class MenuItem extends PureComponent {
  render = () => {
    const { name } = this.props;
    return (
      <Menu.Item
        name={name}
      />
    );
  }
}

MenuItem.propTypes = {
  name: PropTypes.string.isRequired,
};

export default MenuItem;
