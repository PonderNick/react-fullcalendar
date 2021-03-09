import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Loader from '../loader/Loader.js';

const useStyles = makeStyles({
  root: {
    height: '100%',
    minWidth: 275,
    'text-align': 'left'
  },
  title: {
    fontSize: 20,
  },
  avatar: {
    '&:hover': {
      cursor: 'pointer'
    }
  },
  content: {
    minHeight: 400,
    height: 'fit-content',
  },
  footer: {
    height: 'fit-content',
    float: 'right'
  }
});


function CardComponent(props) {
  const classes = useStyles();
  const {
    title,
    variant,
    onClick,
    loading,
    actions 
  } = props;

  const cardActions = actions.map((item) => {

    if (loading) {
      return <Loader key={item.id} variant="rect" animation="wave"/>
    } else {
      return <Button
      key={item.id}
      variant={item.variant}
      color={item.color}
      size={item.size}
      className={classes.button}
      startIcon={item.startIcon}
      onClick={item.action}
      >
        {item.text}
      </Button>
    }
  });

  return (
    <Card className={classes.root} variant={variant}>
      <CardHeader
        className={classes.title}
        title={title}
        avatar={<ArrowBackIosIcon className={classes.avatar}/>}
        onClick={onClick}
      />
      <hr/>
      <CardContent className={classes.content}>
        {props.children}
      </CardContent>
      <CardActions className={classes.footer}>
        {cardActions}
      </CardActions>
    </Card>
  );
}

export default CardComponent;
