// this component is used to edit an existing event.
// for mow, it uses null as inputData for EventForm,
// but in the future, it should fetch the existing event data
// and pass it as inputData to EventForm.

import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';  
export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  // get the event to we get prepopulate the form
  const { data , isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal}) =>  fetchEvent({signal, id: params.id}),
  })

  function handleSubmit(formData) {}

  function handleClose() {
    navigate('../');
  }

  let content;
  if (isPending) {
    content = <p className='center'>
  <LoadingIndicator />
    </p>;
  }

  if (isError) {
    content = (
      <>
      <ErrorBlock 
      title = "An error occurred"
      message={error.info?.message|| "Failed to load event."} />
      <div className='form-actions'>
        <Link to="../" className="button">
          Close
        </Link>
      </div>
      </>
    )
  }

  if (data ) {
    content = (
       <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    )
  }

  return (
    <Modal onClose={handleClose}>
     {content}
    </Modal>
  );
}
