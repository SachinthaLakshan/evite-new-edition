import React from "react";

export type ThemeType = 'classic' | 'lavender' | 'sage' | 'redrose';

interface ClassicButtonOpenerProps {
  isOpened: boolean;
  onOpen: (e: React.MouseEvent<any>) => void;
  brideName: string;
  groomName: string;
  theme: ThemeType;
  isPlaying: boolean;
  toggleMusic: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const ClassicButtonOpener: React.FC<ClassicButtonOpenerProps> = ({
  isOpened,
  onOpen,
  brideName,
  groomName,
  theme,
  isPlaying,
  toggleMusic,
  audioRef,
}) => {
  const handleOpenClick = (e: React.MouseEvent<any>) => {
    if (!isPlaying) toggleMusic();
    if (audioRef?.current) {
      audioRef.current.play().catch(console.error);
    }
    onOpen(e);
  };

  if (isOpened) return null;

  if (theme === "classic") {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f0a06]/75 backdrop-blur-sm flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: `
          .animated-open-btn {
            position: relative;
            padding: 10px 30px;  
            border: none;
            background: none;
            cursor: pointer;
            font-family: 'Parisienne', cursive;
            font-weight: 900;
            font-size: 34px;  
            color: hsla(210, 50%, 85%, 1);
            background-image: linear-gradient(to right, #FF512F 0%, #F09819 51%, #FF512F 100%);
            border: 3px solid #fff;
            box-shadow: hsla(210, 40%, 52%, .94) 2px 2px 22px;
            border-radius: 12px; 
            z-index: 0;  
            overflow: hidden;   
          }
          .animated-open-btn:focus {
            outline-color: transparent;
            box-shadow: #e4752b;
          }
          .animated-open-btn .right::after, .animated-open-btn::after {
            content: "";
            display: block;
            position: absolute;
            white-space: nowrap;
            padding: 60px 60px;
            pointer-events: none;
          }
          .animated-open-btn::after {
            font-weight: 200;
            top: -30px;
            left: -20px;
          } 
          .animated-open-btn .right, .animated-open-btn .left {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
          }
          .animated-open-btn .right {
            left: 66%;
          }
          .animated-open-btn .left {
            right: 66%;
          }
          .animated-open-btn .right::after {
            top: -30px;
            left: calc(-66% - 20px);
            background-color: #141218;
            color: transparent;
            transition: transform .4s ease-out;
            transform: translate(0, -90%) rotate(0deg);
          }
          .animated-open-btn:hover .right::after {
            transform: translate(0, -47%) rotate(0deg);
          }
          .animated-open-btn .right:hover::after {
            transform: translate(0, -50%) rotate(-7deg);
          }
          .animated-open-btn .left:hover ~ .right::after {
            transform: translate(0, -50%) rotate(7deg);
          }
          .animated-open-btn::before {
            content: '';
            pointer-events: none;
            opacity: .6;
            background:
              radial-gradient(circle at 20% 35%,  transparent 0,  transparent 2px, hsla(210, 50%, 85%, 1) 3px, hsla(210, 50%, 85%, 1) 4px, transparent 4px),
              radial-gradient(circle at 75% 44%, transparent 0,  transparent 2px, hsla(210, 50%, 85%, 1) 3px, hsla(210, 50%, 85%, 1) 4px, transparent 4px),
              radial-gradient(circle at 46% 52%, transparent 0, transparent 4px, hsla(210, 50%, 85%, 1) 5px, hsla(210, 50%, 85%, 1) 6px, transparent 6px);
            width: 100%;
            height: 300%;
            top: 0;
            left: 0;
            position: absolute;
            animation: btn-bubbles 5s linear infinite both;
          }
          @keyframes btn-bubbles {
            from {
              transform: translate(0, 0);
            }
            to {
              transform: translate(0, -66.666%);
            }
          }
        `}} />
        <button
          type="button"
          data-type="emoji"
          onClick={handleOpenClick}
          className="animated-open-btn"
        >
          Open Invitation
          <div className="left"></div>
          <div className="right"></div>
        </button>
      </div>
    );
  }

  if (theme === "redrose") {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f0a06]/75 backdrop-blur-md flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: `
          .animated-open-btn {
            position: relative;
            padding: 14px 38px;  
            border: none;
            background: none;
            cursor: pointer;
            font-family: 'Great Vibes', cursive;
            font-size: 34px;  
            color: #ffffff;
            background-image: linear-gradient(135deg, #B91C1C 0%, #7F1D1D 51%, #B91C1C 100%);
            border: 2px solid #ffffff;
            box-shadow: 0 8px 24px rgba(185, 28, 28, 0.35);
            border-radius: 99px; 
            z-index: 1;  
            overflow: hidden;   
            transition: all 0.3s ease;
          }
          .animated-open-btn:hover {
            transform: translateY(-3px) scale(1.03);
            box-shadow: 0 12px 30px rgba(185, 28, 28, 0.45);
          }
          .animated-open-btn:active {
            transform: translateY(-1px) scale(1.01);
          }
          .animated-open-btn::before {
            content: '';
            pointer-events: none;
            opacity: .4;
            background:
              radial-gradient(circle at 20% 35%,  transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
              radial-gradient(circle at 75% 44%, transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
              radial-gradient(circle at 46% 52%, transparent 0, transparent 4px, rgba(255,255,255,1) 5px, rgba(255,255,255,1) 6px, transparent 6px);
            width: 100%;
            height: 300%;
            top: 0;
            left: 0;
            position: absolute;
            animation: btn-bubbles 4s linear infinite both;
          }
          @keyframes btn-bubbles {
            from { transform: translate(0, 0); }
            to { transform: translate(0, -66.666%); }
          }
          .envelope-card {
            background: rgba(252, 251, 247, 0.85);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1.5px solid rgba(197, 155, 39, 0.3);
            border-radius: 36px;
            padding: 48px 32px;
            width: 100%;
            max-width: 460px;
            box-shadow: 0 12px 40px rgba(139, 0, 0, 0.15);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            position: relative;
          }
          .env-fl-tl {
            position: absolute;
            top: -10px;
            left: -10px;
            width: 110px;
            pointer-events: none;
            opacity: 0.85;
          }
          .env-fl-tr {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 55px;
            pointer-events: none;
            opacity: 0.85;
          }
        `}} />
        
        <div className="envelope-card">
          <img src="/red-rose-theme-assets/deco1.png" alt="" className="env-fl-tl" />
          <img src="/red-rose-theme-assets/deco-2.png" alt="" className="env-fl-tr" />

          <div className="space-y-1">
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] text-[#C59B27] uppercase text-center block">Wedding Invitation</span>
            <h2 className="text-2xl md:text-3xl font-medium text-[#7F1D1D] uppercase tracking-widest mt-1 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {brideName} <span className="font-normal lowercase text-[#C59B27]">&amp;</span> {groomName}
            </h2>
          </div>
          
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#C59B27]/60 to-transparent" />
          
          <p className="text-[#7F1D1D] italic text-base px-4 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            We request the honor of your presence as we celebrate our love.
          </p>
          
          <button
            type="button"
            onClick={handleOpenClick}
            className="animated-open-btn mt-2"
          >
            Open Invitation
          </button>
        </div>
      </div>
    );
  }

  if (theme === "lavender") {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f0a06]/75 backdrop-blur-md flex items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: `
          .animated-open-btn {
            position: relative;
            padding: 14px 38px;  
            border: none;
            background: none;
            cursor: pointer;
            font-family: 'Great Vibes', cursive;
            font-size: 34px;  
            color: #ffffff;
            background-image: linear-gradient(135deg, #9b6de0 0%, #7c3aed 51%, #9b6de0 100%);
            border: 2px solid #ffffff;
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
            border-radius: 99px; 
            z-index: 1;  
            overflow: hidden;   
            transition: all 0.3s ease;
          }
          .animated-open-btn:hover {
            transform: translateY(-3px) scale(1.03);
            box-shadow: 0 12px 30px rgba(124, 58, 237, 0.45);
          }
          .animated-open-btn:active {
            transform: translateY(-1px) scale(1.01);
          }
          .animated-open-btn::before {
            content: '';
            pointer-events: none;
            opacity: .4;
            background:
              radial-gradient(circle at 20% 35%,  transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
              radial-gradient(circle at 75% 44%, transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
              radial-gradient(circle at 46% 52%, transparent 0, transparent 4px, rgba(255,255,255,1) 5px, rgba(255,255,255,1) 6px, transparent 6px);
            width: 100%;
            height: 300%;
            top: 0;
            left: 0;
            position: absolute;
            animation: btn-bubbles 4s linear infinite both;
          }
          @keyframes btn-bubbles {
            from { transform: translate(0, 0); }
            to { transform: translate(0, -66.666%); }
          }
          .envelope-card {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1.5px solid rgba(155, 107, 203, 0.3);
            border-radius: 36px;
            padding: 48px 32px;
            width: 100%;
            max-width: 460px;
            box-shadow: 0 12px 40px rgba(155, 107, 203, 0.2);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            position: relative;
          }
        `}} />
        
        <div className="envelope-card">
          <img src="/lavender-theme-assets/deco1.png" alt="" className="absolute -top-10 -left-10 w-28 pointer-events-none opacity-80" />
          <img src="/lavender-theme-assets/deco-2.png" alt="" className="absolute -top-6 -right-6 w-14 pointer-events-none opacity-80" />
          <img src="/lavender-theme-assets/deco5.png" alt="" className="absolute -bottom-10 -right-10 w-28 pointer-events-none opacity-80" />

          <div className="space-y-1">
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] text-[#9B6BCB] uppercase text-center block">Wedding Invitation</span>
            <h2 className="text-2xl md:text-3xl font-medium text-[#3b226e] uppercase tracking-widest mt-1 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {brideName} <span className="font-normal lowercase text-[#7b4fcf]">&amp;</span> {groomName}
            </h2>
          </div>
          
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#B78DDA]/60 to-transparent" />
          
          <p className="text-[#6B4E8A] italic text-base px-4 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            We request the honor of your presence as we celebrate our love.
          </p>
          
          <button
            type="button"
            onClick={handleOpenClick}
            className="animated-open-btn mt-2"
          >
            Open Invitation
          </button>
        </div>
      </div>
    );
  }

  // theme === "sage"
  return (
    <div className="fixed inset-0 z-50 bg-[#0f0a06]/75 backdrop-blur-md flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        .animated-open-btn {
          position: relative;
          padding: 14px 38px;  
          border: none;
          background: none;
          cursor: pointer;
          font-family: 'Great Vibes', cursive;
          font-size: 34px;  
          color: #ffffff;
          background-image: linear-gradient(135deg, #779B88 0%, #335F48 51%, #779B88 100%);
          border: 2px solid #ffffff;
          box-shadow: 0 8px 24px rgba(51, 95, 72, 0.3);
          border-radius: 99px; 
          z-index: 1;  
          overflow: hidden;   
          transition: all 0.3s ease;
        }
        .animated-open-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 30px rgba(51, 95, 72, 0.4);
        }
        .animated-open-btn:active {
          transform: translateY(-1px) scale(1.01);
        }
        .animated-open-btn::before {
          content: '';
          pointer-events: none;
          opacity: .35;
          background:
            radial-gradient(circle at 20% 35%,  transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
            radial-gradient(circle at 75% 44%, transparent 0,  transparent 2px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px, transparent 4px),
            radial-gradient(circle at 46% 52%, transparent 0, transparent 4px, rgba(255,255,255,1) 5px, rgba(255,255,255,1) 6px, transparent 6px);
          width: 100%;
          height: 300%;
          top: 0;
          left: 0;
          position: absolute;
          animation: btn-bubbles 4s linear infinite both;
        }
        @keyframes btn-bubbles {
          from { transform: translate(0, 0); }
          to { transform: translate(0, -66.666%); }
        }
        .envelope-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(148, 177, 158, 0.3);
          border-radius: 36px;
          padding: 48px 32px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 12px 40px rgba(80, 116, 94, 0.15);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          position: relative;
          overflow: hidden;
        }
        .env-fl-tl {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 120px;
          pointer-events: none;
          opacity: 0.85;
        }
        .env-fl-br {
          position: absolute;
          bottom: -20px;
          right: -20px;
          width: 120px;
          pointer-events: none;
          opacity: 0.85;
          transform: scaleY(-1);
        }
      `}} />
      
      <div className="envelope-card">
        <img src="/sage-theme-assets/images/slider/flower1.png" alt="" className="env-fl-tl" />
        <img src="/sage-theme-assets/images/slider/flower2.png" alt="" className="env-fl-br" />

        <div className="space-y-1 z-10">
          <span className="font-mono text-[10px] font-semibold tracking-[0.3em] text-[#678970] uppercase text-center block">Wedding Invitation</span>
          <h2 className="text-2xl md:text-3xl font-medium text-[#132F1C] uppercase tracking-widest mt-1 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {brideName} <span className="font-normal lowercase text-[#50745E]">&amp;</span> {groomName}
          </h2>
        </div>
        
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#94B19E]/60 to-transparent z-10" />
        
        <p className="text-[#335F48] italic text-base px-4 text-center z-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          We request the honor of your presence as we celebrate our love.
        </p>
        
        <button
          type="button"
          onClick={handleOpenClick}
          className="animated-open-btn mt-2 z-10"
        >
          Open Invitation
        </button>
      </div>
    </div>
  );
};
