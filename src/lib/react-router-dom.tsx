'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
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

function readBrowserHash() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.hash;
}

function preservePreviewQuery(
  to: string,
  currentSearchParams?: Pick<URLSearchParams, 'get'> | null
) {
  if (currentSearchParams?.get('preview') !== '1') {
    return to;
  }

  const nextUrl = new URL(to, 'http://local.preview');
  if (!nextUrl.searchParams.has('preview')) {
    nextUrl.searchParams.set('preview', '1');
  }

  const role = currentSearchParams.get('role');
  if (role && !nextUrl.searchParams.has('role')) {
    nextUrl.searchParams.set('role', role);
  }

  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
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
  const nextSearchParams = useNextSearchParams();
  const [hash, setHash] = useState('');

  const search = useMemo(() => {
    const serialized = nextSearchParams?.toString() || '';
    return serialized ? `?${serialized}` : '';
  }, [nextSearchParams]);

  useEffect(() => {
    const syncHash = () => {
      setHash(readBrowserHash());
    };

    syncHash();
    window.addEventListener('popstate', syncHash);
    window.addEventListener('hashchange', syncHash);

    return () => {
      window.removeEventListener('popstate', syncHash);
      window.removeEventListener('hashchange', syncHash);
    };
  }, []);

  return {
    hash,
    key: `${pathname}${search}${hash}`,
    pathname,
    search,
    state: null,
  };
}

export function useNavigate() {
  const router = useRouter();
  const nextSearchParams = useNextSearchParams();

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
        router.replace(preservePreviewQuery(to, nextSearchParams));
        return;
      }

      router.push(preservePreviewQuery(to, nextSearchParams));
    },
    [nextSearchParams, router]
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
  const nextSearchParams = useNextSearchParams();

  return (
    <NextLink href={preservePreviewQuery(to, nextSearchParams)} ref={ref} {...rest}>
      {children}
    </NextLink>
  );
});
