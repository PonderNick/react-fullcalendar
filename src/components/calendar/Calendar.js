import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import './Calendar.css';
import { getResources, getEvents, updateEvent, deleteEvent } from './CalendarData.js';
import Sidebar from '../sidebar/Sidebar.js';
import Card from '../common/Card.js';
import Form from '../common/Form.js';
import Inputs from '../common/Inputs.js';
import Select from '../common/Select.js';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import ClearIcon from '@material-ui/icons/Clear';
import moment from 'moment';
//import Loader from '../loader/Loader.js'

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      licenseKey: 'GPL-My-Project-Is-Open-Source',
      plugins: [ resourceTimelinePlugin],
      headerToolbar: {
        left: 'title',
        center: 'Week,Month',
        right: 'prev,today,next'
      },
      initialView: 'Week',
      height: '100%',
      resourceAreaWidth: '10%',
      expandRows: true,
      allevents: [],
      allResources: [],
      views: {
        Week: {
          type: 'resourceTimeline',
          duration: { weeks: 1 },
          slotLabelInterval: { hours: 24 },
          slotLabelFormat: { day: 'numeric', weekday: 'short'},
          buttonText: 'Week',
        },
        Month: {
          type: 'resourceTimeline',
          duration: { months: 1 },
          buttonText: 'Month',
        },
      },
      sideBar: false,
      eventDetails: {
        id: '',
        title: '',
        description: '',
        start: '',
        end: '',
        status: '',
        staff: ''
      },
      loading: false
    };
    this.eventClicked = this.eventClicked.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.clearEvent = this.clearEvent.bind(this);
    this.editEvent = this.editEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.closeSideBar = this.closeSideBar.bind(this);
  }

  async componentDidMount() {
    await this.fetchResources();
    await this.fetchEvents();    
  }

  componentDidUpdate() {
    console.log('Component Updated');
  }

  fetchEvents() {
    const setState = this.setState.bind(this);
    setState({
      loading: true
    });

    return getEvents()
    .then((response) => {
      setState({
        allevents: response,
        loading: false
      });
    })
    .catch((error) => {
      alert(error);
    });
  }

  fetchResources() {
    const setState = this.setState.bind(this);
    setState({
      loading: true
    });

    return getResources()
    .then((response) => {
      setState({
        allResources: response,
        loading: false
      });
    })
    .catch((error) => {
      alert(error);
    });
  }

  addEvent() {

  }

  editEvent(e, type) {
    const setState = this.setState.bind(this);
    const { eventDetails } = this.state;
    let updatedState = { 
      eventDetails: {
        [type]: e.target.value
      }
    };

    for(const [key, value] of Object.entries(eventDetails)) {
      if (type !== key) {
        updatedState.eventDetails[key] = value;
      }
    }

    setState(updatedState);
  }

  deleteEvent(e) {
    // eslint-disable-next-line no-restricted-globals
    const confirmDelete = confirm('Are you sure you want to clear this events details?');
    const setState = this.setState.bind(this);
    const { eventDetails: { id } } = this.state;
    setState({
      loading: true
    });

    if (!confirmDelete) {
      return 'Finished';
    }

    return deleteEvent(id)
    .then(this.fetchEvents())
    .then(() => {
      return setState({
        sideBar: false,
        eventDetails: {
          id: '',
          title: '',
          staff: '',
          description: '',
          start: '',
          end: '',
          status: ''
        },
        loading: false
      });
    })
    .catch((error) => {
      alert(error);
      return setState({
        loading: false
      });
    });
  }

  saveEvent() {
    const setState = this.setState.bind(this);
    const { 
      eventDetails: { 
        id,
        title,
        description,
        start,
        end,
        status,
        staff,
      } 
    } = this.state;
    const data = {
      field_54: title,
      field_58: description,
      field_59: status,
      field_57: {
        date: moment(start, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        to: {
          date: moment(end, 'YYYY-MM-DD').format('DD/MM/YYYY')
        }
      }
    };

    return updateEvent(id, data)
    .then(this.fetchEvents())
    .then(() => {
      return setState({
        loading: false
      });
    })
    .catch((error) => {
      alert(error);
      return setState({
        loading: false
      });
    });
  }

  clearEvent() {
    // eslint-disable-next-line no-restricted-globals
    const confirmClear = confirm('Are you sure you want to clear this events details?');
    const setState = this.setState.bind(this);
    if (confirmClear) {
      setState({
        eventDetails: {
          id: '',
          title: '',
          staff: '',
          description: '',
          start: '',
          end: '',
          status: ''
        }
      });
    }
  }

  eventClicked(e) {
    const setState = this.setState.bind(this);
    const { 
      sideBar,
      eventDetails: { 
        id: prevId
      } 
    } = this.state;
    const { 
      event: {
        id = '',
        title = '',
        extendedProps: {
          staff = '',
          description = '',
          status = '',
          start = '',
          end = '' 
        }
      } 
    } = e;

    if (prevId !== id) {
      setState({
        sideBar: true,
        eventDetails: {
          id: id,
          title: title,
          staff: staff,
          description: description,
          start: start,
          end: end,
          status: status
        }
      });
    } else {
      setState({
        sideBar: !sideBar,
        eventDetails: {
          id: '',
          title: '',
          staff: '',
          description: '',
          start: '',
          end: '',
          status: ''
        }
      });   
    }
  }

  closeSideBar() {
    const setState = this.setState.bind(this);
    setState({
      sideBar: false,
      eventDetails: {
        id: '',
        title: '',
        staff: '',
        description: '',
        start: '',
        end: '',
        status: ''
      }
    });   
  }

  render() {
    const {
      licenseKey,
      plugins,
      headerToolbar,
      initialView,
      views,
      height,
      resourceAreaWidth,
      expandRows,
      allResources,
      allevents,
      sideBar,
      eventDetails: {
        title,
        description,
        start,
        end,
        status,
        staff,
      },
      loading
      } = this.state;

    return (
      <div className='calendar-main-container'>
        <div className={sideBar === true ? 'reduced-container-calendar' : 'container-calendar'}>
          <FullCalendar
            schedulerLicenseKey={licenseKey}
            plugins={plugins}
            headerToolbar={headerToolbar}
            initialView={initialView}
            views={views}
            height={height}
            resourceAreaWidth={resourceAreaWidth}
            expandRows={expandRows}
            resources={allResources}
            events={allevents}
            eventClick={this.eventClicked}
          />
        </div>
        <Sidebar open={sideBar}>
          { sideBar === true &&
          <Card 
            title=''
            variant='elevation'
            onClick={this.closeSideBar}
            loading={loading}
            actions={
              [
                {
                  id: 1,
                  type: 'delete',
                  text: 'Delete',
                  variant: 'outlined',
                  color: 'secondary',
                  size: 'small',
                  startIcon: <DeleteIcon />,
                  action: this.deleteEvent
                },
                {
                  id: 2,
                  type: 'clear',
                  text: 'Clear',
                  variant: 'contained',
                  color: 'inherit',
                  size: 'small',
                  startIcon: <ClearIcon />,
                  action: this.clearEvent
                },
                {
                  id: 3,
                  type: 'save',
                  text: 'Save',
                  variant: 'contained',
                  color: 'primary',
                  size: 'small',
                  startIcon: <SaveIcon />,
                  action: this.saveEvent
                }
              ]
            }
            >
            <Form>
              <Inputs
                  id='eventTitle'
                  variant='standard'
                  label='Title'
                  value={title}
                  size='small'
                  disabled={false}
                  loading={loading}
                  onChange={(e) => { this.editEvent(e ,'title') }}
                />
              <Inputs
                  id='eventDescription'
                  variant='standard'
                  label='Description'
                  value={description}
                  size='small'
                  disabled={false}
                  multiline={true}
                  loading={loading}
                  onChange={(e) => { this.editEvent(e ,'description') }}
                />
                <div className='dates-container'>
                  <div className='start-date'>
                    <Inputs
                      id='eventStart'
                      variant='standard'
                      label='Start Date'
                      type='date'
                      value={start}
                      size='small'
                      disabled={false}
                      loading={loading}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(e) => { this.editEvent(e ,'start') }}
                    />
                  </div>
                  <div className='end-date'>
                  <Inputs
                      id='eventEnd'
                      variant='standard'
                      label='End Date'
                      type='date'
                      value={end}
                      size='small'
                      disabled={false}
                      loading={loading}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(e) => { this.editEvent(e ,'end') }}
                    />
                  </div>
                </div>
                <Select
                  id='eventStatus'
                  variant='standard'
                  label='Status'
                  labelId='statusId'
                  value={status}
                  loading={loading}
                  options={
                    [
                      {id: 1, title:'Pending'},
                      {id: 2, title:'In Progress'},
                      {id: 3, title:'Completed'}
                    ]
                  }
                  onChange={(e) => { this.editEvent(e ,'status') }}
                />
                <Select
                  id='eventStaff'
                  variant='standard'
                  label='Staff'
                  labelId='staffId'
                  value={staff}
                  options={allResources}
                  loading={loading}
                  onChange={(e) => { this.editEvent(e ,'staff') }}
                />
            </Form>
          </Card>
          }
        </Sidebar>
      </div>
    );
  }
};

export default Calendar;
