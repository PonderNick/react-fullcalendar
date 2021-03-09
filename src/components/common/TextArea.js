import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

const useStyles = makeStyles((theme) => ({
  root: {
    'margin-top': '10px',
    width: '100%'
  },
  textArea: {
    width: '100%',
  }
}));

function TextArea(props) {
  const classes = useStyles();
  const { 
    rowsMin = 1,
    placeholder = '',
    defaultValue = '',
    rowsMax = ''
  } = props;

  return (
    <div className={classes.root}>
      <TextareaAutosize className={classes.textArea} rowsMin={rowsMin} placeholder={placeholder} rowsMax={rowsMax} defaultValue={defaultValue} />
    </div>
    );
}

export default TextArea;