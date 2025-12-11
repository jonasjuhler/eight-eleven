interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Map Pin with Soundwave */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Map Pin Shape */}
        <path 
          d="M20 3C15.0294 3 11 7.02944 11 12C11 18.5 20 30 20 30C20 30 29 18.5 29 12C29 7.02944 24.9706 3 20 3Z" 
          fill="#dc2626"
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Soundwave Bars Inside Pin */}
        <g transform="translate(20, 12)">
          {/* Center bar */}
          <rect x="-1" y="-4" width="2" height="8" rx="1" fill="white"/>
          
          {/* Left bars */}
          <rect x="-4" y="-2.5" width="1.5" height="5" rx="0.75" fill="white" opacity="0.8"/>
          <rect x="-6.5" y="-1.5" width="1.5" height="3" rx="0.75" fill="white" opacity="0.6"/>
          
          {/* Right bars */}
          <rect x="2.5" y="-2.5" width="1.5" height="5" rx="0.75" fill="white" opacity="0.8"/>
          <rect x="5" y="-1.5" width="1.5" height="3" rx="0.75" fill="white" opacity="0.6"/>
        </g>
      </svg>
      
      {/* Logo Text */}
      {showText && (
        <span className="tracking-tight text-gray-900">8eleven</span>
      )}
    </div>
  );
}