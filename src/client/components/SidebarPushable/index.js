import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar, Menu, Checkbox, Button, Header, Dimmer, Loader, Popup } from 'semantic-ui-react';

import QueryAbstract from '../QueryAbstract';

const style = {};

style.shadow = {
  boxShadow: 'none',
};

style.popup = {
  borderRadius: 0,
  maxWidth: '800px',
};

class SidebarPushable extends React.Component {
  componentWillReceiveProps = (props) => {
    const { results } = props;
    if (results && results.length) {
      results.forEach((d) => { d.checkBox = false; });
      this.setState({ results });
    }
  }

  changeCheckBox = (d) => {
    d.checkBox = !d.checkBox;
    this.setState(this.state);
  }

  handleButtonCancel = () => {
    this.props.closeSidebar();
  }

  handleButtonSave = () => {
    const ticked = [];
    this.state.results.forEach(d => (d.checkBox ? ticked.push(d.pmid) : null));
    this.props.saveResults(ticked);
    this.props.closeSidebar();
  }

  renderResults = () => {
    const { queryLoading, results } = this.props;
    if (queryLoading) {
      return (
        <Dimmer active inverted>
          <Loader active inline="centered" />
        </Dimmer>
      );
    } else if (results.length > 0) {
      const items = results.map((docItem) => {
        const header = (
          <Menu.Header>
            <Checkbox
              label={docItem.title}
              checked={docItem.checkBox}
              id={docItem.pmid}
              onChange={(event, checkBox) => this.changeCheckBox(docItem, checkBox)}
            />
          </Menu.Header>
        );
        return (
          <Menu.Item key={docItem.pmid}>
            <Popup
              trigger={header}
              content={<QueryAbstract abstract={docItem.abstract} />}
              flowing
              size="small"
              key={docItem.pmid}
              position="right center"
              style={style.popup}
            />
            <Menu.Menu>
              <Menu.Item name={docItem.authors} />
              <Menu.Item name={docItem.pubDate} />
            </Menu.Menu>
          </Menu.Item>
        );
      });
      return (
        <Menu.Item>
          {items}
          <Menu.Item>
            <Button.Group>
              <Button onClick={this.handleButtonCancel}>Cancel</Button>
              <Button onClick={this.handleButtonSave} positive>Save</Button>
            </Button.Group>
          </Menu.Item>
        </Menu.Item>
      );
    }
    return (
      <Header>No results found!</Header>
    );
  }
  render = () => {
    const { visible, children, queryLoading } = this.props;
    return (
      <Sidebar.Pushable>
        <Sidebar style={style.menu} as={Menu} animation="overlay" width="very wide" visible={visible && !queryLoading} vertical>
          {this.renderResults()}
        </Sidebar>
        <Sidebar.Pusher>
          <div>
            {children}
          </div>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}

SidebarPushable.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  saveResults: PropTypes.func.isRequired,
  queryLoading: PropTypes.bool.isRequired,
  visible: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
  results: PropTypes.arrayOf(PropTypes.shape({
    abstract: PropTypes.string.isRequired,
    authors: PropTypes.string.isRequired,
    pmid: PropTypes.number.isRequired,
    pubDate: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
};

SidebarPushable.defaultProps = {
  children: [],
};

export default SidebarPushable;
