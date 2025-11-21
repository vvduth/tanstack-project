import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {

  // useIsFetching returns the number of active fetches
  // help us to find out if there is any ongoing background fetch
  const fetching = useIsFetching();
  return (
    <>
      <div id="main-header-loading">
        {fetching > 0 ? <progress/>: null}
        
      </div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
