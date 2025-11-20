// since we get and obj as a defalt param from tanstack, we need to chaneg the param to an obj
// and destructure the signal from it
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