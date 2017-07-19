const style = {};
const sidebarWidth = 220;

style.main = {
  marginLeft: sidebarWidth,
};

style.menu = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  width: sidebarWidth,
  paddingBottom: '1em',
  // match menu background
  // prevents a white background when items are filtered out by search
  background: '#30499B',
  overflowY: 'scroll',
};

export default style;
