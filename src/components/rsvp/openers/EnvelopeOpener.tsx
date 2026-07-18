import React, { useState } from "react";
import { ThemeType } from "./ClassicButtonOpener";

interface EnvelopeOpenerProps {
  isOpened: boolean;
  setIsOpened: (opened: boolean) => void;
  brideName: string;
  groomName: string;
  theme: ThemeType;
  isPlaying: boolean;
  toggleMusic: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  onTriggerOpen?: (e?: any) => void;
}

export const EnvelopeOpener: React.FC<EnvelopeOpenerProps> = ({
  isOpened,
  setIsOpened,
  brideName,
  groomName,
  theme,
  isPlaying,
  toggleMusic,
  audioRef,
  onTriggerOpen,
}) => {
  const [envelopeState, setEnvelopeState] = useState<'closed' | 'opening' | 'fadeout' | 'done'>(
    isOpened ? 'done' : 'closed'
  );

  const handleOpenInvitation = (e: React.MouseEvent) => {
    if (envelopeState !== 'closed') return;
    
    // Play audio/music
    if (!isPlaying) toggleMusic();
    if (audioRef?.current) {
      audioRef.current.play().catch(console.error);
    }
    
    if (onTriggerOpen) {
      onTriggerOpen(e);
    }
    
    setEnvelopeState('opening');
    
    // Sequence timing:
    // 0.0s: Wax seal fades out, top flap folds up (takes 0.7s)
    // 0.7s: Card slides up and out (takes 0.9s)
    // 1.8s: Overlay starts fading out (takes 0.6s)
    // 2.4s: Overlay fully hidden -> unmount
    setTimeout(() => {
      setEnvelopeState('fadeout');
      setTimeout(() => {
        setEnvelopeState('done');
        setIsOpened(true);
      }, 600);
    }, 1800);
  };

  if (isOpened || envelopeState === 'done') return null;

  // Configuration settings based on the selected theme
  const config = {
    classic: {
      backdropBg: "bg-[#0f0a06]/75",
      envelopeBg: "#1a120b",
      flapBorderTop: "#4a3221",
      frontBorderLeftRight: "#2e1d14",
      frontBorderBottom: "#3a271b",
      waxSealColor: "radial-gradient(circle, #e6c280 0%, #b8860b 100%)",
      waxSealBorder: "#9c7323",
      waxSealIcon: "❦",
      cardBg: "#fcfaf5",
      cardBorderColor: "#c5a059",
      cardFont: "Parisienne, cursive",
      cardTitleColor: "#a68244",
      cardNamesColor: "#4a3211",
      cardNamesSize: "text-xl sm:text-2xl",
      cardDividerColor: "#c5a059",
      envelopePulseColor: "#e6c280",
    },
    redrose: {
      backdropBg: "bg-[#240e11]/75",
      envelopeBg: "#3d0c11",
      flapBorderTop: "#5c1219",
      frontBorderLeftRight: "#4a0d14",
      frontBorderBottom: "#520e16",
      waxSealColor: "radial-gradient(circle, #f87171 0%, #b91c1c 100%)",
      waxSealBorder: "#991b1b",
      waxSealIcon: "❤",
      cardBg: "#fcf9f9",
      cardBorderColor: "#B91C1C",
      cardFont: "'Great Vibes', cursive",
      cardTitleColor: "#c59b27",
      cardNamesColor: "#7f1d1d",
      cardNamesSize: "text-2xl sm:text-3xl",
      cardDividerColor: "#c59b27",
      envelopePulseColor: "#f87171",
    },
    redroseclassic: {
      backdropBg: "bg-[#240e11]/75",
      envelopeBg: "#3d0c11",
      flapBorderTop: "#5c1219",
      frontBorderLeftRight: "#4a0d14",
      frontBorderBottom: "#520e16",
      waxSealColor: "radial-gradient(circle, #f87171 0%, #b91c1c 100%)",
      waxSealBorder: "#991b1b",
      waxSealIcon: "❤",
      cardBg: "#fcf9f9",
      cardBorderColor: "#B91C1C",
      cardFont: "'Great Vibes', cursive",
      cardTitleColor: "#c59b27",
      cardNamesColor: "#7f1d1d",
      cardNamesSize: "text-2xl sm:text-3xl",
      cardDividerColor: "#c59b27",
      envelopePulseColor: "#f87171",
    },
    lavender: {
      backdropBg: "bg-[#181124]/75",
      envelopeBg: "#31224d",
      flapBorderTop: "#4c337a",
      frontBorderLeftRight: "#3a275c",
      frontBorderBottom: "#412b69",
      waxSealColor: "radial-gradient(circle, #c084fc 0%, #7c3aed 100%)",
      waxSealBorder: "#6d28d9",
      waxSealIcon: "❦",
      cardBg: "#f7f3fc",
      cardBorderColor: "#9b6de0",
      cardFont: "'Great Vibes', cursive",
      cardTitleColor: "#9B6BCB",
      cardNamesColor: "#3b226e",
      cardNamesSize: "text-2xl sm:text-3xl",
      cardDividerColor: "#b78dda",
      envelopePulseColor: "#c084fc",
    },
    sage: {
      backdropBg: "bg-[#111c15]/75",
      envelopeBg: "#233a2d",
      flapBorderTop: "#345743",
      frontBorderLeftRight: "#294535",
      frontBorderBottom: "#2e4e3b",
      waxSealColor: "radial-gradient(circle, #a7f3d0 0%, #047857 100%)",
      waxSealBorder: "#065f46",
      waxSealIcon: "❦",
      cardBg: "#f3f6f4",
      cardBorderColor: "#779B88",
      cardFont: "'Great Vibes', cursive",
      cardTitleColor: "#678970",
      cardNamesColor: "#132f1c",
      cardNamesSize: "text-2xl sm:text-3xl",
      cardDividerColor: "#94b19e",
      envelopePulseColor: "#a7f3d0",
    },
  }[theme] || {
    // fallback to classic
    backdropBg: "bg-[#0f0a06]/75",
    envelopeBg: "#1a120b",
    flapBorderTop: "#4a3221",
    frontBorderLeftRight: "#2e1d14",
    frontBorderBottom: "#3a271b",
    waxSealColor: "radial-gradient(circle, #e6c280 0%, #b8860b 100%)",
    waxSealBorder: "#9c7323",
    waxSealIcon: "❦",
    cardBg: "#fcfaf5",
    cardBorderColor: "#c5a059",
    cardFont: "Parisienne, cursive",
    cardTitleColor: "#a68244",
    cardNamesColor: "#4a3211",
    cardNamesSize: "text-xl sm:text-2xl",
    cardDividerColor: "#c5a059",
    envelopePulseColor: "#e6c280",
  };

  return (
    <div className={`fixed inset-0 z-50 ${config.backdropBg} backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-opacity duration-500 ${envelopeState === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .envelope-wrapper {
          position: relative;
          width: 320px;
          height: 220px;
          perspective: 1000px;
          transition: transform 0.3s ease;
        }
        @media (max-width: 380px) {
          .envelope-wrapper {
            transform: scale(0.85);
          }
        }
        .tap-text {
          color: ${config.cardTitleColor};
          margin-bottom: 30px;
          font-family: ${theme === "classic" ? "'Parisienne', cursive" : "'Great Vibes', cursive"};
          font-size: 28px;
          letter-spacing: 2px;
          animation: envelopePulse 2s infinite;
          cursor: pointer;
          text-shadow: 0 0 10px rgba(166, 130, 68, 0.4);
        }
        @keyframes envelopePulse {
          0% { opacity: 0.6; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.6; transform: scale(0.98); }
        }
        .envelope {
          position: relative;
          width: 320px;
          height: 220px;
          background-color: ${config.envelopeBg};
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5);
          transform-style: preserve-3d;
        }
        .flap {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-top: 125px solid ${config.flapBorderTop};
          transform-origin: top;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.7s;
          z-index: 4;
        }
        .card-inside {
          position: absolute;
          bottom: 15px;
          left: 15px;
          width: 290px;
          height: 195px;
          background-color: ${config.cardBg};
          border: 2px double ${config.cardBorderColor};
          border-radius: 4px;
          z-index: 2;
          transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px 15px;
          box-sizing: border-box;
        }
        .envelope-front {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 0;
          border-left: 160px solid ${config.frontBorderLeftRight};
          border-right: 160px solid ${config.frontBorderLeftRight};
          border-bottom: 125px solid ${config.frontBorderBottom};
          z-index: 3;
        }
        .wax-seal {
          position: absolute;
          top: 125px;
          left: 160px;
          width: 44px;
          height: 44px;
          margin-left: -22px;
          margin-top: -22px;
          background: ${config.waxSealColor};
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4);
          border: 1px solid ${config.waxSealBorder};
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }
        .wax-seal::after {
          content: "${config.waxSealIcon}";
          color: ${theme === "redrose" || theme === "redroseclassic" ? "#5e0f14" : theme === "lavender" ? "#2e124d" : theme === "sage" ? "#064e3b" : "#5c3c00"};
          font-size: 20px;
          line-height: 1;
        }
        /* Animation triggers */
        .envelope-wrapper.open-anim .flap {
          transform: rotateX(180deg);
          z-index: 1;
        }
        .envelope-wrapper.open-anim .card-inside {
          transform: translateY(-145px);
        }
        .envelope-wrapper.open-anim .wax-seal {
          transform: scale(0);
          opacity: 0;
        }
      `}} />
      
      <div 
        className="tap-text" 
        onClick={handleOpenInvitation}
      >
        {envelopeState === 'closed' ? 'Tap to Open Invitation' : 'Opening...'}
      </div>

      <div 
        className={`envelope-wrapper ${envelopeState !== 'closed' ? 'open-anim' : ''}`}
        onClick={handleOpenInvitation}
      >
        <div className="envelope">
          <div className="flap"></div>
          
          <div className="card-inside">
            <div className={`text-[10px] tracking-[0.2em] uppercase font-mono mb-2`} style={{ color: config.cardTitleColor }}>
              {theme === "classic" ? "Save The Date" : "Wedding Invitation"}
            </div>
            
            <div 
              className={`${config.cardNamesSize} font-medium leading-normal mb-2 px-1 max-w-full line-clamp-2`}
              style={{ fontFamily: config.cardFont, color: config.cardNamesColor }}
            >
              {brideName} {groomName ? `& ${groomName}` : ''}
            </div>
            
            <div className="w-10 h-[1px] my-2" style={{ backgroundColor: config.cardDividerColor }}></div>
            
            <div className={`text-[9px] tracking-widest uppercase font-mono mt-1`} style={{ color: config.cardTitleColor }}>
              You are lovingly invited
            </div>
          </div>

          <div className="envelope-front"></div>
          <div className="wax-seal"></div>
        </div>
      </div>
    </div>
  );
};
