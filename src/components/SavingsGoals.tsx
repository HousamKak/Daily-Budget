import { PiggyBank, Target, TrendingUp, Calendar } from "lucide-react";
import { paperTheme } from "@/styles";

/**
 * Savings & Goals placeholder page with cartoony paper theme
 * Coming soon with fun animations and interactive elements
 */
export default function SavingsGoals() {
  return (
    <div className={`min-h-screen w-full ${paperTheme.colors.background.app} flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background paper texture */}
      <div className={`absolute inset-0 opacity-5 ${paperTheme.effects.paperTexture} pointer-events-none`}></div>

      {/* Floating paper elements for decoration */}
      <div className="absolute top-20 left-20 transform -rotate-12">
        <div className={`w-24 h-16 ${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.paper} ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm}`}>
          <div className={`absolute inset-0 opacity-15 ${paperTheme.effects.paperTexture} ${paperTheme.radius.lg}`}></div>
          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-4 ${paperTheme.effects.yellowTape}`}></div>
        </div>
      </div>

      <div className="absolute bottom-32 right-16 transform rotate-45">
        <div className={`w-20 h-20 ${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.amber} ${paperTheme.radius.full} ${paperTheme.effects.shadow.md}`}>
          <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTexture} ${paperTheme.radius.full}`}></div>
        </div>
      </div>

      {/* Main content card */}
      <div className={`relative ${paperTheme.colors.background.cardGradient} ${paperTheme.colors.borders.paper} ${paperTheme.radius.xl} p-12 ${paperTheme.effects.shadow.lg} overflow-hidden max-w-2xl mx-4 text-center transform hover:scale-105 transition-transform duration-300`}>
        {/* Paper texture overlay */}
        <div className={`absolute inset-0 opacity-15 ${paperTheme.effects.paperTexture} ${paperTheme.radius.xl} pointer-events-none`}></div>

        {/* Yellow tape at top */}
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-6 ${paperTheme.effects.yellowTape}`}></div>

        {/* Red tape at bottom corner */}
        <div className="absolute -bottom-1 -right-1 w-16 h-4 bg-red-400/60 rounded-sm shadow-sm transform rotate-12"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon cluster */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className={`p-4 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.full} ${paperTheme.effects.shadow.sm} transform -rotate-12 animate-bounce`}>
              <PiggyBank className={`w-8 h-8 ${paperTheme.colors.text.accent}`} />
            </div>
            <div className={`p-4 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.full} ${paperTheme.effects.shadow.sm} transform rotate-12 animate-bounce`} style={{ animationDelay: '0.2s' }}>
              <Target className={`w-8 h-8 ${paperTheme.colors.text.accent}`} />
            </div>
            <div className={`p-4 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.full} ${paperTheme.effects.shadow.sm} transform -rotate-6 animate-bounce`} style={{ animationDelay: '0.4s' }}>
              <TrendingUp className={`w-8 h-8 ${paperTheme.colors.text.accent}`} />
            </div>
          </div>

          {/* Main heading with handwriting font */}
          <h1 className={`text-4xl md:text-5xl font-bold ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting} mb-4 drop-shadow-sm`}>
            Savings & Goals
          </h1>

          {/* Coming soon badge */}
          <div className={`inline-block ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amberStrong} ${paperTheme.radius.full} px-6 py-3 ${paperTheme.effects.shadow.md} mb-6 transform -rotate-2 relative overflow-hidden`}>
            <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall} ${paperTheme.radius.full}`}></div>
            <div className={`relative text-lg font-bold ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>
              ✨ Coming Soon! ✨
            </div>
          </div>

          {/* Description */}
          <p className={`text-lg ${paperTheme.colors.text.muted} mb-8 leading-relaxed max-w-lg mx-auto ${paperTheme.fonts.handwriting}`}>
            Track your savings, set financial goals, and watch your progress grow!
            We're crafting something special with our signature paper-and-tape aesthetic.
          </p>

          {/* Feature preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className={`p-4 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm} transform rotate-1 hover:-rotate-1 transition-transform duration-200`}>
              <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall} ${paperTheme.radius.lg}`}></div>
              <Target className={`w-6 h-6 ${paperTheme.colors.text.accent} mx-auto mb-2`} />
              <h3 className={`font-bold text-sm ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>Goal Setting</h3>
              <p className={`text-xs ${paperTheme.colors.text.muted} mt-1`}>Set & track financial targets</p>
            </div>

            <div className={`p-4 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm} transform -rotate-2 hover:rotate-2 transition-transform duration-200`}>
              <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall} ${paperTheme.radius.lg}`}></div>
              <PiggyBank className={`w-6 h-6 ${paperTheme.colors.text.accent} mx-auto mb-2`} />
              <h3 className={`font-bold text-sm ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>Savings Tracker</h3>
              <p className={`text-xs ${paperTheme.colors.text.muted} mt-1`}>Watch your money grow</p>
            </div>

            <div className={`p-4 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm} transform rotate-2 hover:-rotate-2 transition-transform duration-200`}>
              <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall} ${paperTheme.radius.lg}`}></div>
              <Calendar className={`w-6 h-6 ${paperTheme.colors.text.accent} mx-auto mb-2`} />
              <h3 className={`font-bold text-sm ${paperTheme.colors.text.accent} ${paperTheme.fonts.handwriting}`}>Timeline</h3>
              <p className={`text-xs ${paperTheme.colors.text.muted} mt-1`}>Plan your financial journey</p>
            </div>
          </div>

          {/* Fun notification */}
          <div className={`mt-8 p-3 ${paperTheme.colors.background.white} ${paperTheme.colors.borders.amber} ${paperTheme.radius.lg} ${paperTheme.effects.shadow.sm} inline-block transform rotate-1 relative`}>
            <div className={`absolute inset-0 opacity-10 ${paperTheme.effects.paperTextureSmall} ${paperTheme.radius.lg}`}></div>
            <div className="absolute -top-1 -right-1 w-6 h-3 bg-blue-400/60 rounded-sm shadow-sm transform -rotate-12"></div>
            <p className={`text-sm ${paperTheme.colors.text.muted} ${paperTheme.fonts.handwriting}`}>
              💡 <strong>Tip:</strong> Keep budgeting while we build this awesome feature!
            </p>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 transform -rotate-45">
        <div className={`w-3 h-16 ${paperTheme.effects.yellowTape}`}></div>
      </div>

      <div className="absolute bottom-4 right-4 transform rotate-12">
        <div className="w-2 h-12 bg-red-400/60 rounded-sm shadow-sm"></div>
      </div>
    </div>
  );
}