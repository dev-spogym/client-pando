'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
} from 'react';

type NavigateOptions = { replace?: boolean };
type SearchParamsInit =
  | string
  | string[][]
  | Record<string, string | number | boolean | null | undefined>
  | URLSearchParams;

type LocationShape = {
  hash: string;
  key: string;
  pathname: string;
  search: string;
  state: null;
};

const LOCATION_CHANGE_EVENT = 'spogym:location-change';

function createSearchParams(init?: SearchParamsInit) {
  if (!init) return new URLSearchParams();
  if (init instanceof URLSearchParams) return new URLSearchParams(init);
  if (typeof init === 'string' || Array.isArray(init)) return new URLSearchParams(init);

  const params = new URLSearchParams();
  Object.entries(init).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    params.set(key, String(value));
  });
  return params;
}

function readBrowserLocation() {
  if (typeof window === 'undefined') {
    return { hash: '', search: '' };
  }

  return {
    hash: window.location.hash,
    search: window.location.search,
  };
}

function notifyLocationChange() {
  if (typeof window === 'undefined') return;

  window.setTimeout(() => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  }, 0);
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}

export function useLocation(): LocationShape {
  const pathname = usePathname() || '/';
  const [browserLocation, setBrowserLocation] = useState(readBrowserLocation);

  useEffect(() => {
    const syncLocation = () => {
      setBrowserLocation(readBrowserLocation());
    };

    syncLocation();
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    window.addEventListener(LOCATION_CHANGE_EVENT, syncLocation);

    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
      window.removeEventListener(LOCATION_CHANGE_EVENT, syncLocation);
    };
  }, [pathname]);

  return {
    hash: browserLocation.hash,
    key: `${pathname}${browserLocation.search}${browserLocation.hash}`,
    pathname,
    search: browserLocation.search,
    state: null,
  };
}

export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (to: number | string, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        if (to === -1) {
          router.back();
          return;
        }

        if (typeof window !== 'undefined') {
          window.history.go(to);
        }
        return;
      }

      if (options?.replace) {
        router.replace(to);
        notifyLocationChange();
        return;
      }

      router.push(to);
      notifyLocationChange();
    },
    [router]
  );
}

export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string>>() {
  return useNextParams() as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (nextInit: SearchParamsInit, navigateOptions?: NavigateOptions) => void,
] {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search.startsWith('?') ? location.search.slice(1) : location.search),
    [location.search]
  );

  const setSearchParams = useCallback(
    (nextInit: SearchParamsInit, navigateOptions?: NavigateOptions) => {
      const nextParams = createSearchParams(nextInit);
      const nextSearch = nextParams.toString();
      navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, navigateOptions);
    },
    [location.pathname, navigate]
  );

  return [searchParams, setSearchParams];
}

type CompatLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<NextLinkProps, 'href'> & {
    to: string;
  };

export const Link = forwardRef<HTMLAnchorElement, CompatLinkProps>(function CompatLink(
  { to, children, ...rest },
  ref
) {
  return (
    <NextLink href={to} ref={ref} {...rest}>
      {children}
    </NextLink>
  );
});
