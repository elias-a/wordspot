import { Spinner, SpinnerType } from 'solid-spinner';

export default function LoadingSpinner() {
  return (
    <Spinner
      type={SpinnerType.ballTriangle}
      class="spinner"
    />
  );
}
