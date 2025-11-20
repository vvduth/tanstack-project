/* eslint-disable no-unused-vars */
import { Link, Outlet, useParams } from "react-router-dom";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Header from "../Header.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../utils/http.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
export default function EventDetails() {
  // id will be available from route params
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  // state to manage deletion status
  const [isDeleting, setIsDeleting] = useState(false);

  // if user confirms deletion
  function handleStartDelete() {
    setIsDeleting(true);
  }
  // if user cancels deletion
  function handleStopDelete() {
    setIsDeleting(false);
  }

  // for deleting event
  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        // set to none to avoid refetching events list after deletion
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleDelete() {
    // need to pass ann object with id property to match deleteEvent function signature
    mutate({ id: id });
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Loading event...</p>
      </div>
    );
  }
  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title={"Failed to load event"}
          message={error.info?.message || "Something went wrong"}
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {/* add confirmation modal for delete */}
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This process cannot be
            undone.
          </p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting event...</p>}
            {!isPendingDeletion && (
              <>
                <button className="button-text" onClick={handleStopDelete}>
                  Cancel
                </button>
                <button className="button" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title={"Failed to delete event"}
              message={deleteError.info?.message || "Something went wrong"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
