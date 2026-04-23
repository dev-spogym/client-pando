import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type AnchorHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { useInitialUrl } from '@/lib/route-state';

type NavigateOptions = { replace?: boolean };
type SearchParamsInit =
  | string
  | string[][]
  | Record<string, string | number | boolean | null | undefined>
  | URLSearchParams;

type RouteProps = {
  path?: string;
  element?: ReactNode;
  children?: ReactNode;
};

type RouteConfig = {
  path?: string;
  element?: ReactNode;
  children: RouteConfig[];
};

type Match = {
  params: Record<string, string>;
  route: RouteConfig;
};

type LocationShape = {
  hash: string;
  key: string;
  pathname: string;
  search: string;
  state: null;
};

const OutletContext = createContext<ReactNode>(null);
const ParamsContext = createContext<Record<string, string>>({});

function getCurrentPath(asPath: string) {
  const [pathWithQuery = '/'] = asPath.split('#');
  const [pathname = '/', query = ''] = pathWithQuery.split('?');
  return {
    pathname: pathname || '/',
    search: query ? `?${query}` : '',
  };
}

function getResolvedAsPath(routerAsPath: string | undefined, initialUrl: string) {
  if (routerAsPath && routerAsPath !== '/[[...slug]]') {
    return routerAsPath;
  }

  return initialUrl || '/';
}

function normalizePath(pathname: string) {
  if (!pathname) return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
}

function routeScore(path?: string) {
  if (!path) return -1;
  if (path === '*') return -999;

  return path
    .split('/')
    .filter(Boolean)
    .reduce((score, segment) => {
      if (segment === '*') return score - 100;
      if (segment.startsWith(':')) return score + 10;
      return score + 100;
    }, 0);
}

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

function matchPath(path: string, pathname: string) {
  if (path === '*') return {};

  const normalizedPattern = normalizePath(path);
  const normalizedPathname = normalizePath(pathname);

  const patternSegments = normalizedPattern.split('/').filter(Boolean);
  const pathnameSegments = normalizedPathname.split('/').filter(Boolean);

  if (patternSegments.length !== pathnameSegments.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i += 1) {
    const patternSegment = patternSegments[i];
    const pathnameSegment = pathnameSegments[i];

    if (patternSegment.startsWith(':')) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathnameSegment);
      continue;
    }

    if (patternSegment !== pathnameSegment) {
      return null;
    }
  }

  return params;
}

function createRoutesFromChildren(children: ReactNode): RouteConfig[] {
  const routes: RouteConfig[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<RouteProps>(child)) return;
    routes.push({
      path: child.props.path,
      element: child.props.element,
      children: createRoutesFromChildren(child.props.children),
    });
  });

  return routes;
}

function findMatches(routes: RouteConfig[], pathname: string): Match[] | null {
  const directRoutes = routes
    .filter((route) => route.path && route.path !== '*')
    .sort((a, b) => routeScore(b.path) - routeScore(a.path));

  for (const route of directRoutes) {
    const params = matchPath(route.path!, pathname);
    if (params) {
      return [{ route, params }];
    }
  }

  for (const route of routes.filter((item) => !item.path)) {
    const childMatches = findMatches(route.children, pathname);
    if (childMatches) {
      return [{ route, params: {} }, ...childMatches];
    }
  }

  const wildcard = routes.find((route) => route.path === '*');
  if (wildcard) {
    return [{ route: wildcard, params: {} }];
  }

  return null;
}

function renderMatches(matches: Match[]) {
  const params = matches.reduce<Record<string, string>>(
    (acc, match) => ({ ...acc, ...match.params }),
    {}
  );

  const rendered = matches.reduceRight<ReactNode>((outlet, match) => {
    if (!match.route.element) return outlet;
    return <OutletContext.Provider value={outlet}>{match.route.element}</OutletContext.Provider>;
  }, null);

  return <ParamsContext.Provider value={params}>{rendered}</ParamsContext.Provider>;
}

export function BrowserRouter({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function Routes({ children }: PropsWithChildren) {
  const router = useRouter();
  const initialUrl = useInitialUrl();
  const { pathname } = getCurrentPath(getResolvedAsPath(router.asPath, initialUrl));
  const routes = useMemo(() => createRoutesFromChildren(children), [children]);
  const matches = useMemo(() => findMatches(routes, pathname), [pathname, routes]);

  return matches ? <>{renderMatches(matches)}</> : null;
}

export function Route(_props: RouteProps) {
  return null;
}

export function Outlet() {
  return <>{useContext(OutletContext)}</>;
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}

export function useLocation(): LocationShape {
  const router = useRouter();
  const initialUrl = useInitialUrl();
  const asPath = getResolvedAsPath(router.asPath, initialUrl);
  const { pathname, search } = getCurrentPath(asPath);
  const hash = asPath.includes('#') ? `#${asPath.split('#')[1]}` : '';

  return {
    hash,
    key: asPath || pathname,
    pathname,
    search,
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
        void router.replace(to);
        return;
      }

      void router.push(to);
    },
    [router]
  );
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useContext(ParamsContext) as T;
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
