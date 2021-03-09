import { knack } from '../../data/api/index.js';
import moment from 'moment';

export async function getResources() {
	let resourcesRaw = [], calendarResources = [], resourcesLength = 0;
  const filter = {
    match: 'and',
    rules: [
      {
        field: 'field_61',
        operator: 'is',
        value: 'Active'
      }
    ]
  }

  try {
    resourcesRaw = await knack.getAllRecords(11, filter);
    resourcesLength = resourcesRaw.length;
    if (resourcesRaw.length < 1) {
      throw new Error('Sorry there appears to be no resources.');
    }
  } catch (error) {
    return Promise.reject(error);
  }

  for(let index = 0; index < resourcesLength; index++) {
    const { id: resourceId, field_55_raw: resourceTitle = ''} = resourcesRaw[index];

    calendarResources.push({
      id: resourceId,
      title: resourceTitle,
    });
  }

	return calendarResources;
}

export async function getEvents() {
	let eventsRaw = [], calendarEvents = [], eventsLength = 0;
  const filter = {
    match: 'and',
    rules: [
      {
        field: 'field_62',
        operator: 'is',
        value: 'Active'
      },
      {
        field: 'field_56',
        operator: 'is not blank',
      }
    ]
  }

  try {
    eventsRaw = await knack.getAllRecords(10, filter);
    eventsLength = eventsRaw.length;
    if (eventsRaw.length < 1) {
      throw new Error('Sorry there appears to be no events.');
    }
  } catch (error) {
    return Promise.reject(error);
  }

  for(let index = 0; index < eventsLength; index++) {
    const { 
      id: eventId,
      field_54_raw: eventTitle = '',
      field_57_raw: {
        iso_timestamp: eventStartDate = '',
        to: {
          iso_timestamp: eventEndDate = ''
        }
      },
      field_56_raw: resourceId = '',
      field_58_raw: eventDescription = '',
      field_59_raw: eventStatus = ''
    } = eventsRaw[index];
    let textColor = '', backgroundColor = '', borderColor = ''; 

    switch(eventStatus) {
      case 'Pending':
        textColor = '#FFFFF';
        backgroundColor = '#1976d2';
        borderColor = '#1976d2';
        break;
      case 'In Progress':
        textColor = '#FFFFF';
        backgroundColor = '#f57c00';
        borderColor = '#f57c00';
        break;
      case 'Completed':
        textColor = '#FFFFF';
        backgroundColor = '#388e3c';
        borderColor = '#388e3c';
        break;
      default:
        break;
    }

    calendarEvents.push({
      id: eventId,
      title: eventTitle,
      start: moment(eventStartDate).format('YYYY-MM-DD'),
      end: moment(eventEndDate).add(1, 'day').format('YYYY-MM-DD'),
      resourceId: resourceId.map((resource) => resource.id),
      backgroundColor: backgroundColor,
      textColor: textColor,
      borderColor: borderColor,
      allDay: true,
      extendedProps: {
        staff: resourceId.map((resource) => resource.identifier),
        description: eventDescription,
        status: eventStatus,
        start: moment(eventStartDate).format('YYYY-MM-DD'),
        end: moment(eventEndDate).add(1, 'day').format('YYYY-MM-DD'),
      },
    });
  }

  console.log('calendarEvents: ', calendarEvents);
	return calendarEvents;
}

export async function updateEvent(eventId, data) {
  let updateRequest = {};

  try {
    updateRequest = await knack.updateRecord(10, data, eventId);
    console.log('updateRequest: ', updateRequest);
    if (!updateRequest.id) {
      throw new Error('Sorry there was an error updating the event');
    }
  } catch (error) {
    return Promise.reject(error);
  }

  return updateRequest;
}

export async function deleteEvent(eventId) {
  let deleteRequest = {};

  try {
    deleteRequest = await knack.deleteRecord(10, eventId);
    if (!deleteRequest.delete) {
      throw new Error('Sorry there was an error deleting the event');
    }
  } catch (error) {
    return Promise.reject(error);
  }

  return deleteRequest;
}
