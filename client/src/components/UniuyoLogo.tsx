export function UniuyoLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 rounded-full bg-white p-0.5 shadow-md ${className}`}>
      <svg viewBox="0 0 200 200" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Green Border */}
        <circle cx="100" cy="100" r="97" stroke="#15803D" strokeWidth="4" fill="#FFFFFF" />

        {/* Outer Red Ring */}
        <circle cx="100" cy="100" r="92" stroke="#991B1B" strokeWidth="3" fill="#FFFFFF" />

        {/* Top Text Arc: UNIVERSITY OF UYO */}
        <path id="textArcTop" d="M 25,100 A 75,75 0 1,1 175,100" fill="none" />
        <text fill="#991B1B" fontSize="17" fontWeight="800" letterSpacing="2.5" textAnchor="middle">
          <textPath href="#textArcTop" startOffset="50%">
            UNIVERSITY OF UYO
          </textPath>
        </text>

        {/* Bottom Text Arc: NIGERIA */}
        <path id="textArcBottom" d="M 170,105 A 72,72 0 0,1 30,105" fill="none" />
        <text fill="#FFFFFF" fontSize="16" fontWeight="800" letterSpacing="3" textAnchor="middle">
          <textPath href="#textArcBottom" startOffset="50%">
            NIGERIA
          </textPath>
        </text>

        {/* Bottom Red Banner Fill */}
        <path
          d="M 15 110 C 25 145 50 185 100 185 C 150 185 175 145 185 110 C 145 145 55 145 15 110 Z"
          fill="#991B1B"
        />

        {/* Torch / Funnel / Flare Emblem */}
        <path d="M 75 42 L 125 42 C 115 60 108 72 100 85 C 92 72 85 60 75 42 Z" fill="#991B1B" />
        
        {/* Yellow Stalks */}
        <path d="M 85 40 Q 82 55 93 70" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" />
        <path d="M 115 40 Q 118 55 107 70" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" />
        <path d="M 100 48 V 72" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />

        {/* Open Book */}
        <path
          d="M 50 102 C 70 95 90 98 100 105 C 110 98 130 95 150 102 L 152 125 C 130 118 110 120 100 127 C 90 120 70 118 48 125 Z"
          fill="#FFFFFF"
          stroke="#991B1B"
          strokeWidth="3"
        />
        <path d="M 100 105 V 127" stroke="#15803D" strokeWidth="3" />
        <path d="M 52 125 C 70 119 90 121 100 127 C 110 121 130 119 148 125" fill="#15803D" />

        {/* Ribbon for Motto */}
        <path
          d="M 55 138 Q 100 148 145 138 L 140 148 Q 100 158 60 148 Z"
          fill="#991B1B"
        />
        <text x="100" y="146" fill="#FFFFFF" fontSize="7.5" fontWeight="700" textAnchor="middle">
          UNITY LEARNING & SERVICE
        </text>
      </svg>
    </div>
  );
}
