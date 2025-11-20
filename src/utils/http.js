// since we get and obj as a defalt param from tanstack, we need to chaneg the param to an obj
// and destructure the signal from it
import { QueryClient } from '@tanstack/react-query';
// also get the searchTerm to support searching
export async function fetchEvents({signal, searchTerm}) {

  let url = 'http://localhost:3000/events';
  if (searchTerm) {
    url += `?search=${encodeURIComponent(searchTerm)}`;
  }
      // adding signal to fetch options to support aborting the request
      const response = await fetch(url ,{
        signal: signal
      });
      if (!response.ok) {
        const error = new Error('An error occurred while fetching the events');
        error.code = response.status;
        error.info = await response.json();
        throw error;
      }

      const { events } = await response.json();

      return events;
    }
// function to create a new event
export async function createNewEvent(eventData) {
  const response = await fetch(`http://localhost:3000/events`, {
    method: 'POST',
    body: JSON.stringify(eventData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while creating the event');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}

// snend a get request to fetch selectable images
export async function fetchSelectableImages({ signal }) {
  const response = await fetch(`http://localhost:3000/events/images`, { signal });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the images');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { images } = await response.json();

  return images;
}

// general config for react query
export const queryClient = new QueryClient();