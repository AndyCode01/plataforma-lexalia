const ErrorMessage = ({ message }) => (
  message ? (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
      {message}
    </div>
  ) : null
);

export default ErrorMessage;
