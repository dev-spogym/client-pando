import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/index.css';

export default function NextApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>스포짐 - 회원 전용 앱</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="스포짐 회원 전용 앱. QR 출석체크, 수업 예약, 이용권 관리를 한 곳에서." />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="스포짐" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="스포짐 - 회원 전용 앱" />
        <meta property="og:description" content="QR 출석체크, 수업 예약, 이용권 관리를 한 곳에서." />
        <meta property="og:image" content="/icons/icon-512x512.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
