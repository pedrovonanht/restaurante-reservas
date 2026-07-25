import "./styles/globals.css";

import { AuthProvider } from "context/auth-context";
import { TenantProvider } from "context/tenant-context";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <TenantProvider>
        <Component {...pageProps} />
      </TenantProvider>
    </AuthProvider>
  );
}
