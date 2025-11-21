/* eslint-disable no-unused-vars */
// this component is used to edit an existing event.
// for mow, it uses null as inputData for EventForm,
// but in the future, it should fetch the existing event data
// and pass it as inputData to EventForm.

import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();

  // this submit is provied by react router dom
  // it allows us to programmatically submit forms
  const submit = useSubmit();
  const params = useParams();

  // get the event to we get prepopulate the form
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),

    // with the help of loader , refetching the data when the component mounts is not necessary
    // set staleTime to a reasonable value to avoid unnecessary refetches
    staleTime: 5000,
  });

  // ccrete a mutaitob that target updateEvent in http,js
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // this will be called right before the mutation function is fired
    // that measn bbefore u get a  response from the backend
    onMutate: async (data) => {
      const newEvent = data.event;

      // when perform optimistic update, cancel all active query for a specific query key
      // make sure no one is overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["events", params.id] });

      // before we update the data, get the previous data so we can roll back if something goes wrong
      // i.e the res from the backend returns an error
      const previousEvent = queryClient.getQueryData(["events", params.id]);

      // use queryClientt to manipulate that already stored data without waiting for a rsponse
      queryClient.setQueryData(["events", params.id], newEvent);
      // return the previous event so we can use it in onError for rollback (inside context )
      return { previousEvent };
    },
    // error, data , context the values provied here are from onMutate
    // data is the same as the one passed to mutate function
    // conext is what we return from onMutate really important for rollback
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", params.id], context.previousEvent);
    },
    // will be called when the mutation is either success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events", params.id] });
    },
  });

  function handleSubmit(formData) {
    // pass an obj with id and event to match the updateEvent function in http.js
    // mutate({ id: params.id, event: formData });
    // navigate('../');
    // this will triiger client side action, which is defined below

    // we can remove themutation above and use submit to trigger the action
    submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;
  if (isPending) {
    content = (
      <p className="center">
        <LoadingIndicator />
      </p>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || "Failed to load event."}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Close
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === "submitting"  ? (
          <p>
            Sending data...
          </p>
        ) : (
          <p>
            Please edit the event details and click &quot;Update&quot; to save the changes.
          </p>
        )}
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

// loader is from react router dom
// kloader will be called before the component is rendered
// in this case we use  tanstack and react router dom together
// so we can prefetch the data before the component is rendered
// this way we avoid loading states inside the component itself
// and have a better user experience

// so when useQurey in the component runs
// the data is already in the cache and ready to be used
export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

// action will be trigered when the form inside EventForm is submitted
export async function action({ request, params }) {
  const formData = await request.formData();

  // transform formData to a regular object
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  queryClient.invalidateQueries({ queryKey: ["events"] });
  return redirect("../");
}
