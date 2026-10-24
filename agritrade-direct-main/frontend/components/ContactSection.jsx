import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 sm:py-32 mb-12 sm:mb-16 md:mb-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(153 25% 96%) 0%, hsl(40 30% 97%) 50%, hsl(153 20% 98%) 100%)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions about AgriTrade? We're here to help. Reach out to us and we'll respond as soon as possible.
          </p>
        </div>

        <div className="flex justify-center animate-fade-in">
          <div className="max-w-2xl w-full">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-10 sm:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] transition-all duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
                {/* Email Card */}
                <div className="text-center group">
                  <div className="inline-flex bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:from-primary/15 group-hover:to-primary/10">
                    <Mail className="w-9 h-9 text-primary transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Email</p>
                  <p className="text-foreground font-semibold text-base sm:text-lg break-words px-2">support@agritrade.com</p>
                </div>

                {/* Phone Card */}
                <div className="text-center group">
                  <div className="inline-flex bg-gradient-to-br from-secondary/10 to-secondary/5 p-5 rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:from-secondary/15 group-hover:to-secondary/10">
                    <Phone className="w-9 h-9 text-secondary transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Phone</p>
                  <p className="text-foreground font-semibold text-base sm:text-lg">+91 9313154582</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
