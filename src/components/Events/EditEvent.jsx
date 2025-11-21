// this component is used to edit an existing event.
// for mow, it uses null as inputData for EventForm,
// but in the future, it should fetch the existing event data
// and pass it as inputData to EventForm.

import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../utils/http.js';
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

  // ccrete a mutaitob that target updateEvent in http,js
  const  {mutate} = useMutation({
    mutationFn: updateEvent,
    // this will be called right before the mutation function is fired
    // that measn bbefore u get a  response from the backend
    onMutate: async (data) => {
      const newEvent = data.event;

      // when perform optimistic update, cancel all active query for a specific query key
      // make sure no one is overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['events', params.id] });

      // before we update the data, get the previous data so we can roll back if something goes wrong
      // i.e the res from the backend returns an error
      const previousEvent = queryClient.getQueryData(['events', params.id]);  
      
      // use queryClientt to manipulate that already stored data without waiting for a rsponse
      queryClient.setQueryData(['events', params.id],
        newEvent
      )
      // return the previous event so we can use it in onError for rollback (inside context )
      return { previousEvent  };
    },
    // error, data , context the values provied here are from onMutate
    // data is the same as the one passed to mutate function
    // conext is what we return from onMutate really important for rollback
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', params.id],
        context.previousEvent
      )
    },
    // will be called when the mutation is either success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events', params.id] });
    }
      
    
  })

  function handleSubmit(formData) {
    // pass an obj with id and event to match the updateEvent function in http.js
    mutate({ id: params.id, event: formData });
    navigate('../');
  }

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
