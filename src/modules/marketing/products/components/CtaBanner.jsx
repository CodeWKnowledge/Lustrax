import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight01Icon, SparklesIcon, WhatsappIcon, ShieldEnergyIcon } from 'hugeicons-react'

const CtaBanner = ({ banner }) => {
  if (!banner || !banner.active) return null

  const {
    headline,
    subheading,
    button_text,
    button_link,
    is_external,
    tag,
    theme = 'dark',
    background_image
  } = banner

  // Pick visual motif based on theme
  const getThemeClasses = () => {
    switch (theme) {
      case 'gold':
        return {
          container: 'bg-gradient-to-r from-[#17140B] via-[#0D0C09] to-[#1C180E] text-white border-gold/30',
          accent: 'text-gold',
          tagBg: 'bg-gold/10 text-gold border-gold/30',
          btn: 'bg-gold text-obsidian hover:bg-gold-light border-gold',
          icon: <WhatsappIcon size={18} className="text-gold" />,
          glow: 'from-gold/15 to-transparent',
          overlay: 'bg-obsidian/80 backdrop-blur-[1px]'
        }
      case 'minimal':
        return {
          container: 'bg-stone text-charcoal border-neutral-border',
          accent: 'text-charcoal',
          tagBg: 'bg-white text-gray-500 border-neutral-border',
          btn: 'bg-obsidian text-gold hover:bg-charcoal border-obsidian',
          icon: <ShieldEnergyIcon size={18} className="text-gold" />,
          glow: 'from-black/[0.03] to-transparent',
          overlay: 'bg-white/85 backdrop-blur-[1px]'
        }
      case 'dark':
      default:
        return {
          container: 'bg-obsidian text-white border-neutral-border/20',
          accent: 'text-white',
          tagBg: 'bg-white/5 text-gray-300 border-white/10',
          btn: 'bg-white text-obsidian hover:bg-gold hover:text-obsidian hover:border-gold border-white',
          icon: <SparklesIcon size={18} className="text-gold" />,
          glow: 'from-gold/10 to-transparent',
          overlay: 'bg-obsidian/75 backdrop-blur-[1px]'
        }
    }
  }

  const currentTheme = getThemeClasses()

  const ButtonElement = () => {
    const btnClasses = `inline-flex items-center justify-center space-x-3 px-8 py-3.5 text-[10px] uppercase font-bold tracking-[0.25em] transition-luxury shadow-premium-sm border rounded-[3px] ${currentTheme.btn}`

    if (is_external) {
      return (
        <a
          href={button_link}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClasses}
        >
          <span>{button_text}</span>
          <ArrowRight01Icon size={14} />
        </a>
      )
    }

    return (
      <Link to={button_link} className={btnClasses}>
        <span>{button_text}</span>
        <ArrowRight01Icon size={14} />
      </Link>
    )
  }

  return (
    <div className="col-span-full my-4 lg:my-6">
      <div className={`relative overflow-hidden border p-8 sm:p-10 lg:p-12 transition-luxury rounded-[6px] ${currentTheme.container}`}>
        
        {/* Optional Background Picture with Overlay */}
        {background_image && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img 
              src={background_image} 
              alt={headline || 'CTA Banner Background'}
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Scrim Overlay ensuring text readability */}
            <div className={`absolute inset-0 ${currentTheme.overlay}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/60 to-transparent" />
          </div>
        )}

        {/* Subtle geometric luxury pattern overlay */}
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${currentTheme.glow} blur-3xl pointer-events-none z-0`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 max-w-6xl mx-auto">
          <div className="space-y-4 max-w-2xl">
            {tag && (
              <div className="inline-flex items-center space-x-2">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 text-[9px] uppercase font-bold tracking-[0.25em] border ${currentTheme.tagBg}`}>
                  {currentTheme.icon}
                  <span>{tag}</span>
                </span>
              </div>
            )}
            
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight uppercase">
              {headline}
            </h3>

            <p className="text-sm sm:text-base opacity-80 leading-relaxed font-light">
              {subheading}
            </p>
          </div>

          <div className="flex-shrink-0 pt-2 md:pt-0">
            <ButtonElement />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CtaBanner

