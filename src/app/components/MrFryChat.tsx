'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAccount } from '../context/AccountContext';
import { createClient } from '@/lib/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────────
type Phase = 'init' | 'location' | 'vibe' | 'food_category' | 'food_specifics' | 'spice_budget' | 'fetching' | 'email' | 'recommendation' | 'refinement';

interface DiscoveryProfile {
  location: string;
  vibe:     string;
  category: string;
  cuisine:  string[];
  spice:    number;
  budget:   number;
  email?:   string;
  refinements: string[];
}

interface Recommendation {
  primary: { 
    name: string; description: string; price: string; chain: string; city: string; area: string; 
    zomato_url?: string; swiggy_url?: string; ubereats_url?: string; doordash_url?: string; grubhub_url?: string; restaurant_url?: string;
  };
  backup:  { 
    name: string; description: string; price: string; chain: string; city: string; area: string; 
    zomato_url?: string; swiggy_url?: string; ubereats_url?: string; doordash_url?: string; grubhub_url?: string; restaurant_url?: string;
  };
  explanation: string; combo: string; 
  mystery?: string | { 
    name: string; description: string; price?: string; chain: string; city: string; area: string; 
    zomato_url?: string; swiggy_url?: string; ubereats_url?: string; doordash_url?: string; grubhub_url?: string; restaurant_url?: string;
  };
  zomato_url?: string;
}

interface ApiResponse {
  message: string;
  recommendation?: Recommendation;
}

const VIBES = [
  { id:'comfort', icon:'🛋️', label:'Cozy & Comfort', desc:'Heavy, warm, soul-soothing' },
  { id:'healthy', icon:'🥗', label:'Fresh & Light', desc:'Clean energy, feeling good' },
  { id:'party',   icon:'🥳', label:'Group Hangout', desc:'Tear-n-share, crowd pleasers' },
  { id:'late',    icon:'🌙', label:'Late Night', desc:'Greasy, wild, completely necessary' },
  { id:'wild',    icon:'🎲', label:'Surprise Me', desc:'Take the wheel, Mr. Fry' }
];

const FOOD_CATEGORIES = [
  { id: 'comfort', label: '🍛 Comfort & Full Meals', options: ['Biryani', 'North Indian', 'South Indian', 'Thali', 'Khichdi', 'Paneer Meals'] },
  { id: 'quick', label: '🥪 Quick Bites & Casual', options: ['Burgers', 'Sandwiches', 'Kathi Rolls', 'Shawarma', 'Pizza', 'Pasta', 'Wraps'] },
  { id: 'street', label: '🛵 Street Food & Snacks', options: ['Chaat', 'Momos', 'Samosa', 'Pav Bhaji', 'Vada Pav', 'Dosa / Idli', 'Paratha'] },
  { id: 'bold', label: '🔥 Bold & Flavor-Heavy', options: ['Kebabs / Tandoori', 'Indo-Chinese', 'Fried Chicken', 'Spicy Bowls', 'Loaded Fries'] },
  { id: 'light', label: '🧋 Sweet & Light Beverage', options: ['Mithai / Desserts', 'Bakery', 'Tea / Coffee', 'Milkshakes', 'Healthy Salads', 'Smoothies'] }
];

const BUDGET_LABELS = ['$', '$$', '$$$'];

// ─── Delivery Buttons Component ────────────────────────────────────────────────
const PLATFORMS = [
  { key: 'zomato_url',     label: 'Order from Zomato',    icon: '🍕', color: '#E23744' },
  { key: 'swiggy_url',     label: 'Order from Swiggy',    icon: '🛵', color: '#FC8019' },
  { key: 'ubereats_url',   label: 'Order from Uber Eats', icon: '🍱', color: '#06C167' },
  { key: 'doordash_url',   label: 'Order from DoorDash',  icon: '🚗', color: '#EB1700' },
  { key: 'grubhub_url',    label: 'Order from Grubhub',   icon: '🍔', color: '#F63440' },
  { key: 'restaurant_url', label: 'Visit Restaurant',     icon: '🔗', color: '#555555' },
];

function DeliveryButtons({ item, small = false }: { item: any, small?: boolean }) {
  const activeLinks = PLATFORMS.filter(p => item[p.key]);
  if (activeLinks.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: small ? '0' : '20px', marginTop: small ? '12px' : '0' }}>
      {activeLinks.map(p => (
        <a 
          key={p.key} 
          href={item[p.key]} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px', 
            padding: small ? '8px 16px' : '12px 24px', 
            background: p.color, 
            borderRadius: '12px', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: small ? '.85rem' : '.95rem', 
            textDecoration: 'none',
            boxShadow: `0 4px 12px ${p.color}44`,
            transition: 'transform 0.2s ease',
            flex: small ? '1 1 auto' : '0 1 auto',
            minWidth: small ? '140px' : '200px',
            textAlign: 'center'
          }}
        >
          {p.icon} {p.label}
        </a>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function MrFryChat() {
  const { user, updateUsage } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isGated, setIsGated] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [phase, setPhase]   = useState<Phase>('init');
  const [profile, setProfile] = useState<DiscoveryProfile>({ location:'', vibe:'', category:'', cuisine:[], spice:5, budget:1, refinements:[] });
  
  // UI State
  const [mrfryText, setMrfryText] = useState('Hey! Give me a few details and I will find your perfect meal.');
  const [emailInput, setEmailInput] = useState('');
  const [textRefinement, setTextRefinement] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loggedRecommendation, setLoggedRecommendation] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  // Auto-scroll: always scroll to top on every phase transition
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  // Load returning profile
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mrfry_discovery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setIsReturning(true);
        // We only persist the email, clear the rest
        setProfile(p => ({ ...p, email: parsed.email }));
      }
    } catch {}
  }, []);

  const openFlow = async () => {
    setIsOpen(true);
    setIsGated(false);
    setLoggedRecommendation(null);
    setPhase('location');

    if (!user) {
      setMrfryText(isReturning ? "Welcome back! 🍟 Ready for round two? Tell me where we are hunting today." : "Yo! 🍔 I'm Mr. Fry. Give me a few details and I'll find your exact craving. Where are you right now?");
      return;
    }

    // Temporarily show a 'thinking' prompt while we securely pull memory
    setMrfryText("Checking my notes...");
    
    let memoryGreeting = '';
    try {
      const sb = createClient();
      const { data: sessionData } = await sb.auth.getSession();
      const token = sessionData.session?.access_token;

      if (token) {
        const res = await fetch('/api/memory', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.interaction) {
            const { user_location, rec_1 } = data.interaction;
            const prevPlace = rec_1 ? rec_1.split(' at ')[0].trim() : 'that spot';
            memoryGreeting = `Welcome back, ${user.name.split(' ')[0]}! 🍟 How was ${prevPlace} over in ${user_location} from last time? Ready for another round? Tell me where we are hunting today.`;
          }
        }
      }
    } catch (err) {
      // Fail gracefully and quietly, never breaking the user experience
    }

    const defaultGreeting = `Hey ${user.name.split(' ')[0]}! 🍔 Ready to find your next craving? Where are you right now?`;
    setMrfryText(memoryGreeting || (isReturning ? "Welcome back! 🍟 Ready for round two? Tell me where we are hunting today." : defaultGreeting));
  };


  const closeChat = () => {
    // Wipe profile state fully upon closing to guarantee the next fresh interaction is unbiased
    setProfile({ location:'', vibe:'', category:'', cuisine:[], spice:5, budget:1, refinements:[] });
    setIsOpen(false);
  };

  useEffect(() => {
    const handler = () => {
      if (!isOpen) {
        if (!user) {
          // Not signed in — show gate
          setIsGated(true);
          setIsOpen(true);
        } else {
          openFlow();
        }
      }
    };
    window.addEventListener('mrfry:open', handler);
    return () => window.removeEventListener('mrfry:open', handler);
  }, [isOpen, isReturning, user]);

  // ─── Navigation Handlers ─────────────────────────────────────────────────────
  const nextStep = (next: Phase, fryMsg: string) => {
    setPhase(next);
    setMrfryText(fryMsg);
  };

  const handleLocationSubmit = (val: string) => {
    if (!val.trim()) return;
    setProfile(p => ({ ...p, location: val.trim() }));
    nextStep('vibe', `Got it, exploring ${val.trim()}. What's the exact vibe you're feeling right now?`);
  };

  const selectVibe = (v: string) => {
    setProfile(p => ({ ...p, vibe: v }));
    nextStep('food_category', `Oh yeah, definitely feeling that. What broad style of food are you leaning towards?`);
  };

  const selectCategory = (catId: string) => {
    setProfile(p => ({ ...p, category: catId, cuisine: [] }));
    nextStep('food_specifics', `Got it. Any specific cravings within that, or should I keep it completely open?`);
  };

  const toggleCuisine = (c: string) => {
    setProfile(p => {
      const isSelected = p.cuisine.includes(c);
      const updated = isSelected ? p.cuisine.filter(x => x !== c) : [...p.cuisine, c];
      return { ...p, cuisine: updated };
    });
  };

  const submitCuisine = () => {
    nextStep('spice_budget', "Nice picks. Let's talk specifics: how much heat can you handle, and what's the wallet looking like?");
  };

  const submitDetails = async () => {
    // Check usage limit before firing a new recommendation (refinements skip this)
    if (user?.email) {
      try {
        const res = await fetch('/api/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, increment: false }),
        });
        const usage = await res.json();
        if (usage.allowed === false) {
          setIsLimitReached(true);
          return;
        }
        // We do NOT update the counter context yet; wait until generation succeeds.
      } catch {
        // Fail open — don’t block the user on a network error
      }
    }
    triggerSearch();
  };

  const handleEmail = (skip: boolean) => {
    if (!skip && emailInput.trim()) {
      setProfile(p => {
        const up = { ...p, email: emailInput.trim() };
        localStorage.setItem('mrfry_discovery', JSON.stringify({ email: up.email }));
        triggerSearch(false, up);
        return up;
      });
    } else {
      triggerSearch();
    }
  };

  const triggerSearch = async (isRefinement = false, explicitProfile?: DiscoveryProfile) => {
    if (phase === 'fetching') return; // Prevent duplicate API calls
    setPhase('fetching');
    setMrfryText(isRefinement 
      ? "Hold on, recalibrating the parameters... digging back into the grid." 
      : "Locking coordinates. Analyzing local menus. Calculating the absolute best bite..."
    );

    const activeProfile = explicitProfile || profile;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: activeProfile }),
      });
      const data: ApiResponse = await res.json();
      
      if (data.recommendation) {
        setRecommendation(data.recommendation);

        // --- NEW: Robust Interaction Logging ---
        // We trigger logging IMMEDIATELY when a recommendation is reached.
        // This ensures the memory is saved even if the user closes the browser/tab
        // without clicking the 'X' button.
        if (user?.email) {
          const rec1 = data.recommendation.primary.name + (data.recommendation.primary.chain ? ` at ${data.recommendation.primary.chain}` : '');
          const rec2 = data.recommendation.backup.name + (data.recommendation.backup.chain ? ` at ${data.recommendation.backup.chain}` : '');
          let rec3 = null;
          if (data.recommendation.mystery) {
            if (typeof data.recommendation.mystery === 'string') {
              rec3 = data.recommendation.mystery;
            } else if (data.recommendation.mystery.name) {
              rec3 = data.recommendation.mystery.name + (data.recommendation.mystery.chain ? ` at ${data.recommendation.mystery.chain}` : '');
            }
          }

          const sb = createClient();
          sb.auth.getSession().then(({ data: sessionData }) => {
            const token = sessionData.session?.access_token;
            if (token) {
              fetch('/api/interaction', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                  email: user.email,
                  location: activeProfile.location,
                  rec_1: rec1,
                  rec_2: rec2,
                  rec_3: rec3
                })
              }).catch(() => {});
            }
          });
        }

        // Increment usage ONLY upon successful generation for initial requests
        if (!isRefinement && user?.email) {
          fetch('/api/usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, increment: true }),
          })
          .then(usageRes => usageRes.json())
          .then(usageData => {
            if (typeof usageData.used === 'number') {
              updateUsage(usageData.used);
            }
          })
          .catch(() => {}); // silent fail if tracking drops, user still gets their recommendation
        }

        setMrfryText(data.message || (isRefinement ? "Here we go—how about this instead?" : "Boom. The exact match has been located."));
        setPhase('recommendation');
      } else {
        throw new Error('No recommendation returned');
      }
    } catch {
      setMrfryText("Whoops. Had a tiny system glitch. Give it another shot?");
      setPhase(isRefinement ? 'recommendation' : 'location'); // Go back
    }
  };

  const addRefinement = (txt: string) => {
    if (!txt.trim()) return;
    const cleanTxt = txt.trim();
    setProfile(p => {
      const up = { ...p, refinements: [...p.refinements, cleanTxt] };
      // Pass the fully updated profile clone explicitly to avoid stale React closure state during the API request
      setTimeout(() => triggerSearch(true, up), 0);
      return up;
    });
    setTextRefinement('');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  // ─── Auth Gate Panel
  if (isGated) return (
    <>
      <div onClick={() => setIsOpen(false)} style={{ position:'fixed', inset:0, zIndex:1998, background:'rgba(0,0,0,.75)', backdropFilter:'blur(5px)', animation:'fadeIn .2s ease' }} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(460px, 100vw)', zIndex:1999, background:'rgba(7,8,16,.98)', borderLeft:'1px solid rgba(255,107,0,.25)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 28px', animation:'slideInRight .35s cubic-bezier(.22,1,.36,1)', textAlign:'center' }}>
        <button onClick={() => setIsOpen(false)} style={{ position:'absolute', top:'20px', right:'20px', background:'rgba(255,255,255,.05)', border:'none', color:'rgba(255,255,255,.5)', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer' }}>✕</button>
        <div style={{ fontSize:'4rem', marginBottom:'24px' }}>🍔</div>
        <div style={{ position:'relative', width:'72px', height:'72px', marginBottom:'24px' }}>
          <div style={{ position:'absolute', inset:'-4px', borderRadius:'50%', background:'conic-gradient(from 0deg, #FF6B00, #FF2020, #00D4FF, #FF6B00)', animation:'spin-slow 3s linear infinite' }} />
          <Image src="/mrfry.png" alt="Mr. Fry" fill style={{ borderRadius:'50%', objectFit:'cover', border:'2px solid #070810', zIndex:2 }} />
        </div>
        <h2 style={{ fontSize:'1.5rem', fontWeight:900, marginBottom:'12px', lineHeight:1.2 }}>Sign up to unlock<br/>Mr. Fry ✨</h2>
        <p style={{ color:'rgba(255,255,255,.5)', lineHeight:1.6, marginBottom:'32px', fontSize:'.95rem' }}>Create a free Cravexo account to start your personalized food discovery experience.</p>
        <button
          onClick={() => { setIsOpen(false); window.dispatchEvent(new CustomEvent('cravexo:signup')); }}
          style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg, #FF6B00, #FF2020)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:800, fontSize:'1rem', cursor:'pointer', boxShadow:'0 8px 30px rgba(255,107,0,.35)', fontFamily:'Outfit, sans-serif', marginBottom:'12px' }}
        >
          Create Free Account →
        </button>
        <button onClick={() => setIsOpen(false)} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,.35)', cursor:'pointer', fontSize:'.85rem' }}>Maybe later</button>
      </div>
    </>
  );

  // ─── Usage Limit Reached Panel
  if (isLimitReached) return (
    <>
      <div onClick={() => setIsOpen(false)} style={{ position:'fixed', inset:0, zIndex:1998, background:'rgba(0,0,0,.8)', backdropFilter:'blur(5px)', animation:'fadeIn .2s ease' }} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(460px, 100vw)', zIndex:1999, background:'rgba(7,8,16,.98)', borderLeft:'1px solid rgba(255,32,32,.25)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 28px', animation:'slideInRight .35s cubic-bezier(.22,1,.36,1)', textAlign:'center' }}>
        <button onClick={() => { setIsOpen(false); setIsLimitReached(false); }} style={{ position:'absolute', top:'20px', right:'20px', background:'rgba(255,255,255,.05)', border:'none', color:'rgba(255,255,255,.5)', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer' }}>✕</button>
        <div style={{ fontSize:'3.5rem', marginBottom:'20px' }}>🍽️</div>
        <h2 style={{ fontSize:'1.5rem', fontWeight:900, marginBottom:'12px', lineHeight:1.2, color:'#fff' }}>Monthly limit reached</h2>
        <p style={{ color:'rgba(255,255,255,.5)', lineHeight:1.7, marginBottom:'8px', fontSize:'.95rem' }}>You&apos;ve used all your Mr. Fry interactions for this month.</p>
        <p style={{ color:'rgba(255,255,255,.35)', lineHeight:1.6, marginBottom:'32px', fontSize:'.85rem' }}>Upgrade your plan to keep exploring food with Mr. Fry.</p>
        <button
          onClick={() => { setIsOpen(false); setIsLimitReached(false); window.dispatchEvent(new CustomEvent('cravexo:subscription')); }}
          style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg, #FF6B00, #FF2020)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:800, fontSize:'1rem', cursor:'pointer', boxShadow:'0 8px 30px rgba(255,107,0,.3)', fontFamily:'Outfit, sans-serif', marginBottom:'12px' }}
        >
          ⭐ View Upgrade Plans
        </button>
        <button onClick={() => { setIsOpen(false); setIsLimitReached(false); }} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,.35)', cursor:'pointer', fontSize:'.85rem' }}>Back</button>
      </div>
    </>
  );

  return (
    <>
      <div onClick={closeChat} style={{ position:'fixed', inset:0, zIndex:1998, background:'rgba(0,0,0,.75)', backdropFilter:'blur(5px)', animation:'fadeIn .2s ease' }} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(460px, 100vw)', zIndex:1999, background:'rgba(7,8,16,.98)', borderLeft:'1px solid rgba(255,107,0,.25)', display:'flex', flexDirection:'column', animation:'slideInRight .35s cubic-bezier(.22,1,.36,1)', boxShadow:'-20px 0 80px rgba(0,0,0,.6)' }}>
        
        {/* TOP: MR. FRY CONVERSATIONAL LAYER */}
        <div style={{ padding:'24px 20px', background:'linear-gradient(180deg, rgba(12,14,26,1) 0%, rgba(12,14,26,0.95) 100%)', borderBottom:'1px solid rgba(255,107,0,.15)', display:'flex', flexDirection:'column', gap:'16px', position:'relative', zIndex:10 }}>
          <button onClick={closeChat} style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,255,255,.05)', border:'none', color:'rgba(255,255,255,.5)', width:'28px', height:'28px', borderRadius:'50%', cursor:'pointer' }}>✕</button>
          
          <div style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}>
            <div style={{ position:'relative', width:'54px', height:'54px', flexShrink:0 }}>
              <div style={{ position:'absolute', inset:'-3px', borderRadius:'50%', background:'conic-gradient(from 0deg, #FF6B00, #FF2020, #00D4FF, #FF6B00)', animation:'spin-slow 3s linear infinite', opacity: phase==='fetching' ? 1: 0.3 }} />
              <Image src="/mrfry.png" alt="Mr. Fry" fill style={{ borderRadius:'50%', objectFit:'cover', border:'2px solid #070810', zIndex:2 }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                <span style={{ fontWeight:800, fontSize:'1rem' }}>Mr. Fry</span>
                {phase==='fetching' && <span style={{ fontSize:'.65rem', color:'#00FF88', background:'rgba(0,255,136,.1)', padding:'2px 8px', borderRadius:'10px' }}>● Processing</span>}
              </div>
              
              {/* Dynamic Speech Bubble */}
              <div style={{ background:'rgba(255,107,0,.08)', border:'1px solid rgba(255,107,0,.2)', borderRadius:'0 16px 16px 16px', padding:'12px 14px', position:'relative', animation:'floatBubble 4s ease-in-out infinite' }}>
                <p style={{ fontSize:'.9rem', color:'rgba(255,255,255,.9)', lineHeight:1.5 }}>
                  {mrfryText}
                </p>
                {/* Tail pointer */}
                <div style={{ position:'absolute', top:0, left:'-8px', width:0, height:0, borderTop:'10px solid rgba(255,107,0,.08)', borderLeft:'10px solid transparent' }} />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: INTERACTIVE STAGE */}
        <div ref={contentRef} style={{ flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column' }}>
          
          {phase === 'location' && (
            <div style={{ animation:'slideUpFade 0.4s ease' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'16px', color:'#fff' }}>Step 1: City / Area</h3>
              <input 
                autoFocus id="loc-input" type="text" placeholder="e.g. Bandra, Mumbai · Koramangala, Bangalore · Delhi NCR" 
                onKeyDown={e => e.key==='Enter' && handleLocationSubmit(e.currentTarget.value)}
                style={{ width:'100%', padding:'16px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.15)', borderRadius:'12px', color:'#fff', fontSize:'1rem', fontFamily:'Outfit', outline:'none', marginBottom:'12px' }}
                onFocus={(e)=>e.target.style.borderColor='#FF6B00'} onBlur={(e)=>e.target.style.borderColor='rgba(255,255,255,.15)'}
              />
              <button 
                onClick={() => handleLocationSubmit((document.getElementById('loc-input') as HTMLInputElement).value)}
                style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg, #FF6B00, #FF2020)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'1rem', cursor:'pointer' }}
              >Set Location →</button>
            </div>
          )}

          {phase === 'vibe' && (
            <div style={{ animation:'slideUpFade 0.4s ease' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'16px', color:'#fff' }}>Step 2: The Vibe</h3>
              <div style={{ display:'grid', gap:'12px' }}>
                {VIBES.map(v => (
                  <button key={v.id} onClick={() => selectVibe(v.id)} className="vibe-card"
                    style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'16px', cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontSize:'2rem', background:'rgba(255,255,255,.05)', width:'56px', height:'56px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px' }}>
                      {v.icon}
                    </span>
                    <div>
                      <h4 style={{ fontSize:'1rem', color:'#fff', fontWeight:700, marginBottom:'4px' }}>{v.label}</h4>
                      <p style={{ fontSize:'.8rem', color:'rgba(255,255,255,.5)' }}>{v.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'food_category' && (
            <div style={{ animation:'slideUpFade 0.4s ease' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'16px', color:'#fff' }}>Step 3: Food Format</h3>
              <div style={{ display:'grid', gap:'12px', marginBottom:'24px' }}>
                {FOOD_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => selectCategory(cat.id)}
                    style={{ padding:'18px 20px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'16px', color:'#fff', fontWeight:700, fontSize:'1.05rem', cursor:'pointer', textAlign:'left', transition:'all .2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor='#00D4FF')} onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,.1)')}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'food_specifics' && (
            <div style={{ animation:'slideUpFade 0.4s ease' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'8px', color:'#fff' }}>Step 3.5: Specific Cravings</h3>
              <p style={{ fontSize:'.85rem', color:'rgba(255,255,255,.5)', marginBottom:'20px' }}>Select any that catch your eye, or skip to keep it completely open.</p>
              
              <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'32px' }}>
                {FOOD_CATEGORIES.find(c => c.id === profile.category)?.options.map(c => {
                  const active = profile.cuisine.includes(c);
                  return (
                    <button key={c} onClick={() => toggleCuisine(c)}
                      style={{ padding:'10px 18px', background: active ? 'rgba(0,212,255,.15)' : 'rgba(255,255,255,.03)', border: `1px solid ${active ? '#00D4FF' : 'rgba(255,255,255,.1)'}`, borderRadius:'30px', color: active ? '#00D4FF' : 'rgba(255,255,255,.6)', fontWeight:600, fontSize:'.9rem', cursor:'pointer', transition:'all .2s' }}>
                      {active ? '✓ ' : ''}{c}
                    </button>
                  );
                })}
              </div>
              <button onClick={submitCuisine} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg, #FF6B00, #FF2020)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'1rem', cursor:'pointer' }}>Continue →</button>
            </div>
          )}

          {phase === 'spice_budget' && (
            <div style={{ animation:'slideUpFade 0.4s ease' }}>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'24px', color:'#fff' }}>Step 4: The Details</h3>
              
              {/* Spice */}
              <div style={{ marginBottom:'40px', background:'rgba(255,32,32,.04)', border:'1px solid rgba(255,32,32,.15)', padding:'24px', borderRadius:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
                  <span style={{ fontWeight:700, color:'#FF6B00' }}>Spice Level</span>
                  <span style={{ color:'rgba(255,255,255,.5)', fontSize:'.9rem' }}>{profile.spice}/10</span>
                </div>
                <input type="range" min="0" max="10" value={profile.spice} onChange={e => setProfile({...profile, spice: parseInt(e.target.value)})} className="spice-slider" />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px', fontSize:'.75rem', color:'rgba(255,255,255,.4)', textTransform:'uppercase', fontWeight:600 }}>
                  <span>Zero Heat</span><span>Burn My Face</span>
                </div>
              </div>

              {/* Budget */}
              <div style={{ marginBottom:'40px' }}>
                <span style={{ fontWeight:700, color:'#00D4FF', display:'block', marginBottom:'16px' }}>Target Budget</span>
                <div style={{ display:'flex', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'12px', padding:'6px' }}>
                  {BUDGET_LABELS.map((b, i) => {
                    const isActive = profile.budget === i+1;
                    return (
                      <button key={b} onClick={()=>setProfile({...profile, budget:i+1})}
                        style={{ flex:1, padding:'12px', background: isActive ? 'rgba(0,212,255,.15)' : 'transparent', border:'none', borderRadius:'8px', color: isActive ? '#00D4FF' : 'rgba(255,255,255,.4)', fontWeight:700, fontSize:'1.1rem', cursor:'pointer', transition:'all .2s' }}>
                        {b}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button onClick={submitDetails} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg, #FF6B00, #FF2020)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'1rem', cursor:'pointer', boxShadow:'0 8px 30px rgba(255,107,0,0.3)' }}>Generate Recommendation ⚡</button>
            </div>
          )}

          {phase === 'email' && (
            <div style={{ animation:'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <div style={{ background:'rgba(255,215,0,.05)', border:'1px solid rgba(255,215,0,.2)', padding:'32px', borderRadius:'20px', textAlign:'center' }}>
                <span style={{ fontSize:'3rem', display:'block', marginBottom:'16px' }}>✨</span>
                <h3 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:'12px' }}>Save Your Taste Profile</h3>
                <p style={{ color:'rgba(255,255,255,.6)', fontSize:'.9rem', lineHeight:1.6, marginBottom:'24px' }}>Let me remember your vibe. No spam, just smarter discovery next time you're hungry.</p>
                
                <input type="email" value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="your@email.com"
                  style={{ width:'100%', padding:'16px', background:'rgba(0,0,0,.3)', border:'1px solid rgba(255,255,255,.15)', borderRadius:'10px', color:'#fff', fontSize:'1rem', fontFamily:'Outfit', textAlign:'center', outline:'none', marginBottom:'12px' }} />
                
                <button onClick={() => handleEmail(false)} disabled={!emailInput}
                  style={{ width:'100%', padding:'14px', background: emailInput ? '#FFD700' : 'rgba(255,255,255,.05)', border:'none', borderRadius:'10px', color: emailInput ? '#000' : 'rgba(255,255,255,.3)', fontWeight:800, fontSize:'1rem', cursor: emailInput?'pointer':'not-allowed', marginBottom:'12px' }}>Save & See Food 🚀</button>
                
                <button onClick={() => handleEmail(true)} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,.4)', fontSize:'.85rem', cursor:'pointer', textDecoration:'underline' }}>I don't care, just feed me</button>
              </div>
            </div>
          )}

          {phase === 'fetching' && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, animation:'fadeIn .3s ease' }}>
              <div style={{ width:'80px', height:'80px', borderRadius:'50%', border:'4px solid rgba(0,212,255,.1)', borderTopColor:'#00D4FF', animation:'spin-slow 1s linear infinite', marginBottom:'24px' }} />
              <p style={{ color:'#00D4FF', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', animation:'pulse-glow 1.5s ease-in-out infinite' }}>Analyzing Real-World Data</p>
            </div>
          )}

          {(phase === 'recommendation' || phase === 'refinement') && recommendation && (
            <div style={{ animation:'slideUpFade 0.4s ease' }}>
              
              {/* Grand Reveal Card */}
              <div style={{ background:'linear-gradient(135deg, rgba(12,14,26,1) 0%, rgba(30,15,5,1) 100%)', border:'1px solid rgba(255,107,0,.4)', borderRadius:'20px', padding:'24px', boxShadow:'0 20px 60px rgba(255,107,0,.15)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:'-50%', right:'-50%', width:'100%', height:'100%', background:'radial-gradient(circle, rgba(255,107,0,0.1), transparent)', pointerEvents:'none' }} />
                
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                  <span style={{ fontSize:'.7rem', fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'#FFD700', background:'rgba(255,215,0,.1)', border:'1px solid rgba(255,215,0,.3)', padding:'4px 12px', borderRadius:'20px' }}>🎯 Primary Target</span>
                  <span style={{ fontWeight:800, color:'#fff', background:'rgba(255,255,255,.1)', padding:'4px 10px', borderRadius:'8px' }}>{recommendation.primary.price}</span>
                </div>
                
                <h2 style={{ fontSize:'1.8rem', fontWeight:900, lineHeight:1.1, marginBottom:'6px', color:'#fff' }}>{recommendation.primary.name}</h2>
                <p style={{ color:'#FF6B00', fontWeight:600, fontSize:'.9rem', marginBottom:'16px' }}>📍 {recommendation.primary.chain} in {recommendation.primary.area ? `${recommendation.primary.area}, ` : ''}{recommendation.primary.city || profile.location}</p>
                <p style={{ color:'rgba(255,255,255,.7)', lineHeight:1.7, fontSize:'.95rem', marginBottom:'20px' }}>{recommendation.primary.description}</p>
                
                <DeliveryButtons item={recommendation.primary} />
                
                {recommendation.combo && (
                  <div style={{ background:'rgba(255,255,255,.03)', padding:'12px', borderRadius:'10px', borderLeft:'3px solid #00D4FF', marginBottom:'20px' }}>
                    <p style={{ fontSize:'.85rem', color:'rgba(255,255,255,.8)' }}>{recommendation.combo}</p>
                  </div>
                )}
                
                <div style={{ borderTop:'1px solid rgba(255,255,255,.05)', paddingTop:'16px' }}>
                  <p style={{ fontSize:'.75rem', fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', marginBottom:'6px' }}>Why this matches you:</p>
                  <p style={{ fontSize:'.85rem', color:'rgba(0,212,255,.8)', lineHeight:1.5 }}>"{recommendation.explanation}"</p>
                </div>
              </div>

              {/* Extras Grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'16px', marginTop:'16px' }}>
                <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', padding:'16px', borderRadius:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'.65rem', fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase' }}>🥈 Solid Backup</span>
                    {recommendation.backup.price && (
                      <span style={{ fontSize:'.75rem', fontWeight:800, color:'#fff', background:'rgba(255,255,255,.1)', padding:'2px 8px', borderRadius:'6px' }}>{recommendation.backup.price}</span>
                    )}
                  </div>
                  <p style={{ fontWeight:700, fontSize:'1rem' }}>{recommendation.backup.name} <span style={{ color:'rgba(255,255,255,.4)', fontSize:'.8rem' }}>at {recommendation.backup.chain}</span></p>
                  <p style={{ fontSize:'.8rem', color:'rgba(255,255,255,.5)', marginTop:'4px', marginBottom:'4px' }}>{recommendation.backup.description}</p>
                  <span style={{ fontSize:'.75rem', color:'#FF6B00' }}>📍 {recommendation.backup.area ? `${recommendation.backup.area}, ` : ''}{recommendation.backup.city}</span>
                  <DeliveryButtons item={recommendation.backup} small />
                </div>
                {recommendation.mystery && (
                  <div style={{ background:'rgba(155,89,182,.05)', border:'1px solid rgba(155,89,182,.2)', padding:'16px', borderRadius:'16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                      <span style={{ fontSize:'.65rem', fontWeight:700, color:'#C896FF', textTransform:'uppercase' }}>🎲 Wildcard Alert</span>
                      {typeof recommendation.mystery !== 'string' && recommendation.mystery.price && (
                        <span style={{ fontSize:'.75rem', fontWeight:800, color:'#fff', background:'rgba(155,89,182,.2)', padding:'2px 8px', borderRadius:'6px' }}>{recommendation.mystery.price}</span>
                      )}
                    </div>
                    <div style={{ lineHeight:1.5 }}>
                      {typeof recommendation.mystery === 'string' ? (
                        <p style={{ fontSize:'.85rem', color:'rgba(255,255,255,.7)' }}>{recommendation.mystery}</p>
                      ) : (
                        <>
                          <p style={{ fontWeight:700, fontSize:'1rem', color:'#fff', marginBottom:'4px' }}>
                            {recommendation.mystery.name} <span style={{ color:'rgba(255,255,255,.4)', fontSize:'.8rem', fontWeight:500 }}>at {recommendation.mystery.chain}</span>
                          </p>
                          <p style={{ fontSize:'.85rem', color:'rgba(255,255,255,.7)', marginBottom:'6px' }}>{recommendation.mystery.description}</p>
                          <span style={{ fontSize:'.75rem', color:'#FF6B00', fontWeight:600 }}>📍 {recommendation.mystery.area ? `${recommendation.mystery.area}, ` : ''}{recommendation.mystery.city}</span>
                          <DeliveryButtons item={recommendation.mystery} small />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* BOTTOM: REFINEMENT & NAVIGATION DOCK */}
        {(phase === 'recommendation' || phase === 'refinement') && (
          <div style={{ padding:'20px', background:'rgba(7,8,16,.98)', borderTop:'1px solid rgba(255,255,255,.05)', boxShadow:'0 -10px 40px rgba(0,0,0,.5)', animation:'slideUpFade 0.4s ease 0.2s both' }}>
            <p style={{ fontSize:'.75rem', fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', marginBottom:'12px' }}>Not quite right? Refine it:</p>
            
            <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'12px', scrollbarWidth:'none' }} className="chat-scroll">
              {['Make it Veg 🌱', 'More Street-Food Energy 🛵', 'Make it a Combo 🍛', 'Different Area', 'Go Wild'].map(r => (
                <button key={r} onClick={()=>addRefinement(r)} style={{ whiteSpace:'nowrap', padding:'8px 14px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'20px', color:'rgba(255,255,255,.7)', fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>{r}</button>
              ))}
            </div>
            
            <div style={{ display:'flex', gap:'8px' }}>
              <input type="text" value={textRefinement} onChange={e=>setTextRefinement(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addRefinement(textRefinement)} placeholder="Type specific tweak..." style={{ flex:1, background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'10px', padding:'10px 14px', color:'#fff', fontSize:'.85rem', outline:'none' }} />
              <button disabled={!textRefinement.trim()} onClick={()=>addRefinement(textRefinement)} style={{ padding:'0 16px', background: textRefinement.trim() ? '#FF6B00' : 'rgba(255,255,255,.05)', border:'none', borderRadius:'10px', color:textRefinement.trim()?'#000':'rgba(255,255,255,.3)', fontWeight:700 }}>➔</button>
            </div>

            <button onClick={()=>{setProfile({ location:'', vibe:'', category:'', cuisine:[], spice:5, budget:1, refinements:[] }); openFlow();}} style={{ width:'100%', marginTop:'16px', padding:'12px', background:'transparent', border:'1px dashed rgba(255,255,255,.15)', borderRadius:'10px', color:'rgba(255,255,255,.5)', fontSize:'.85rem', cursor:'pointer' }}>🔄 Start Over Completely</button>
          </div>
        )}

      </div>
    </>
  );
}
