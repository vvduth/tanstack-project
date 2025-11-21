/* eslint-disable no-unused-vars */
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../utils/http.js";
export default function NewEventsSection() {

  // you can controll the query behavior via the 3rd parameter
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events" ,{
      max: 3
    }],

    // tanstack pass some def to this query function
    // in this section the serch qurey will be an object
    // that gives us info abbout key and signal to abort the request
    // abort is useful when the component unmounts before the request completes
    // like we navigate away from the page before the request completes
    // set max to 3 to get only 3 events
    // pass query key to get the params
    // in this case we get max from query key to avoid redundancy
    // use spead operator to get other params in the future
    queryFn: ({signal,queryKey}) =>  fetchEvents({ signal, ...queryKey[1] }),
    // control after which time react query should refetch the data 
    staleTime: 1000 * 60, // 1 minute

    // controll how long the cached data should be kept in memory
    gcTime: 1000 * 60 * 0.5, // 0.5 minutes
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (error) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events."}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
