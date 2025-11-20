/* eslint-disable no-unused-vars */
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../utils/http";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";

// this component is a search bar
// the goal is to allow user to eneter the search term
// and submit the form to search for events
// that meets the search term
// cuurently the form does not do anything

export default function FindEventSection() {
  const searchElement = useRef();
  // use state to store the search term and to make the query refetch when it changes
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isPending, isError, error } = useQuery({
    // use serach term state to refetch data when it changes >= lead to diff querty being as searchterm changes
    queryKey: ["events", { search: searchTerm }],
    // turn the search term into an obj to pass to fetchEvents
    // also get the signal from tanstack to support aborting the request
    queryFn: ({signal}) => fetchEvents({signal, searchTerm}),
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title={"An error occured"}
        message={error.info?.message || "Failed to fetch events."}
      />
    );
  }

  if (data) {
    content = (
      <ul className="event-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
      <p>Please enter a search term and to find events.</p>
    </section>
  );
}
