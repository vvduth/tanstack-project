// this component is used to create a new event
// for now it only displays a modal with a form
// the form does not do anything yet

/* eslint-disable no-unused-vars */
import { Link, useNavigate } from 'react-router-dom';
// usemotuation will be used to submit the form data
// you stil can use usequery but usemutation is more suited for this case
import { useMutation } from '@tanstack/react-query';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();

  // unlike usequreym usemutation does not run automatically
  // it returns a mutate function that you can call to run the mutation
  // only run when you call mutate
  const {mutate, isPending, isError, error} = useMutation({
    mutationFn: createNewEvent,
  })

  function handleSubmit(formData) {
    // call mutate with the form data to create a new event
    // wrap the form data in an obj to match the createNewEvent param
    mutate({
      eventData: formData
    });
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submiting..."}
        {!isPending && (
          <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Create
          </button>
        </>
        )}
      </EventForm>
      {isError && <ErrorBlock 
        title={"An error occured to create event"}
        message={error.info?.message || "Failed to create event, please check your input."}

      />}
    </Modal>
  );
}
