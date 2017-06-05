export default function (target) {

  let nodes,
    targets,
    strength,
    strengths,
    radius,
    speeds;

  function force (alpha) {
    let node, target, strength;
    for (let i=0; i<nodes.length; i++) {
      node = nodes[i];
      target = targets[i];
      strength = strengths[i];
      // node.vx += (target[0] - node.x) * strength * alpha;
      // node.vy += (target[1] - node.y) * strength * alpha;
      let x = (target[0] - node.x) * strength * 0.07 * alpha;
      let y = (target[0] - node.y) * strength * 0.07 * alpha;
      node.vx += x - y;
      node.vy += y + x;
    }
  }

  function initialize () {
    if (!nodes) return;

    // populate local `strengths` using `strength` accessor
    strengths = new Array(nodes.length);
    for (let i=0; i<nodes.length; i++) strengths[i] = strength(nodes[i], i, nodes);

    // populate local `targets` using `target` accessor
    targets = new Array(nodes.length);
    for (let i=0; i<nodes.length; i++) targets[i] = target(nodes[i], i, nodes);
  }

  force.initialize = _ => {
    nodes = _;
    initialize();
  };

  force.strength = _ => {
    // return existing value if no value passed
    if (_ == null) return strength;

    // coerce `strength` accessor into a function
    strength = typeof _ === 'function' ? _ : () => +_;

    // reinitialize
    initialize();

    // allow chaining
    return force;
  };

  force.target = _ => {
    // return existing value if no value passed
    if (_ == null) return target;

    // coerce `target` accessor into a function
    target = typeof _ === 'function' ? _ : () => _;

    // reinitialize
    initialize();

    // allow chaining
    return force;
  };

  force.radius = _ => {
    // return existing value if no value passed
    if (_ == null) return radius;

    // coerce `target` accessor into a function
    radius = typeof _ === 'function' ? _ : () => _;

    // reinitialize
    initialize();

    // allow chaining
    return force;
  };

  force.speed = _ => {
    // return existing value if no value passed
    if (_ == null) return speed;

    // coerce `target` accessor into a function
    speed = typeof _ === 'function' ? _ : () => _;

    // reinitialize
    initialize();

    // allow chaining
    return force;
  };

  if (!strength) force.strength(0.1);
  if (!target) force.target([ 0, 0 ]);

  return force;

}