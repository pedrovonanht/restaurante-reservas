import { Html, Head, Main, NextScript } from "next/document";

import { fontSans, fontDisplay } from "lib/fonts";

export default function Document() {
  return (
    <Html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
