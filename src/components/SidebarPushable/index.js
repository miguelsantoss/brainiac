import React from 'react';
import PropTypes from 'prop-types';
import {
  Sidebar,
  Menu,
  Checkbox,
  Button,
  Header,
  Dimmer,
  Loader,
  Popup,
} from 'semantic-ui-react';

import QueryAbstract from '../QueryAbstract';
import './index.scss';

const style = {};
style.shadow = {
  boxShadow: 'none',
};
style.popup = {
  borderRadius: 0,
  maxWidth: '800px',
};

class SidebarPushable extends React.Component {
  state = {
    results: [],
  };

  componentWillReceiveProps(props) {
    const { results } = props;
    if (results && results.length) {
      results.forEach(d => {
        d.checkBox = false;
      });
      this.setState({ results });
    }
  }

  changeCheckBox = d => {
    d.checkBox = !d.checkBox;
    this.setState(this.state);
  };

  handleButtonCancel = () => {
    this.props.closeSidebar();
  };

  handleButtonSave = newViz => {
    const ticked = [];
    this.state.results.forEach(d => (d.checkBox ? ticked.push(d.pmid) : null));
    this.props.saveResults(ticked, newViz);
    this.props.closeSidebar();
  };

  handleSelectAllClick = checked => {
    const { results } = this.props;
    const newValue = results.length !== checked;
    results.forEach(e => {
      e.checkBox = newValue;
    });
    this.setState(this.state);
  };

  renderResults = () => {
    const { queryLoading } = this.props;
    const { results } = this.state;
    const checkSelection = res => {
      let count = 0;
      res.forEach(e => {
        if (e.checkBox) count += 1;
      });
      if (count === 0) return { icon: 'square outline', checked: count };
      else if (count === res.length) {
        return { icon: 'checkmark box', checked: count };
      }
      return { icon: 'minus square outline', checked: count };
    };
    if (queryLoading) {
      return (
        <Dimmer active inverted>
          <Loader active inline="centered" />
        </Dimmer>
      );
    } else if (results.length > 0) {
      const { icon, checked } = checkSelection(results);
      const items = results.map(docItem => {
        const header = (
          <Menu.Header>
            <Checkbox
              label={docItem.title}
              checked={docItem.checkBox}
              id={docItem.pmid}
              onChange={(event, checkBox) => {
                this.changeCheckBox(docItem, checkBox);
              }}
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
            <Menu.Menu className="queryDocInfo">
              <Menu.Item name={docItem.authors} />
              <Menu.Item name={docItem.pubDate} />
            </Menu.Menu>
          </Menu.Item>
        );
      });
      return (
        <Menu.Item id="queryResults">
          <div id="queryResultList"> {items} </div>
          <Menu.Item style={{ paddingBottom: 5 }}>
            <Button.Group fluid>
              <Button negative onClick={() => this.handleButtonCancel()}>
                Cancel
              </Button>
              <Button positive onClick={() => this.handleButtonSave(true)}>
                Create New
              </Button>
              <Button
                icon={icon}
                content="Select all"
                onClick={() => this.handleSelectAllClick(checked)}
              />
            </Button.Group>
          </Menu.Item>
        </Menu.Item>
      );
    }
    // <Button positive onClick={() => this.handleButtonSave(false)}>Append</Button>
    return <Header>No results found!</Header>;
  };

  render() {
    const { visible, children, queryLoading } = this.props;
    const isVisible = visible && !queryLoading;
    return (
      <Sidebar.Pushable id="testID">
        <Sidebar
          style={style.menu}
          as={Menu}
          animation="overlay"
          width="very wide"
          visible={isVisible}
          vertical
          id="sidebarPushable"
        >
          {this.renderResults()}
        </Sidebar>
        <Sidebar.Pusher> {children} </Sidebar.Pusher>
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
  results: PropTypes.arrayOf(
    PropTypes.shape({
      abstract: PropTypes.string.isRequired,
      authors: PropTypes.string.isRequired,
      pmid: PropTypes.number.isRequired,
      pubDate: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

SidebarPushable.defaultProps = {
  children: [],
};

export default SidebarPushable;
