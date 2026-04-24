export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="260"
      height="43"
      viewBox="0 0 520 86"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="43" cy="43" r="38" stroke="#8B2635" strokeWidth="1.5"/>
      <circle cx="43" cy="43" r="32" stroke="#C4A44A" strokeWidth="0.65" strokeDasharray="2.5 4"/>
      <line x1="43" y1="6" x2="43" y2="13.5" stroke="#8B2635" strokeWidth="2.25"/>
      <line x1="43" y1="72.5" x2="43" y2="80" stroke="#8B2635" strokeWidth="1.5"/>
      <line x1="6" y1="43" x2="13.5" y2="43" stroke="#8B2635" strokeWidth="1.5"/>
      <line x1="72.5" y1="43" x2="80" y2="43" stroke="#8B2635" strokeWidth="1.5"/>
      <line x1="16.1" y1="16.1" x2="20.8" y2="20.8" stroke="#C4A44A" strokeWidth="0.85"/>
      <line x1="69.9" y1="16.1" x2="65.2" y2="20.8" stroke="#C4A44A" strokeWidth="0.85"/>
      <line x1="16.1" y1="69.9" x2="20.8" y2="65.2" stroke="#C4A44A" strokeWidth="0.85"/>
      <line x1="69.9" y1="69.9" x2="65.2" y2="65.2" stroke="#C4A44A" strokeWidth="0.85"/>
      <text x="43" y="5.5" textAnchor="middle" fill="#8B2635" fontFamily="Georgia,serif" fontSize="7" fontWeight="700">N</text>
      <polygon points="43,12 39,43 43,36.5 47,43" fill="#8B2635"/>
      <polygon points="43,74 39,43 43,49.5 47,43" fill="#cdc2a0"/>
      <circle cx="43" cy="43" r="5" fill="#8B2635"/>
      <circle cx="43" cy="43" r="2.2" fill="#C4A44A"/>
      <line x1="96" y1="14" x2="96" y2="72" stroke="#C4A44A" strokeWidth="0.8" opacity="0.55"/>
      <text x="116" y="35" fill="#C4A44A" fontFamily="Georgia,serif" fontSize="12" fontWeight="400" letterSpacing="7">LIFE</text>
      <text x="113" y="64" fill="#8B2635" fontFamily="Georgia,serif" fontSize="31" fontWeight="700" letterSpacing="0.5">Sentinel</text>
    </svg>
  );
}
