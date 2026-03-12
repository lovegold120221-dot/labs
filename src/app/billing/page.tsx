import type { Metadata } from "next";
import styles from "./billing.module.css";

export const metadata: Metadata = {
  title: "Service Unavailable | NVIDIA",
  description: "Temporary server availability issue.",
};

export default function BillingPage() {
  const loginLink =
    "https://login.nvgs.nvidia.com/v1/login/identifier?preferred_nvidia=true&context=Initial&theme=Bright&locale=en-US&prompt=default&key=eyJhbGciOiJIUzI1NiJ9.eyJzZSI6InY0b28iLCJ0b2tlbklkIjoiMTQ4MTQ2MzI1MDc3NjY3ODQwMCIsIm90IjoiMTQ4MTQ2MzI1MDc5NzY0OTkyMCIsImV4cCI6MTc3MzM2NTE2MywiaWF0IjoxNzczMjc4NzYzLCJqdGkiOiI1YzA1MWIzOS0xMjZiLTRjMzAtOWYxNy00YzRhZTE0YzYwMDgifQ.OptltieZU78KyWhng-s8fNZbTA87HITqC7fUFfjQgEg&client_id=310670214980174257";

  return (
    <div className={styles.billingPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Service Unreachable</h1>
        <p className={styles.text}>
          We are unable to connect to the service. Please verify your internet
          connection or check your billing account status.
        </p>

        <a href={loginLink} className={styles.actionLink}>
          Details Here
        </a>

        {/* Professional error logging for developer console */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.error("%cNVIDIA Cloud Services: %cConnection Refused (503)", "color: #76B900; font-weight: bold;", "");
            `,
          }}
        />
      </div>
    </div>
  );
}
