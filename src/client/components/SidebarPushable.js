import React from 'react';
import { Sidebar, Segment, Menu, Image, Checkbox, Button, Header, Dimmer, Loader } from 'semantic-ui-react';

const style = {};

style.shadow = {
    boxShadow: 'none',
}

style.menu = {
    //maxHeight: '100vh',
}

class SidebarPushable extends React.Component {
    renderResults = () => {
        const { queryRequest, loading, results } = this.props;
        if(queryRequest) {
            if(loading) {
                return (
                    <Dimmer active inverted>
                        <Loader active inline='centered' />
                    </Dimmer>
                );
            }
            else if(results.length > 0) {
                console.log(results);
                const items =  results.map(d => (
                    <Menu.Item key={d.pmid}>
                        <Menu.Header><Checkbox label={d.title} /></Menu.Header>
                        <Menu.Menu>
                            <Menu.Item name={d.authors} />
                            <Menu.Item name={d.pubDate} />
                        </Menu.Menu>
                    </Menu.Item>
                ));
                return (
                    <Menu.Item>
                        {items}
                        <Menu.Item>
                            <Button.Group>
                                <Button>Cancel</Button>
                                <Button positive>Save</Button>
                            </Button.Group>
                        </Menu.Item>
                    </Menu.Item>
                )
            }
            else {
                return (
                    <Header>No results found!</Header>
                );
            }
        }
    } 
    render = () => {
        const { visible, children } = this.props;
        return (
            <Sidebar.Pushable>
                <Sidebar style={style.menu} as={Menu} animation='overlay' width='very wide' visible={visible} vertical>
                    {this.renderResults()}
                </Sidebar>
                <Sidebar.Pusher>
                    <div>
                        {children}
                    </div>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        )
    }
}

export default SidebarPushable;