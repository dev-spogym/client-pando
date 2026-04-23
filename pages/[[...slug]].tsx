import type { GetServerSideProps } from 'next';
import App from '@/App';
import { RouteStateProvider } from '@/lib/route-state';

export default function CatchAllPage({ initialUrl }: { initialUrl: string }) {
  return (
    <RouteStateProvider initialUrl={initialUrl}>
      <App />
    </RouteStateProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ resolvedUrl }) => ({
  props: {
    initialUrl: resolvedUrl || '/',
  },
});
