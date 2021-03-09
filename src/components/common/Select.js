import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Loader from '../loader/Loader.js';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  formControl: {
    minWidth: 120,
    width: '100%',
    marginTop: '10px'
  },
  select: {
    width: '100%',
  },
}));

function SelectComponent(props) {
  const classes = useStyles();
  const { 
    id = '',
    variant = '',
    label = '',
    labelId = '',
    value = '',
    defaultValue = '',
    options = [],
    loading,
    onChange
  } = props;

  const menuOptions = options.map((item) => {
    return <MenuItem key={item.id} value={item.title}>{item.title}</MenuItem>
  });

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
       { !loading &&
        <InputLabel id={labelId}>{label}</InputLabel>
       }
        { value && !loading &&
          <Select
            id={id}
            className={classes.select}
            labelId={labelId}
            variant={variant}
            value={value}
            onChange={onChange}
          >
          {
            menuOptions
          }
        </Select>
        }
        { !value && !loading &&
          <Select
            id={id}
            className={classes.select}
            labelId={labelId}
            variant={variant}
            defaultValue={defaultValue}
            onChange={onChange}
          >
          {
            menuOptions
          }
        </Select>
        }
        { loading &&
          <Loader
            variant="rect"
            animation="wave"
          />
        }
        </FormControl>
    </div>
  );
}

export default SelectComponent;
