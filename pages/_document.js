import { Html, Head, Main, NextScript } from "next/document";

import { fontSans, fontMono } from "lib/fonts";

export default function Document() {
  return (
    <Html lang="pt-BR" className={`${fontSans.variable} ${fontMono.variable}`}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
