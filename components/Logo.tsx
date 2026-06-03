export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wheel outer ring */}
      <circle cx="18" cy="20" r="13" stroke="white" strokeWidth="2.5" fill="none" />
      {/* Wheel inner hub */}
      <circle cx="18" cy="20" r="3" fill="white" />
      {/* Spokes */}
      <line x1="18" y1="7" x2="18" y2="17" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="23" x2="18" y2="33" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5" y1="20" x2="15" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="21" y1="20" x2="31" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9.1" y1="11.1" x2="15.9" y2="17.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20.1" y1="22.1" x2="26.9" y2="28.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="26.9" y1="11.1" x2="20.1" y2="17.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="15.9" y1="22.1" x2="9.1" y2="28.9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      {/* Hook */}
      <path d="M18 7 C18 4 20 2 23 2 C26 2 28 4 28 7 C28 10 26 11 24 11"
            stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Hook tip */}
      <path d="M24 11 C21 11 20 13 22 14.5"
            stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Hook barb */}
      <path d="M22 14.5 L20 13"
            stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
