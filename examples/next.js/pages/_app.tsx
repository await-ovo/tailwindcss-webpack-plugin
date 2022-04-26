// eslint-disable-next-line filenames/match-exported
import '../styles/globals.css';
import '_tailwind-devtools_.js';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
