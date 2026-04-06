import React from 'react';

const FlyingSofa = ({ className = '' }) => {
  return (
    <div className={className} aria-hidden="true">
      <style>{`
        @keyframes hover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes flap-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes flap-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(25deg); }
        }

        .casa-flying-sofa__float {
          animation: hover 3.6s ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        .casa-flying-sofa__wing--left,
        .casa-flying-sofa__wing--right {
          transform-box: fill-box;
          will-change: transform;
        }
        .casa-flying-sofa__wing--left {
          transform-origin: 100% 55%;
          animation: flap-left 0.9s ease-in-out infinite;
        }
        .casa-flying-sofa__wing--right {
          transform-origin: 0% 55%;
          animation: flap-right 0.9s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 520 260"
        className="w-full h-auto"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="casa-flying-sofa__float">
          {/* Wings */}
          <g className="casa-flying-sofa__wing--left" opacity="0.92">
            <path
              d="M120 136 C78 120, 58 94, 62 72 C66 50, 92 44, 120 62 C146 79, 166 98, 182 122 C160 132, 140 138, 120 136 Z"
              fill="#F5F5F7"
            />
            <path
              d="M128 124 C102 112, 90 96, 92 82 C94 68, 110 64, 128 76 C146 88, 160 100, 172 116"
              fill="none"
              stroke="rgba(18,18,18,0.18)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          <g className="casa-flying-sofa__wing--right" opacity="0.92">
            <path
              d="M400 136 C442 120, 462 94, 458 72 C454 50, 428 44, 400 62 C374 79, 354 98, 338 122 C360 132, 380 138, 400 136 Z"
              fill="#F5F5F7"
            />
            <path
              d="M392 124 C418 112, 430 96, 428 82 C426 68, 410 64, 392 76 C374 88, 360 100, 348 116"
              fill="none"
              stroke="rgba(18,18,18,0.18)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Sofa */}
          <g opacity="0.98">
            <path
              d="M160 74 C160 58, 176 46, 194 46 H326 C344 46, 360 58, 360 74 V120 H160 V74 Z"
              fill="#F5F5F7"
              stroke="rgba(18,18,18,0.18)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <path
              d="M138 120 H382 C396 120, 408 132, 408 146 V160 C408 174, 396 186, 382 186 H138 C124 186, 112 174, 112 160 V146 C112 132, 124 120, 138 120 Z"
              fill="#F5F5F7"
              stroke="rgba(18,18,18,0.18)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <ellipse cx="260" cy="208" rx="130" ry="12" fill="rgba(18,18,18,0.12)" />

            <path d="M148 186 V204" stroke="rgba(18,18,18,0.22)" strokeWidth="6" strokeLinecap="round" />
            <path d="M372 186 V204" stroke="rgba(18,18,18,0.22)" strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default FlyingSofa;

