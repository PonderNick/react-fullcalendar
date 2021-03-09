import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Loader from '../loader/Loader.js'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
  },
  input: {
    marginTop: '10px',
    width: '100%'
  }
}));

function Inputs(props) {
  const classes = useStyles();
  const {
    id = '',
    label = '',
    type = '',
    variant = '',
    disabled = false,
    defaultValue = '',
    value = '',
    size = '',
    multiline = false,
    InputLabelProps={},
    loading,
    onChange
   } = props;

  return (
    <div className={classes.root}>
      { value && !loading &&
        <TextField
          id={id}
          className={classes.input}
          label={label}
          type={type}
          variant={variant}
          value={value}
          size={size}
          disabled={disabled}
          multiline={multiline}
          InputLabelProps={InputLabelProps}
          onChange={onChange}
        />
      }
      { !value && !loading &&
        <TextField
          id={id}
          className={classes.input}
          label={label}
          type={type}
          variant={variant}
          defaultValue={defaultValue}
          size={size}
          disabled={disabled}
          multiline={multiline}
          InputLabelProps={InputLabelProps}
          onChange={onChange}
        />
      }
      { loading &&
        <Loader
          variant="rect"
          animation="wave"
        />
      }
    </div>
  );
}

export default Inputs;
