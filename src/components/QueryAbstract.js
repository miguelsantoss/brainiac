import React from 'react';
import PropTypes from 'prop-types';

const queryAbstract = props => {
  const { abstract } = props;
  const noAbstract = !abstract;
  return (
    <div>
      <span>
        <b>Abstract:</b>
        <br />
        {noAbstract ? 'No abstract available' : abstract}
      </span>
    </div>
  );
};

queryAbstract.propTypes = {
  abstract: PropTypes.string.isRequired,
};

export default queryAbstract;
