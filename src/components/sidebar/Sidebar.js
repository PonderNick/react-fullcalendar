import React, { Component } from 'react'
import './Sidebar.css';

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
      loading: false
    }
  }

  componentDidUpdate() {
    const setState = this.setState.bind(this);
    const { open: stateOpen } = this.state;
    const { open: propsOpen } = this.props;

    if (propsOpen !== stateOpen) {
      setState({
        open: propsOpen
      });
    }
  }

  render() {
    const { open } = this.state;
    return(
      <div className={open === true ? 'container-open-sidebar' : 'container-closed-sidebar'}>
        {this.props.children}
      </div>
    );
  }
}

export default SideBar;