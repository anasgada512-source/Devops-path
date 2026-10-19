// Shared loading / error states for API driven pages.
export default function Status({ loading, error, children }) {
  if (loading)
    return (
      <div className="page narrow" aria-busy="true">
        <p className="muted">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="page narrow">
        <h1>Could not load this page</h1>
        <p className="form-error">{error.message}</p>
        <p>If you are running locally, make sure the API server is running on port 5000 and MongoDB is connected.</p>
      </div>
    );
  return children;
}
