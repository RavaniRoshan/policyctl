interface PolicyctlMarkProps {
  className?: string;
  size?: number;
}

/**
 * policyctl brand mark — stylized "P" with shield + checkmark.
 * Uses currentColor so it inherits text color from parent.
 */
export function PolicyctlMark({ className, size = 32 }: PolicyctlMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* "P" letterform */}
      <path
        d="M96 64 H280 C356 64 416 124 416 200 C416 276 356 336 280 336 H176 V448 H96 Z M176 144 V256 H272 C304 256 328 232 328 200 C328 168 304 144 272 144 Z"
        fill="currentColor"
      />
      {/* Shield + checkmark badge, inset into the P bowl */}
      <g transform="translate(256, 196)">
        <path
          d="M0 24 L80 24 L80 76 C80 110 60 138 36 152 C12 138 -8 110 -8 76 L-8 24 Z"
          fill="currentColor"
        />
        <path
          d="M16 56 L36 76 L60 44"
          stroke="white"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
