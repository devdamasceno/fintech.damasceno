import styles from "./Brand.module.css";

export default function Brand() {
  return (
    <span className={styles.brand}>
      <span className={styles.mark} aria-hidden="true">
        <svg fill="none" viewBox="0 0 40 40">
          <path
            d="M11 8h8.5C27.5 8 33 12.8 33 20s-5.5 12-13.5 12H11V8Z"
            stroke="currentColor"
            strokeWidth="3.2"
          />
          <path
            d="M17 14v12h3c4.3 0 7-2.2 7-6s-2.7-6-7-6h-3Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span>
        <strong>Damasceno</strong>
        <small>Consórcios</small>
      </span>
    </span>
  );
}
