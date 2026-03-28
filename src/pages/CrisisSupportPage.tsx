import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Heart, MessageCircle, Users, ExternalLink, Shield, Clock, Globe, AlertTriangle } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion } from "framer-motion";

const useSEO = (title: string, description: string, canonicalPath = "/crisis-support") => {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);
    else { const m = document.createElement("meta"); m.name = "description"; m.content = description; document.head.appendChild(m); }
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.origin + canonicalPath;
  }, [title, description, canonicalPath]);
};

interface HelplineInfo { name: string; nameHindi?: string; phone: string; hours: string; description: string; languages: string[]; website?: string; isFree: boolean; is24x7?: boolean; }

const helplines: HelplineInfo[] = [
  { name: "iCall", nameHindi: "आईकॉल", phone: "9152987821", hours: "Mon-Sat, 8 AM - 10 PM", description: "Professional psychosocial support by trained counselors from TISS Mumbai.", languages: ["English", "Hindi", "Marathi"], website: "https://icallhelpline.org", isFree: true },
  { name: "Vandrevala Foundation", nameHindi: "वंद्रेवाला फाउंडेशन", phone: "1860-2662-345", hours: "24/7 Available", description: "India's leading mental health foundation offering free counseling round the clock.", languages: ["English", "Hindi", "Regional Languages"], website: "https://www.vandrevalafoundation.com", isFree: true, is24x7: true },
  { name: "NIMHANS Helpline", nameHindi: "निम्हांस", phone: "080-46110007", hours: "24/7 Available", description: "National Institute of Mental Health and Neuro Sciences - Government initiative.", languages: ["English", "Hindi", "Kannada"], website: "https://nimhans.ac.in", isFree: true, is24x7: true },
  { name: "Connecting Trust", nameHindi: "कनेक्टिंग ट्रस्ट", phone: "9922001122", hours: "12 PM - 8 PM Daily", description: "Emotional support for those in distress, depression, or suicidal thoughts.", languages: ["English", "Hindi", "Marathi"], isFree: true },
  { name: "Snehi", nameHindi: "स्नेही", phone: "044-24640050", hours: "24/7 Available", description: "Chennai-based helpline providing emotional support and suicide prevention.", languages: ["English", "Hindi", "Tamil"], isFree: true, is24x7: true },
  { name: "Roshni Trust", nameHindi: "रोशनी ट्रस्ट", phone: "040-66202000", hours: "11 AM - 9 PM Daily", description: "Hyderabad-based crisis intervention center for emotional support.", languages: ["English", "Hindi", "Telugu"], isFree: true },
];

const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };

export default function CrisisSupportPage() {
  useSEO("Crisis Support | Calmora - Indian Mental Health Helplines", "Find immediate mental health support with verified Indian helplines. Available 24/7, confidential, and free.");

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Heart className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gradient-soul">Aap Akele Nahi Ho</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Madad lena himmat ki nishani hai. Yahan verified Indian helplines hain jo aapki baat sunenge — confidential, free, aur caring.
          </p>
        </motion.div>

        {/* Calming message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent overflow-hidden relative">
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Kuch bhi ho raha ho, yeh bhi guzar jayega.</strong> Aapki feelings valid hain.
                  Kisi trusted person se baat karna bahut madad kar sakta hai. Yeh ek safe space hai. 💙
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 overflow-hidden relative group hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]">24/7</Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1 text-foreground">Immediate Support</h3>
              <p className="text-xs text-muted-foreground mb-4">Vandrevala Foundation — Always available, free</p>
              <Button className="w-full rounded-full gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg" onClick={() => handleCall("1860-2662-345")}>
                <Phone className="w-4 h-4" /> Call: 1860-2662-345
              </Button>
            </CardContent>
          </Card>

          <Card className="border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-sky-500/0 overflow-hidden relative group hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-sky-600" />
                </div>
                <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 text-[10px]">Professional</Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1 text-foreground">Professional Counseling</h3>
              <p className="text-xs text-muted-foreground mb-4">iCall (TISS) — Trained counselors</p>
              <Button variant="outline" className="w-full rounded-full gap-2 border-sky-500/30 hover:bg-sky-500/10" onClick={() => handleCall("9152987821")}>
                <Phone className="w-4 h-4" /> Call: 9152987821
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* All Helplines */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Verified Indian Helplines</h2>
          </div>
          <div className="grid gap-3">
            {helplines.map((h, i) => (
              <motion.div key={h.phone} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                <Card className="hover:shadow-md transition-all border-border/50 overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-semibold text-sm">{h.name}</h3>
                          {h.nameHindi && <span className="text-xs text-muted-foreground">({h.nameHindi})</span>}
                          {h.isFree && <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Free</Badge>}
                          {h.is24x7 && <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">24/7</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{h.description}</p>
                        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{h.hours}</span>
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{h.languages.join(", ")}</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:min-w-[140px]">
                        <Button size="sm" className="rounded-full gap-1.5 flex-1 sm:flex-none text-xs" onClick={() => handleCall(h.phone)}>
                          <Phone className="w-3 h-3" />{h.phone}
                        </Button>
                        {h.website && (
                          <Button variant="ghost" size="sm" className="rounded-full text-xs gap-1" asChild>
                            <a href={h.website} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" />Website</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Self-Care Tips */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="w-5 h-5 text-primary" />
                Abhi Ke Liye Simple Steps
              </CardTitle>
              <CardDescription className="text-xs">Jab tak aap kisi se baat nahi kar lete, yeh try karein</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { emoji: "🌬️", title: "Deep Breathing", desc: "4 count inhale, 4 hold, 6 exhale. 3 baar repeat." },
                  { emoji: "💧", title: "Paani Piyein", desc: "Ek glass thanda paani slowly piyein." },
                  { emoji: "👀", title: "5-4-3-2-1 Technique", desc: "5 dekho, 4 suno, 3 touch, 2 smell, 1 taste." },
                  { emoji: "📱", title: "Kisi Ko Message Karo", desc: "Trusted person ko 'Baat karni hai' bhejo." },
                ].map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{tip.emoji}</span>
                      <h4 className="font-medium text-sm text-foreground">{tip.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground pl-8">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-amber-600 dark:text-amber-400">Important:</strong> Calmora ek wellness app hai, medical service nahi. Serious concerns ke liye professional help zaroor lein. Emergency mein 112 dial karein.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
