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

style.tooltip = {
  position: 'absolute',
  display: 'none',
  minWidth: '200px',
  maxWidth: '300px',
  width: 'auto',
  height: 'auto',
  background: 'none repeat scroll 0 0 #ffffff',
  border: '1px solid #30499B',
  borderRadius: '2px',
  boxShadow: '1px 2px 3px rgba(0,0,0,.5)',
  padding: '5px',
  // textAlign: 'center',
};

style.tooltip2 = style.tooltip;
style.tooltip2.maxWidth = '500px';
style.tooltip2.maxHeight = '50vh';
style.tooltip2.padding = '15px';
style.tooltip2.overflow = 'auto';

export default style;
