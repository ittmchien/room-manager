export function ErrorAlert({ message }: { message: string }) {
  return (
    <p className="rounded-2xl bg-red-50 px-3 py-2 text-center text-sm text-red-600">
      {message}
    </p>
  );
}
