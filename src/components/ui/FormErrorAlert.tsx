interface FormErrorAlertProps {
  error: string;
}

export default function FormErrorAlert({ error }: FormErrorAlertProps) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container">
      {error}
    </p>
  );
}
