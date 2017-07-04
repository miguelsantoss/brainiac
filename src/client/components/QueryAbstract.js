import React from 'react';
import PropTypes from 'prop-types';

const queryAbstract = (props) => {
  const { abstract } = props;
  return (
    <div>
      <span>
        <b>Abstract:</b><br />
        {abstract}
      </span>
    </div>
  );
};

queryAbstract.propTypes = {
  abstract: PropTypes.string.isRequired,
};

export default queryAbstract;
