import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%'
  },
  loader: {
    display: 'inline-block',
    minHeight: '25px',
    minWidth: '100px',
    height: '100%',
    width: '100%',
    marginTop: '5px'
  }
});

function Loader(props) {
  const classes = useStyles();
  const { 
    variant,
    animation,
  } = props;

  return (
    <div className={classes.root}>
      <Skeleton
        className={classes.loader}
        variant={variant}
        animation={animation}
      />
    </div>
  );
}

export default Loader;
