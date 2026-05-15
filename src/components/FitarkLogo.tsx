interface Props {
  size?: number;
  className?: string;
}

export default function FitarkLogo({ size = 36, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="204 44 272 272"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Navy upper-left half */}
      <path d="M 431.92,88.08 A 130,130 0 0,0 248.08,271.92 Z" fill="#0f172a" />
      {/* Orange lower-right half */}
      <path d="M 431.92,88.08 A 130,130 0 0,1 248.08,271.92 Z" fill="#f97316" />
      {/* F lettermark */}
      <rect x="284" y="112" width="16" height="130" rx="5" fill="white" />
      <rect x="284" y="112" width="82" height="16" rx="5" fill="white" />
      <rect x="284" y="162" width="60" height="15" rx="5" fill="white" />
      {/* Lightning bolt */}
      <polygon points="400,112 378,174 400,174 368,250 442,162 418,162 446,112" fill="white" />
      {/* White ring so the logo separates from any dark background */}
      <circle cx="340" cy="180" r="130" fill="none" stroke="white" strokeWidth="12" />
    </svg>
  );
}
