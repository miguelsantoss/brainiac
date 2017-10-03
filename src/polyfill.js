/* eslint-disable */
if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    const parent = this.parentNode;
    const parentComputedStyle = window.getComputedStyle(parent, null);
    const parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width'), 10);
    const parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width'), 10);
    const overTop = this.offsetTop - parent.offsetTop < parent.scrollTop;
    const overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight);
    const overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft;
    const overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth);
    const alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

if (!Object.keys) {
  Object.keys = (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

/* eslint-enable */
