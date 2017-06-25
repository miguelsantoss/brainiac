import React from 'react';
import { Sidebar, Menu, Checkbox, Button, Header, Dimmer, Loader, Popup } from 'semantic-ui-react';

const style = {};

style.shadow = {
  boxShadow: 'none',
};

style.menu = {
  //maxHeight: '100vh',
};

style.popup = {
  borderRadius: 0,
  padding: '2em',
};

class SidebarPushable extends React.Component {
  componentWillReceiveProps = (props) => {
    const { results } = props;
    if (results && results.length) {
      results.forEach(d => d.checkBox = false);
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
    let ticked = [];
    this.state.results.forEach(d => d.checkBox ? ticked.push(d.pmid) : null);
    this.props.saveResults(ticked);
    this.props.closeSidebar();
  }

  renderResults = () => {
    const { loading, results } = this.props;
    if (loading) {
      return (
        <Dimmer active inverted>
          <Loader active inline="centered" />
        </Dimmer>
      );
    } else if (results.length > 0) {
      const items = results.map((d, i) => {
        const header = (
          <Menu.Header>
            <Checkbox
              label={d.title}
              checked={d.checkBox}
              id={d.pmid}
              onChange={(event, checkBox) => this.changeCheckBox(d, checkBox)}
            />
          </Menu.Header>
        );
        const loader = (
          <Dimmer active inverted>
            <Loader active inline="centered" />
          </Dimmer>
        );
        return (
          <Menu.Item key={d.pmid}>
            <Popup
              trigger={header}
              content={d.abstract ? d.abstract : loader}
              basic
              wide
              style={d.abstract ? style.popup : null}
            />
            <Menu.Menu>
              <Menu.Item name={d.authors} />
              <Menu.Item name={d.pubDate} />
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
    const { visible, children } = this.props;
    return (
      <Sidebar.Pushable>
        <Sidebar style={style.menu} as={Menu} animation="overlay" width="very wide" visible={visible} vertical>
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

export default SidebarPushable;
