// (function (global, factory) {
//   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
//   typeof define === 'function' && define.amd ? define(['exports'], factory) :
//   (factory((global.d3 = global.d3 || {})));
// }(this, (function (exports) { 'use strict';

/**
 * Pulls nodes toward a set of cluster center nodes / points.
 * Adapted from Mike Bostock's Clustered Force Layout III:
 * https://bl.ocks.org/mbostock/7881887
 */

/* code from d3-force-cluster */
/* eslint-disable */
function cluster(_centers) {

  var nodes = void 0,
      centerpoints = [],
      strength = 0.1,
      centerInertia = 0.0;

  // coerce centers accessor into a function
  if (typeof _centers !== 'function') _centers = function centers() {
    return _centers;
  };

  function force(alpha) {
    // scale + curve alpha value
    alpha *= strength * alpha;

    var c = void 0,
        x = void 0,
        y = void 0,
        l = void 0,
        r = void 0;
    nodes.forEach(function (d, i) {
      c = centerpoints[i];
      if (!c || c === d) return;

      x = d.x - c.x;
      y = d.y - c.y;
      l = Math.sqrt(x * x + y * y);
      r = d.radius + (c.radius || 0);

      if (l && l !== r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        c.x += (1 - centerInertia) * x;
        c.y += (1 - centerInertia) * y;
      }
    });
  }

  function initialize() {
    if (!nodes) return;

    // populate local `centerpoints` using `centers` accessor
    var i = void 0,
        n = nodes.length;
    centerpoints = new Array(n);
    for (i = 0; i < n; i++) {
      centerpoints[i] = _centers(nodes[i], i, nodes);
    }
  }

  /**
   * Reinitialize the force with the specified nodes.
   */
  force.initialize = function (_) {
    nodes = _;
    initialize();
  };

  /**
   * An array of objects representing the centerpoint of each cluster,
   * or a function that returns such an array.
   * Each object must have `x` and `y` values, and optionally `radius`.
   */
  force.centers = function (_) {
    // return existing value if no value passed
    if (_ == null) return _centers;

    // coerce centers accessor into a function
    _centers = typeof _ === 'function' ? _ : function (n, i) {
      return _[i];
    };

    // reinitialize
    initialize();

    // allow chaining
    return force;
  };

  /**
   * Strength of attraction to the cluster center node/position.
   */
  force.strength = function (_) {
    return _ == null ? strength : (strength = +_, force);
  };

  /**
   * Inertia of cluster center nodes/positions.
   * Higher values mean the cluster center moves less;
   * lower values mean the cluster center is more easily
   * pulled around by other nodes in the cluster.
   * Typical values range from 0.0 (cluster centers move as much as all other nodes)
   * to 1.0 (cluster centers are not moved at all by the clustering force).
   */
  force.centerInertia = function (_) {
    return _ == null ? centerInertia : (centerInertia = +_, force);
  };

  return force;
}

exports.forceCluster = cluster;

Object.defineProperty(exports, '__esModule', { value: true });

// })));
//# sourceMappingURL=d3-force-cluster.js.map
/* eslint-enable */
