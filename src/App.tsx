/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Rocket, 
  Layout, 
  Megaphone, 
  Palette, 
  Send, 
  Loader2, 
  Eye, 
  Code, 
  Copy, 
  Check,
  Smartphone,
  Monitor,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Globe,
  Zap,
  Upload,
  X,
  Download,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

// --- Constants & Types ---

const SYSTEM_PROMPT = `
You are a senior conversion-rate optimization (CRO) specialist and brand creative director with deep expertise in Nigerian/West African markets, luxury/premium brands, and health & wellness products.

Every time I give you a product or client brief, you will produce THREE deliverables without me having to ask separately. Do not produce just one — always deliver all three.

---

### DELIVERABLE 1: HTML LANDING PAGE
Build a single self-contained HTML file (all CSS and JS inline — no external dependencies except Google Fonts).

Mandatory page structure — in this exact order:
1. Sticky NAV BAR — Logo + WhatsApp CTA button
2. HERO SECTION — Bold headline + subheadline + primary CTA
3. PROBLEM SECTION — Agitate the pain point (2–3 statements)
4. SOLUTION SECTION — Product as the answer, 3 key benefits
5. SOCIAL PROOF — Minimum 3 testimonials with names and locations
6. HOW IT WORKS — 3-step process (Order → Receive → Transform)
7. OFFER SECTION — Price, what's included, urgency element
8. FAQ SECTION — 4–6 objection-handling questions
9. FINAL CTA — Repeat hero CTA + WhatsApp float button
10. EMAIL FORM — Name + Email capture with trust line
11. FOOTER — Contact info, social links

Design rules (non-negotiable):
- NO purple gradients, NO Inter/Roboto fonts, NO generic centered layouts
- Choose a bold aesthetic matching the brand: luxury dark, earthy wellness, vibrant Nigerian energy, etc.
- Pair a distinctive display font (Playfair Display, Bebas Neue, Cormorant Garamond) with a clean body font
- WhatsApp float button: fixed bottom-right, green (#25D366), always visible
- Mobile-first: all sections responsive at 375px width
- Subtle fade-up scroll animations using IntersectionObserver (no heavy libraries)
- CTA buttons: high contrast, minimum 48px height on mobile

WhatsApp CTA format:
<a href="https://wa.me/[NUMBER]?text=[URLENCODEDMESSAGE]" target="_blank">Chat on WhatsApp</a>
Pre-fill message: "I'm interested in [Product Name] — please send me details"

Email form: First Name + Email fields. Branded submit button. Add: "No spam. We respect your inbox." below the button.

**IMAGE HANDLING:**
- If a logo is provided, use it in the Nav Bar and Footer.
- If product images are provided, use them in the Hero Section and Solution Section.
- Embed images using base64 data URIs if provided in the context, otherwise use high-quality placeholders from Picsum.

---

### DELIVERABLE 2: FACEBOOK / META AD COPY SET
Produce 3 ad variants (A/B/C) targeting different psychological angles.

Structure for each variant:
VARIANT [A/B/C] — [Angle Name]
PRIMARY TEXT (125 chars ideal, 280 max): [Ad body copy]
HEADLINE (40 chars max): [Benefit-led headline]
DESCRIPTION (30 chars max): [Urgency or proof line]
CTA BUTTON: [Shop Now / Learn More / Send Message / Get Offer / Book Now]
AUDIENCE NOTES: [Who to target — interests, age range, behaviors]

The 3 angles are always:
- Variant A — Transformation/Emotion: Lead with the life change, make them feel the outcome
- Variant B — Social Proof/FOMO: Numbers, testimonials, fear of missing out
- Variant C — Direct Offer/Urgency: Price, discount, deadline — for retargeting audiences

---

### DELIVERABLE 3: CREATIVE BRIEF (for Canva / Midjourney / DALL-E / Ideogram)
For each of the 3 ad variants, produce:
CREATIVE BRIEF — Variant [A/B/C]
FORMAT: [1080×1080 Feed / 1080×1920 Story / 1200×628 Link Ad]
VISUAL CONCEPT: [2–3 specific sentences: subject, lighting, background, mood, props — nothing vague]
COLOR PALETTE: Primary: [hex] | Accent: [hex] | Background: [hex]
TEXT ON CREATIVE: Headline: "[exact words]", Subtext: "[exact words]", Font style: [bold serif / condensed sans / etc.]
MOOD: [3 adjectives + visual reference, e.g. "Warm, confident, premium Nigerian — think GTBank 2020 era"]
TEXT PLACEMENT: [e.g. Bottom third, left-aligned]
AI IMAGE PROMPT (paste directly into Midjourney/DALL-E/Ideogram): "[Complete ready-to-use prompt]"

---

### MARKET INTELLIGENCE — APPLY AUTOMATICALLY
Nigerian / West African market:
- Direct, confident language — boldness and social proof convert here
- Trust signals: "100% Natural", "Tested & Trusted", "NAFDAC Approved" where relevant
- Price anchoring: "Worth ₦50,000 — Yours for ₦19,500"
- WhatsApp is the #1 conversion channel — always primary CTA
- Urgency: "Only 20 packs left this week"
- Testimonials: full names + city ("— Adaeze O., Lagos")
- Ad copy: "DM us on WhatsApp" outperforms link clicks in this market
- Pidgin for relatability if brand allows: "No more managing", "E go shock you"
- Mention delivery: "We deliver nationwide" is a strong trust signal

Luxury / Premium brands:
- Never say "high quality" or "affordable luxury" — these are disqualifiers
- Lead with identity: "For those who know the difference"
- Show price confidently — hiding it signals insecurity
- CTAs: "Request a Consultation", "Explore the Collection" — never "Buy Now"
- White space, precise typography, restraint

Health & Wellness products:
- Lead with transformation: "Wake up without the bloat" not "Contains ginger extract"
- Social proof: before/after stories, expert endorsements, user counts
- Address the skeptic directly — one full section preemptively handles doubts
- No illegal medical claims language
- WhatsApp for "ask us anything" consultations

MISTAKES TO NEVER MAKE:
- Do not write generic copy like "Premium quality you can trust" — be specific
- Do not hide price on luxury pages — show it confidently
- Do not use one CTA approach for all markets — WhatsApp first for Nigeria, form-first for international
- Do not skip the FAQ section — it is often the highest-converting section
- Do not use Inter or Roboto fonts — they signal generic AI output to clients
- Do not deliver only one output — always produce all three deliverables
`;

interface GenerationResult {
  landingPage: string;
  adCopy: string;
  creativeBrief: string;
}

// --- Components ---

type Page = 'product' | 'resources' | 'pricing' | 'app';

const Header = ({ currentPage, setCurrentPage }: { currentPage: Page, setCurrentPage: (p: Page) => void }) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <button onClick={() => setCurrentPage('product')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-ink flex items-center justify-center rounded-lg">
          <Rocket className="text-white w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-display font-bold tracking-tight text-ink">AdMaster AI</span>
        </div>
      </button>
      <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
        {[
          { id: 'product', label: 'Product' },
          { id: 'resources', label: 'Resources' },
          { id: 'pricing', label: 'Pricing' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setCurrentPage(item.id as Page)} 
            className={`px-4 py-2 rounded-lg transition-all relative ${currentPage === item.id ? 'text-accent' : 'text-ink/40 hover:text-ink'}`}
          >
            {currentPage === item.id && (
              <motion.div 
                layoutId="navActive"
                className="absolute inset-0 bg-accent/5 rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>
      <button onClick={() => setCurrentPage('app')} className="btn-saas-primary text-sm py-2">
        {currentPage === 'app' ? 'Dashboard' : 'Start Building'}
      </button>
    </div>
  </header>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", multiline = false }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-ink/60">{label}</label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-saas min-h-[100px] resize-none"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-saas"
      />
    )}
  </div>
);

const FileUpload = ({ label, onUpload, multiple = false, value }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-ink/60">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full aspect-video bg-muted border border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-ink/5 transition-all group"
      >
        <Upload className="w-4 h-4 text-ink/40 group-hover:text-ink transition-colors" />
        <span className="text-[10px] font-medium text-ink/40 uppercase tracking-wider">Drag or click</span>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple={multiple} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
      {value && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Array.isArray(value) ? value.map((img, idx) => (
            <div key={idx} className="relative w-10 h-10 rounded-lg overflow-hidden border border-border">
              <img src={img} alt="upload" className="w-full h-full object-cover" />
            </div>
          )) : (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border">
              <img src={value} alt="logo" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('product');
  const [formData, setFormData] = useState({
    productName: '',
    whatItDoes: '',
    keyBenefit: '',
    targetAudience: '',
    market: 'Nigerian',
    price: '',
    whatsappNumber: '',
    email: '',
    brandColors: '',
    tone: '',
    specialNotes: '',
    logo: '',
    productImages: [] as string[]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'ads' | 'brief'>('code');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (base64: string) => {
    setFormData({ ...formData, logo: base64 });
  };

  const handleProductImageUpload = (base64: string) => {
    setFormData(prev => ({ ...prev, productImages: [...prev.productImages, base64] }));
  };

  const generateContent = async () => {
    if (!formData.productName) return;
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please check your environment variables.");
      }
      const ai = new GoogleGenAI({ apiKey });

      const stripBase64 = (base64: string) => {
        if (!base64) return null;
        const parts = base64.split(',');
        return parts.length > 1 ? parts[1] : parts[0];
      };

      const parts: any[] = [
        {
          text: `
            Product Name: ${formData.productName}
            What it does: ${formData.whatItDoes}
            Key benefit: ${formData.keyBenefit}
            Target audience: ${formData.targetAudience}
            Market: ${formData.market}
            Price: ${formData.price}
            WhatsApp number: ${formData.whatsappNumber}
            Email: ${formData.email}
            Brand colors: ${formData.brandColors}
            Tone: ${formData.tone}
            Special notes: ${formData.specialNotes}

            ${formData.logo ? `LOGO_BASE64: ${formData.logo}` : ""}
            ${formData.productImages.map((img, i) => `PRODUCT_IMAGE_${i + 1}_BASE64: ${img}`).join('\n')}
          `
        }
      ];

      if (formData.logo) {
        const logoData = stripBase64(formData.logo);
        if (logoData) {
          parts.push({
            inlineData: {
              mimeType: "image/png",
              data: logoData
            }
          });
        }
      }

      formData.productImages.forEach((img) => {
        const imgData = stripBase64(img);
        if (imgData) {
          parts.push({
            inlineData: {
              mimeType: "image/png",
              data: imgData
            }
          });
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              landingPage: { type: Type.STRING, description: "The full HTML code for the landing page" },
              adCopy: { type: Type.STRING, description: "The Facebook/Meta ad copy variants in markdown" },
              creativeBrief: { type: Type.STRING, description: "The creative briefs for visuals in markdown" }
            },
            required: ["landingPage", "adCopy", "creativeBrief"]
          }
        },
        contents: { parts }
      });

      if (!response.text) {
        throw new Error("No response received from AI.");
      }

      const data = JSON.parse(response.text) as GenerationResult;
      setResult(data);
      setActiveTab('preview');
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    if (!result) return;
    const blob = new Blob([result.landingPage], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.productName.toLowerCase().replace(/\s+/g, '-')}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openLivePreview = () => {
    if (!result) return;
    const blob = new Blob([result.landingPage], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'product':
        return <ProductPage onStart={() => setCurrentPage('app')} />;
      case 'resources':
        return <ResourcesPage />;
      case 'pricing':
        return <PricingPage onSelect={() => setCurrentPage('app')} />;
      case 'app':
        return (
          <AppPage 
            formData={formData} 
            setFormData={setFormData}
            loading={loading}
            error={error}
            result={result}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            copied={copied}
            handleInputChange={handleInputChange}
            handleLogoUpload={handleLogoUpload}
            handleProductImageUpload={handleProductImageUpload}
            generateContent={generateContent}
            copyToClipboard={copyToClipboard}
            downloadHtml={downloadHtml}
            openLivePreview={openLivePreview}
          />
        );
      default:
        return <ProductPage onStart={() => setCurrentPage('app')} />;
    }
  };

  return (
    <div className="min-h-screen mesh-bg font-sans text-ink selection:bg-accent/20 selection:text-accent">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <button onClick={() => setCurrentPage('product')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-ink flex items-center justify-center rounded-lg">
              <Rocket className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-display font-bold tracking-tight text-ink">AdMaster AI</span>
          </button>
          <div className="flex gap-8 text-sm font-medium text-ink/40">
            <button onClick={() => setCurrentPage('product')} className="hover:text-ink">Product</button>
            <button onClick={() => setCurrentPage('resources')} className="hover:text-ink">Resources</button>
            <button onClick={() => setCurrentPage('pricing')} className="hover:text-ink">Pricing</button>
          </div>
          <p className="text-sm text-ink/20">© 2026 AdMaster AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// --- Page Components ---

const ProductPage = ({ onStart }: { onStart: () => void }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 40,
      y: (clientY / innerHeight - 0.5) * 40,
    });
  };

  return (
    <>
      <section 
        onMouseMove={handleMouseMove}
        className="relative pt-48 pb-32 px-6 text-center border-b border-border overflow-hidden"
      >
      {/* Decorative Elements */}
      <motion.div 
        animate={{ x: mousePos.x, y: mousePos.y }}
        className="absolute top-20 left-[10%] w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ x: -mousePos.x, y: -mousePos.y }}
        className="absolute bottom-20 right-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" 
      />
      
      <div className="absolute top-20 left-[10%] w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-[10%] w-48 h-48 bg-violet-500/5 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-40 right-[20%] w-4 h-4 border-2 border-accent/20 rounded-full animate-float" />
      <div className="absolute bottom-40 left-[20%] w-6 h-6 border-2 border-violet-500/10 rotate-45 animate-float-delayed" />

      <div className="relative max-w-5xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/5 border border-accent/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent"
        >
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
          Now Powered by Gemini 3.1 Pro
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tight leading-[0.9] text-balance"
        >
          Marketing Assets <br /> <span className="text-gradient">Generated in Seconds.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-ink/50 max-w-2xl mx-auto leading-relaxed"
        >
          AdMaster AI combines deep market intelligence with high-conversion design to build your landing pages, ad copy, and creative briefs automatically.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
        >
          <button onClick={onStart} className="btn-saas-primary text-lg px-10 py-5 flex items-center gap-2 group">
            Start Building 
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="btn-saas-secondary text-lg px-10 py-5">
            View Examples
          </button>
        </motion.div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="py-24 px-6 border-b border-border bg-muted/30 relative">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
        {[
          { icon: <Layout className="w-6 h-6" />, title: "SaaS Landing Pages", desc: "Conversion-optimized product pages with modern layouts, clean typography, and responsive design baked in." },
          { icon: <Megaphone className="w-6 h-6" />, title: "Meta Ad Copy", desc: "Three distinct psychological angles for every campaign: Transformation, Social Proof, and Direct Urgency." },
          { icon: <Palette className="w-6 h-6" />, title: "Creative Briefs", desc: "Detailed visual instructions and AI image prompts ready for Midjourney, DALL-E, or your design team." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="space-y-4 group p-6 rounded-2xl hover:bg-white transition-all duration-500"
          >
            <div className="w-12 h-12 bg-accent/5 border border-accent/10 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-accent group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              {feature.icon}
            </div>
            <h3 className="text-xl font-display font-bold">{feature.title}</h3>
            <p className="text-ink/50 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* How it Works */}
    <section className="py-24 px-6 border-b border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl font-display font-bold tracking-tight">How it Works</h2>
          <p className="text-ink/50">Three simple steps to launch your next high-converting campaign.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Input Details", desc: "Tell us about your product, audience, and target market. Upload your logo and assets for a personalized touch." },
            { step: "02", title: "AI Generation", desc: "Our specialized Gemini model crafts a full SaaS landing page, three ad variants, and creative briefs based on CRO principles." },
            { step: "03", title: "Launch & Convert", desc: "Copy your code, set up your ads, and start seeing results. Everything is optimized for maximum conversion from day one." }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-6 relative group"
            >
              <span className="text-8xl font-display font-bold text-accent/5 absolute -top-10 -left-4 select-none group-hover:text-accent/10 transition-colors">{item.step}</span>
              <div className="relative pt-4">
                <h3 className="text-xl font-display font-bold mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-ink/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-24 px-6 bg-ink text-white">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-display font-bold tracking-tight">Trusted by Founders</h2>
          <p className="text-white/40">Join 500+ marketers building better campaigns with AdMaster AI.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { quote: "AdMaster AI cut our landing page production time by 80%. The copy is surprisingly sharp.", author: "Tunde O.", role: "Founder, HealthStack" },
            { quote: "The creative briefs are a game changer for our design team. No more back-and-forth.", author: "Sarah M.", role: "Marketing Lead, LuxeStay" },
            { quote: "Finally, an AI that understands the nuances of the West African market. Highly recommended.", author: "Chidi E.", role: "Growth Manager, FinTech Pro" }
          ].map((t, i) => (
            <div key={i} className="p-8 border border-white/10 rounded-2xl space-y-6 bg-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-default">
              <p className="text-lg italic text-white/80">"{t.quote}"</p>
              <div className="space-y-1">
                <p className="font-bold text-accent">{t.author}</p>
                <p className="text-xs text-white/40 uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);
}

const ResourcesPage = () => (
  <section className="pt-48 pb-32 px-6">
    <div className="max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-display font-bold tracking-tight">Resources</h2>
        <p className="text-ink/50 text-lg">Master the art of AI-driven marketing with our guides and case studies.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {['All', 'Market Intelligence', 'CRO Guide', 'Tutorial', 'Strategy', 'Case Study'].map((cat) => (
          <button key={cat} className="px-5 py-2 rounded-full border border-border text-sm font-semibold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all active:scale-95">
            {cat}
          </button>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: "The 2026 Nigerian Consumer Report", category: "Market Intelligence", date: "Mar 12, 2026", excerpt: "Deep dive into the evolving spending habits of the West African digital consumer." },
          { title: "Optimizing Landing Pages for WhatsApp", category: "CRO Guide", date: "Mar 08, 2026", excerpt: "How to leverage the world's most popular messaging app for direct sales." },
          { title: "AI Prompt Engineering for Creatives", category: "Tutorial", date: "Feb 28, 2026", excerpt: "Advanced techniques for generating high-quality marketing visuals with AI." },
          { title: "Luxury Branding in the Digital Age", category: "Strategy", date: "Feb 20, 2026", excerpt: "Maintaining exclusivity and prestige in a world of instant accessibility." },
          { title: "Scaling Meta Ads with Dynamic Content", category: "Case Study", date: "Feb 15, 2026", excerpt: "How one startup achieved 4x ROAS using AI-generated ad variants." },
          { title: "Wellness Marketing: Trust & Transparency", category: "Ethics", date: "Feb 01, 2026", excerpt: "Building long-term brand loyalty in the health and wellness sector." },
        ].map((item, i) => (
          <div key={i} className="saas-card p-8 space-y-6 group cursor-pointer flex flex-col">
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-accent">{item.category}</span>
                <span className="text-ink/40">{item.date}</span>
              </div>
              <h3 className="text-xl font-display font-bold group-hover:text-accent transition-colors">{item.title}</h3>
              <p className="text-ink/50 text-sm leading-relaxed">{item.excerpt}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-accent group-hover:translate-x-2 transition-transform pt-4">
              Read More <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PricingPage = ({ onSelect }: { onSelect: () => void }) => (
  <section className="pt-48 pb-32 px-6">
    <div className="max-w-7xl mx-auto space-y-24">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-display font-bold tracking-tight">Simple Pricing</h2>
        <p className="text-ink/50 text-lg">Choose the plan that fits your campaign volume.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          { name: "Starter", price: "Free", features: ["3 Campaigns / mo", "Standard AI Model", "Basic Templates", "Community Support"] },
          { name: "Pro", price: "$49", features: ["Unlimited Campaigns", "Gemini 3.1 Pro", "Custom Brand Kits", "Priority Support"], popular: true },
          { name: "Agency", price: "$199", features: ["Team Collaboration", "API Access", "White-label Exports", "Dedicated Account Manager"] },
        ].map((plan, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className={`saas-card p-8 flex flex-col space-y-8 relative group transition-all duration-500 ${plan.popular ? 'border-accent ring-4 ring-accent/5 shadow-xl shadow-accent/10' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-accent/20">
                Most Popular
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-display font-bold group-hover:text-accent transition-colors">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                {plan.price !== "Free" && <span className="text-ink/40 text-sm">/mo</span>}
              </div>
            </div>
            <ul className="space-y-4 flex-grow">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-ink/60">
                  <Check className="w-4 h-4 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={onSelect} className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20' : 'bg-muted text-ink hover:bg-accent/5 border border-border hover:border-accent/30'}`}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-display font-bold text-center"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-6">
          {[
            { q: "How many assets are generated per campaign?", a: "Each campaign generation produces a full landing page (HTML/CSS), three Meta ad copy variants, and three detailed creative briefs." },
            { q: "Can I use my own brand colors and logo?", a: "Yes, you can upload your logo and specify brand colors in the campaign builder to ensure consistency." },
            { q: "Do you offer custom AI model training?", a: "For Agency plans, we offer fine-tuning options to match your specific brand voice and historical performance data." },
            { q: "What markets do you support?", a: "While we specialize in West African and Luxury markets, our AI is trained on global CRO best practices and supports international campaigns." }
          ].map((faq, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="saas-card p-6 space-y-2 group hover:border-accent/50 transition-all"
            >
              <h4 className="font-bold group-hover:text-accent transition-colors">{faq.q}</h4>
              <p className="text-sm text-ink/50 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const AppPage = ({ 
  formData, 
  setFormData, 
  loading, 
  error,
  result, 
  activeTab, 
  setActiveTab, 
  previewMode, 
  setPreviewMode, 
  copied, 
  handleInputChange, 
  handleLogoUpload, 
  handleProductImageUpload, 
  generateContent, 
  copyToClipboard,
  downloadHtml,
  openLivePreview
}: any) => (
  <main className="pt-40 pb-20 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* Left Column: Input Form */}
      <div className="lg:col-span-4 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-display font-bold tracking-tight">Create Campaign</h1>
          <p className="text-ink/50 text-sm">Fill in the details to generate your marketing assets.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-6 space-y-6 rounded-2xl"
        >
          <div className="grid grid-cols-2 gap-4">
            <FileUpload label="Logo" onUpload={handleLogoUpload} value={formData.logo} />
            <FileUpload label="Assets" onUpload={handleProductImageUpload} multiple value={formData.productImages} />
          </div>

          <InputField 
            label="Product Name" 
            name="productName" 
            value={formData.productName} 
            onChange={handleInputChange} 
            placeholder="e.g. Acme Elixir" 
          />
          <InputField 
            label="Description" 
            name="whatItDoes" 
            value={formData.whatItDoes} 
            onChange={handleInputChange} 
            placeholder="What does it do?" 
            multiline 
          />
          <InputField 
            label="Key Benefit" 
            name="keyBenefit" 
            value={formData.keyBenefit} 
            onChange={handleInputChange} 
            placeholder="e.g. Feel lighter and more energetic within 7 days" 
          />
          <InputField 
            label="Target Audience" 
            name="targetAudience" 
            value={formData.targetAudience} 
            onChange={handleInputChange} 
            placeholder="e.g. Nigerian women 25–45 dealing with bloating" 
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink/60">Market</label>
              <select 
                name="market" 
                value={formData.market} 
                onChange={handleInputChange}
                className="input-saas appearance-none"
              >
                <option value="Nigerian">NIGERIAN</option>
                <option value="Luxury">LUXURY</option>
                <option value="Wellness">WELLNESS</option>
                <option value="International">INTERNATIONAL</option>
              </select>
            </div>
            <InputField 
              label="Price" 
              name="price" 
              value={formData.price} 
              onChange={handleInputChange} 
              placeholder="e.g. ₦8,500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="WhatsApp Number" 
              name="whatsappNumber" 
              value={formData.whatsappNumber} 
              onChange={handleInputChange} 
              placeholder="e.g. +234..." 
            />
            <InputField 
              label="Email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="e.g. orders@..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Brand Colors" 
              name="brandColors" 
              value={formData.brandColors} 
              onChange={handleInputChange} 
              placeholder="e.g. Deep green + gold" 
            />
            <InputField 
              label="Tone" 
              name="tone" 
              value={formData.tone} 
              onChange={handleInputChange} 
              placeholder="e.g. Warm, trustworthy" 
            />
          </div>

          <InputField 
            label="Special Notes" 
            name="specialNotes" 
            value={formData.specialNotes} 
            onChange={handleInputChange} 
            placeholder="e.g. NAFDAC approved, ships nationwide" 
            multiline
          />

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2"
            >
              <X className="w-3 h-3 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
          
          <button 
            onClick={generateContent}
            disabled={loading || !formData.productName}
            className="btn-saas-primary w-full py-4 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            {loading && <div className="absolute inset-0 animate-shimmer" />}
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Magic...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Generate Campaign Assets</span>
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-8">
        {loading ? (
          <div className="h-full min-h-[600px] glass flex flex-col items-center justify-center p-12 text-center space-y-6 rounded-2xl">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-accent/10 border-t-accent rounded-full animate-spin"></div>
              <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse rounded-full" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-gradient">Generating Campaign</h3>
              <p className="text-ink/40 text-sm">Our AI is crafting your landing page and ad copy...</p>
            </div>
          </div>
        ) : result ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Tabs */}
            <div className="flex items-center justify-between glass p-1.5 rounded-2xl">
              <div className="flex gap-1">
                <TabButton 
                  active={activeTab === 'preview'} 
                  onClick={() => setActiveTab('preview')}
                  icon={<Eye className="w-4 h-4" />}
                  label="Preview"
                />
                <TabButton 
                  active={activeTab === 'code'} 
                  onClick={() => setActiveTab('code')}
                  icon={<Code className="w-4 h-4" />}
                  label="HTML"
                />
                <TabButton 
                  active={activeTab === 'ads'} 
                  onClick={() => setActiveTab('ads')}
                  icon={<Megaphone className="w-4 h-4" />}
                  label="Ad Copy"
                />
                <TabButton 
                  active={activeTab === 'brief'} 
                  onClick={() => setActiveTab('brief')}
                  icon={<Palette className="w-4 h-4" />}
                  label="Briefs"
                />
              </div>
              
              <div className="flex items-center gap-2 pr-2">
                {activeTab === 'preview' && (
                  <div className="flex gap-1 bg-muted p-1 rounded-lg">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-ink' : 'text-ink/40 hover:text-ink'}`}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-ink' : 'text-ink/40 hover:text-ink'}`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => copyToClipboard(activeTab === 'preview' || activeTab === 'code' ? result.landingPage : activeTab === 'ads' ? result.adCopy : result.creativeBrief)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-ink/60 hover:text-ink transition-colors border-r border-border pr-4"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                {(activeTab === 'preview' || activeTab === 'code') && (
                  <>
                    <button 
                      onClick={openLivePreview}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-ink/60 hover:text-ink transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live View
                    </button>
                    <button 
                      onClick={downloadHtml}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="saas-card overflow-hidden min-h-[600px] relative">
              <AnimatePresence mode="wait">
                {activeTab === 'preview' && (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex justify-center bg-muted/30 p-8"
                  >
                    <div 
                      className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden border border-border rounded-xl relative ${previewMode === 'desktop' ? 'w-full' : 'w-[375px]'}`}
                      style={{ height: '800px' }}
                    >
                      <iframe 
                        srcDoc={result.landingPage}
                        className="w-full h-full border-none"
                        title="Landing Page Preview"
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'code' && (
                  <motion.div 
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 h-[600px] overflow-auto bg-ink text-white font-mono text-[13px] leading-relaxed"
                  >
                    <pre className="whitespace-pre-wrap">{result.landingPage}</pre>
                  </motion.div>
                )}

                {activeTab === 'ads' && (
                  <motion.div 
                    key="ads"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-10 space-y-8 overflow-auto max-h-[600px]"
                  >
                    <div className="markdown-body">
                      <Markdown>{result.adCopy}</Markdown>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'brief' && (
                  <motion.div 
                    key="brief"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-10 space-y-8 overflow-auto max-h-[600px]"
                  >
                    <div className="markdown-body">
                      <Markdown>{result.creativeBrief}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <div className="h-full min-h-[600px] saas-card flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Layout className="w-6 h-6 text-ink/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold">No Campaign Generated</h3>
              <p className="text-ink/40 text-sm max-w-xs">Enter your product details and click generate to see your marketing assets here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </main>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg relative ${active ? 'text-white' : 'text-ink/40 hover:text-ink hover:bg-muted'}`}
  >
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute inset-0 bg-accent rounded-lg shadow-lg shadow-accent/30"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
    </span>
  </button>
);
