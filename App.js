import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TextInput, Animated, Easing, Modal,
  Linking, Alert, Share,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://omqjsdpacpfzmjvovfew.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcWpzZHBhY3Bmem1qdm92ZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjc2MDksImV4cCI6MjA5MDY0MzYwOX0.zi1-lLSJLl2w-EUorT8hr-sBpy0EUA-PAwtldhnTbvM');

const BELLA_API_KEY = 'sk-ant-api03-k0zoDpjSMzMKCXzFNOOWVtFcFRFiCje4mr8JbN2Oc3uhLbeUGKiUA3ZETC1nP6iaoHNdpneY5SILRgZIbNhc-Q-7Vq9KgAA';

const TODAY = new Date();
const CYCLE_START = new Date(TODAY);
CYCLE_START.setDate(TODAY.getDate() - 13);
const CYCLE_DAY = Math.floor((TODAY - CYCLE_START) / (1000 * 60 * 60 * 24)) + 1;
const CYCLE_LENGTH = 28;
const FERTILE_START = 11;
const FERTILE_END = 16;
const OVULATION_DAY = 14;
const isFertile = CYCLE_DAY >= FERTILE_START && CYCLE_DAY <= FERTILE_END;
const daysUntilPeriod = CYCLE_LENGTH - CYCLE_DAY;

const TRANSLATIONS = {
  en: {
    appName: 'Bellava', tagline: "Your AI Women's Health Companion",
    home: 'Home', tracker: 'Tracker', bella: 'Bella', community: 'Community', profile: 'Profile',
    goodMorning: 'Good morning 🌸', hello: 'Hello',
    cycleDay: 'CYCLE DAY', fertile: 'FERTILE', next: 'NEXT', window: 'window', period: 'period',
    chatWithBella: 'Chat with Bella', startChatting: 'Start chatting →',
    todaysTip: "Today's tip", quickActions: 'Quick actions',
    symptomChecker: 'Symptom Checker', careFinder: 'Care Finder',
    partnerMode: 'Partner Mode', nutrition: 'Nutrition Planner',
    babyNames: 'Baby Names', intimacy: 'Intimacy Health',
    signOut: 'Sign Out', upgrade: 'Upgrade to Pro 👑',
    save: 'Save', cancel: 'Cancel', back: '← Back',
    signOutConfirm: 'Are you sure you want to sign out?',
    getStarted: "Get started — it's free 💕",
    alreadyHaveAccount: 'I already have an account',
    bellaLanguage: 'en',
    bellaSystemPrompt: 'You are Bella, a warm knowledgeable and professional AI women\'s health nurse assistant inside the Bellava app created by Reine Mande. You specialise in women\'s health reproductive health fertility pregnancy postpartum care and general wellness. Be warm caring and empathetic. Give detailed helpful medical information. Always remind users to consult their GP or midwife. Never diagnose conditions. For emergencies direct to call 999 or go to A&E. Always respond in English.',
  },
  fr: {
    appName: 'Bellava', tagline: 'Votre compagne santé IA',
    home: 'Accueil', tracker: 'Suivi', bella: 'Bella', community: 'Communauté', profile: 'Profil',
    goodMorning: 'Bonjour 🌸', hello: 'Bonjour',
    cycleDay: 'JOUR CYCLE', fertile: 'FERTILE', next: 'PROCHAIN', window: 'fenêtre', period: 'règles',
    chatWithBella: 'Chatter avec Bella', startChatting: 'Commencer →',
    todaysTip: 'Conseil du jour', quickActions: 'Actions rapides',
    symptomChecker: 'Symptômes', careFinder: 'Trouver soins',
    partnerMode: 'Mode partenaire', nutrition: 'Nutrition',
    babyNames: 'Prénoms bébé', intimacy: 'Santé intime',
    signOut: 'Se déconnecter', upgrade: 'Passer au Pro 👑',
    save: 'Sauvegarder', cancel: 'Annuler', back: '← Retour',
    signOutConfirm: 'Voulez-vous vraiment vous déconnecter?',
    getStarted: 'Commencer gratuitement 💕',
    alreadyHaveAccount: "J'ai déjà un compte",
    bellaLanguage: 'fr',
    bellaSystemPrompt: 'Tu es Bella, une infirmière IA chaleureuse et professionnelle dans l\'application Bellava créée par Reine Mande. Tu te spécialises dans la santé féminine, la fertilité, la grossesse et le post-partum. Sois chaleureuse et empathique. Donne des informations médicales détaillées et utiles. Rappelle toujours aux utilisatrices de consulter leur médecin. Ne pose jamais de diagnostic. Pour les urgences, dirige vers le 15 ou les urgences. Réponds toujours en français.',
  },
  ar: {
    appName: 'بيلافا', tagline: 'رفيقتك الذكية لصحة المرأة',
    home: 'الرئيسية', tracker: 'التتبع', bella: 'بيلا', community: 'المجتمع', profile: 'الملف',
    goodMorning: 'صباح الخير 🌸', hello: 'مرحباً',
    cycleDay: 'يوم الدورة', fertile: 'الخصوبة', next: 'القادم', window: 'نافذة', period: 'الدورة',
    chatWithBella: 'تحدث مع بيلا', startChatting: 'ابدأ المحادثة →',
    todaysTip: 'نصيحة اليوم', quickActions: 'إجراءات سريعة',
    symptomChecker: 'فاحص الأعراض', careFinder: 'ابحث عن رعاية',
    partnerMode: 'وضع الشريك', nutrition: 'التغذية',
    babyNames: 'أسماء الأطفال', intimacy: 'صحة العلاقات',
    signOut: 'تسجيل الخروج', upgrade: 'ترقية للبرو 👑',
    save: 'حفظ', cancel: 'إلغاء', back: '→ رجوع',
    signOutConfirm: 'هل أنت متأكد من تسجيل الخروج؟',
    getStarted: 'ابدأ مجاناً 💕',
    alreadyHaveAccount: 'لدي حساب بالفعل',
    bellaLanguage: 'ar',
    bellaSystemPrompt: 'أنتِ بيلا، ممرضة ذكاء اصطناعي دافئة ومحترفة في تطبيق بيلافا الذي أنشأته Reine Mande. متخصصة في صحة المرأة والخصوبة والحمل وما بعد الولادة. كوني دافئة ومتعاطفة. قدمي معلومات طبية مفصلة ومفيدة. ذكري دائماً المستخدمات بضرورة استشارة الطبيب. لا تشخصي أبداً. للطوارئ، وجهي للاتصال بالإسعاف. أجيبي دائماً باللغة العربية.',
  },
  es: {
    appName: 'Bellava', tagline: 'Tu compañera de salud femenina con IA',
    home: 'Inicio', tracker: 'Seguimiento', bella: 'Bella', community: 'Comunidad', profile: 'Perfil',
    goodMorning: 'Buenos días 🌸', hello: 'Hola',
    cycleDay: 'DÍA CICLO', fertile: 'FÉRTIL', next: 'PRÓXIMO', window: 'ventana', period: 'periodo',
    chatWithBella: 'Chatear con Bella', startChatting: 'Empezar →',
    todaysTip: 'Consejo de hoy', quickActions: 'Acciones rápidas',
    symptomChecker: 'Síntomas', careFinder: 'Buscar clínica',
    partnerMode: 'Modo pareja', nutrition: 'Nutrición',
    babyNames: 'Nombres bebé', intimacy: 'Salud íntima',
    signOut: 'Cerrar sesión', upgrade: 'Mejorar a Pro 👑',
    save: 'Guardar', cancel: 'Cancelar', back: '← Atrás',
    signOutConfirm: '¿Estás segura de que quieres cerrar sesión?',
    getStarted: 'Empezar gratis 💕',
    alreadyHaveAccount: 'Ya tengo una cuenta',
    bellaLanguage: 'es',
    bellaSystemPrompt: 'Eres Bella, una enfermera IA cálida y profesional dentro de la aplicación Bellava creada por Reine Mande. Te especializas en salud femenina, fertilidad, embarazo y posparto. Sé cálida y empática. Da información médica detallada y útil. Recuerda siempre a las usuarias consultar a su médico. Nunca diagnostiques. Para emergencias, dirige al 112. Responde siempre en español.',
  },
  de: {
    appName: 'Bellava', tagline: 'Deine KI-Gesundheitsbegleiterin',
    home: 'Startseite', tracker: 'Tracker', bella: 'Bella', community: 'Community', profile: 'Profil',
    goodMorning: 'Guten Morgen 🌸', hello: 'Hallo',
    cycleDay: 'ZYKLUSTAG', fertile: 'FRUCHTBAR', next: 'NÄCHSTE', window: 'Fenster', period: 'Periode',
    chatWithBella: 'Mit Bella chatten', startChatting: 'Starten →',
    todaysTip: 'Tipp des Tages', quickActions: 'Schnellaktionen',
    symptomChecker: 'Symptom-Checker', careFinder: 'Klinik finden',
    partnerMode: 'Partner-Modus', nutrition: 'Ernährungsplaner',
    babyNames: 'Babynamen', intimacy: 'Intimgesundheit',
    signOut: 'Abmelden', upgrade: 'Auf Pro upgraden 👑',
    save: 'Speichern', cancel: 'Abbrechen', back: '← Zurück',
    signOutConfirm: 'Möchtest du dich wirklich abmelden?',
    getStarted: 'Kostenlos starten 💕',
    alreadyHaveAccount: 'Ich habe bereits ein Konto',
    bellaLanguage: 'de',
    bellaSystemPrompt: 'Du bist Bella, eine warme und professionelle KI-Krankenschwester in der Bellava App von Reine Mande. Du spezialisierst dich auf Frauengesundheit, Fruchtbarkeit, Schwangerschaft und Wochenbett. Sei warm und einfühlsam. Gib detaillierte hilfreiche medizinische Informationen. Weise immer darauf hin, einen Arzt zu konsultieren. Stelle nie eine Diagnose. Bei Notfällen weise auf den Notruf 112 hin. Antworte immer auf Deutsch.',
  },
  pt: {
    appName: 'Bellava', tagline: 'Sua companheira de saúde feminina com IA',
    home: 'Início', tracker: 'Rastreador', bella: 'Bella', community: 'Comunidade', profile: 'Perfil',
    goodMorning: 'Bom dia 🌸', hello: 'Olá',
    cycleDay: 'DIA DO CICLO', fertile: 'FÉRTIL', next: 'PRÓXIMO', window: 'janela', period: 'período',
    chatWithBella: 'Conversar com Bella', startChatting: 'Começar →',
    todaysTip: 'Dica de hoje', quickActions: 'Ações rápidas',
    symptomChecker: 'Verificador de sintomas', careFinder: 'Encontrar clínica',
    partnerMode: 'Modo parceiro', nutrition: 'Planeador nutricional',
    babyNames: 'Nomes de bebé', intimacy: 'Saúde íntima',
    signOut: 'Sair', upgrade: 'Atualizar para Pro 👑',
    save: 'Guardar', cancel: 'Cancelar', back: '← Voltar',
    signOutConfirm: 'Tem certeza que quer sair?',
    getStarted: 'Começar gratuitamente 💕',
    alreadyHaveAccount: 'Já tenho uma conta',
    bellaLanguage: 'pt',
    bellaSystemPrompt: 'Você é Bella, uma enfermeira IA calorosa e profissional no aplicativo Bellava criado por Reine Mande. Especializada em saúde feminina, fertilidade, gravidez e pós-parto. Seja calorosa e empática. Forneça informações médicas detalhadas e úteis. Lembre sempre as usuárias de consultar seu médico. Nunca diagnostique. Para emergências, direcione para o 112. Responda sempre em português.',
  },
};

const JOURNEY_LABELS = {
  ttc:        { label: 'TTC Journey',       emoji: '🌱', color: '#F48FB1' },
  pregnant:   { label: 'Pregnant',          emoji: '🤰', color: '#CE93D8' },
  surrogacy:  { label: 'Surrogacy Journey', emoji: '🤝', color: '#80CBC4' },
  postpartum: { label: 'Postpartum',        emoji: '👶', color: '#FFB74D' },
  wellness:   { label: 'General Wellness',  emoji: '💕', color: '#F48FB1' },
};

function useFadeIn(duration = 600, delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true }).start();
  }, []);
  return anim;
}

function useSlideUp(duration = 500, delay = 0) {
  const anim = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 0, duration, delay, easing: Easing.out(Easing.exp), useNativeDriver: true }).start();
  }, []);
  return anim;
}

function usePulse() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return anim;
}

function useHeartBounce() {
  const anim = useRef(new Animated.Value(1)).current;
  const bounce = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.9, duration: 80,  useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1,   duration: 100, useNativeDriver: true }),
    ]).start();
  };
  return [anim, bounce];
}

function useShake() {
  const anim = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0,  duration: 40, useNativeDriver: true }),
    ]).start();
  };
  return [anim, shake];
}

function AnimatedStatCard({ label, val, sub, color, delay }) {
  const fade  = useFadeIn(500, delay);
  const slide = useSlideUp(500, delay);
  return (
    <Animated.View style={[s.statCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <Text style={[s.statVal, { color }]}>{val}</Text>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statSub}>{sub}</Text>
    </Animated.View>
  );
}

function ProgressBar({ progress, color, label, delay = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 800, delay, easing: Easing.out(Easing.exp), useNativeDriver: false }).start();
  }, []);
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#616161' }}>{label}</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color }}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
        <Animated.View style={{ height: 8, borderRadius: 4, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
      </View>
    </View>
  );
}

function SignOutModal({ visible, onConfirm, onCancel, t }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>👋</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8, textAlign: 'center' }}>Signing out?</Text>
          <Text style={{ fontSize: 13, color: '#9e9e9e', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>{t.signOutConfirm}</Text>
          <TouchableOpacity onPress={onConfirm} style={[s.primaryBtn, { marginBottom: 10 }]}>
            <Text style={s.primaryBtnTxt}>{t.signOut}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={{ width: '100%', height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.4)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F48FB1' }}>{t.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SplashScreen({ onDone }) {
  const scale    = useRef(new Animated.Value(0.5)).current;
  const fade     = useRef(new Animated.Value(0)).current;
  const txtFade  = useRef(new Animated.Value(0)).current;
  const txtSlide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(fade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(txtFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(txtSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(900),
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);
  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center', opacity: fade }}>
      <View style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.08)', top: -80, right: -80 }} />
      <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, left: -50 }} />
      <Animated.View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', marginBottom: 28, transform: [{ scale }] }}>
        <Text style={{ fontSize: 56 }}>🌸</Text>
      </Animated.View>
      <Animated.View style={{ alignItems: 'center', opacity: txtFade, transform: [{ translateY: txtSlide }] }}>
        <Text style={{ fontSize: 44, fontWeight: 'bold', color: 'white', letterSpacing: 1, marginBottom: 10 }}>Bellava</Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 8 }}>Your AI Women's Health Companion</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 18 }}>Cycle tracking · AI Nurse · Community</Text>
      </Animated.View>
      <Text style={{ position: 'absolute', bottom: 40, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 1.5 }}>BY REINE MANDE</Text>
    </Animated.View>
  );
}

function OnboardingScreen({ onDone }) {
  const [current, setCurrent] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const slides = [
    { bg: '#F48FB1', emoji: '🌸', title: 'Welcome to Bellava', sub: "Your personal AI women's health companion for every stage of your journey" },
    { bg: '#CE93D8', emoji: '🌱', title: 'Track Your Cycle',   sub: 'Monitor your fertile window, ovulation, symptoms and BBT all in one beautiful place' },
    { bg: '#80CBC4', emoji: '🩺', title: 'Chat with Bella',    sub: 'Your AI nurse is available 24/7 to answer health questions and support your journey' },
    { bg: '#FFB74D', emoji: '💕', title: 'Join the Community', sub: 'Connect with thousands of women on the same journey. You are never alone' },
  ];
  const next = () => {
    if (current < slides.length - 1) {
      Animated.timing(slideAnim, { toValue: -400, duration: 250, useNativeDriver: true }).start(() => {
        slideAnim.setValue(400);
        setCurrent(c => c + 1);
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      });
    } else onDone();
  };
  const slide = slides[current];
  return (
    <View style={{ flex: 1, backgroundColor: slide.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View style={{ position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -60 }} />
      <View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -40 }} />
      <View style={{ position: 'absolute', top: 64, flexDirection: 'row', gap: 8 }}>
        {slides.map((_, i) => (
          <View key={i} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.35)' }} />
        ))}
      </View>
      <Animated.View style={{ alignItems: 'center', transform: [{ translateX: slideAnim }] }}>
        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' }}>
          <Text style={{ fontSize: 62 }}>{slide.emoji}</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 14, lineHeight: 36 }}>{slide.title}</Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', textAlign: 'center', lineHeight: 24, marginBottom: 48 }}>{slide.sub}</Text>
      </Animated.View>
      <TouchableOpacity onPress={next} style={{ width: '100%', height: 54, borderRadius: 27, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: slide.bg }}>{current === slides.length - 1 ? 'Get started 🌸' : 'Next →'}</Text>
      </TouchableOpacity>
      {current < slides.length - 1 && (
        <TouchableOpacity onPress={onDone}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>Skip for now</Text>
        </TouchableOpacity>
      )}
      <Text style={{ position: 'absolute', bottom: 40, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{current + 1} of {slides.length}</Text>
    </View>
  );
}

function WelcomeScreen({ goTo, t }) {
  const fade  = useFadeIn(700);
  const slide = useSlideUp(700);
  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#FFF8FA', alignItems: 'center', justifyContent: 'center', padding: 28, opacity: fade }}>
      <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(244,143,177,0.12)', top: -60, right: -60 }} />
      <View style={{ position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(244,143,177,0.08)', bottom: -40, left: -40 }} />
      <Animated.View style={{ alignItems: 'center', width: '100%', transform: [{ translateY: slide }] }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(244,143,177,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 2, borderColor: 'rgba(244,143,177,0.3)' }}>
          <Text style={{ fontSize: 46 }}>🌸</Text>
        </View>
        <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 }}>{t.appName}</Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#F48FB1', marginBottom: 10, textAlign: 'center' }}>{t.tagline}</Text>
        <Text style={{ fontSize: 12, color: '#9e9e9e', textAlign: 'center', lineHeight: 20, marginBottom: 36 }}>Cycle tracking · AI Nurse · TTC support{'\n'}Pregnancy · Postpartum · Community</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => goTo('register')}>
          <Text style={s.primaryBtnTxt}>{t.getStarted}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => goTo('login')}>
          <Text style={s.secondaryBtnTxt}>{t.alreadyHaveAccount}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 12, color: '#bdbdbd', marginVertical: 14 }}>— or continue with —</Text>
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <TouchableOpacity style={s.socialBtn}><Text style={{ fontSize: 20 }}>🍎</Text><Text style={s.socialBtnTxt}>Apple</Text></TouchableOpacity>
          <TouchableOpacity style={s.socialBtn}><Text style={{ fontSize: 20 }}>🔵</Text><Text style={s.socialBtnTxt}>Google</Text></TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function LoginScreen({ goTo, onLogin, t }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const fade  = useFadeIn();
  const slide = useSlideUp();

  const handleLogin = async () => {
    if (!email.trim())       { setError('Please enter your email address');        return; }
    if (!password.trim())    { setError('Please enter your password');              return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email first 💕 Check your inbox!');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Wrong email or password. Please try again.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
      const { data: userData } = await supabase.from('users').select('*').eq('email', email.toLowerCase().trim()).single();
      if (userData) {
        onLogin(userData.name, userData.email, userData.journey_mode, userData.plan || 'FREE');
      } else {
        onLogin(data.user.email, data.user.email, 'wellness', 'FREE');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.authHeader, { position: 'relative', overflow: 'hidden' }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('welcome')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{t.back}</Text>
        </TouchableOpacity>
        <View style={s.authLogo}><Text style={{ fontSize: 30 }}>🌸</Text></View>
        <Text style={s.authTitle}>Welcome back 💕</Text>
        <Text style={s.authSub}>Sign in to your Bellava account</Text>
      </View>
      <Animated.View style={[s.formCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={s.inputLabel}>Email address</Text>
        <View style={s.inputWrap}>
          <Text style={s.inputIcon}>📧</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#BDBDBD" keyboardType="email-address" autoCapitalize="none" />
        </View>
        <Text style={s.inputLabel}>Password</Text>
        <View style={s.inputWrap}>
          <Text style={s.inputIcon}>🔒</Text>
          <TextInput style={[s.input, { flex: 1 }]} value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="#BDBDBD" secureTextEntry={!showPass} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        {error ? <View style={{ backgroundColor: '#FFEBEE', borderRadius: 12, padding: 12, marginBottom: 12 }}><Text style={{ fontSize: 12, color: '#c62828' }}>⚠️ {error}</Text></View> : null}
        <TouchableOpacity style={[s.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          <Text style={s.primaryBtnTxt}>{loading ? 'Signing in...' : 'Sign in →'}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 13, color: '#9e9e9e' }}>No account? </Text>
          <TouchableOpacity onPress={() => goTo('register')}>
            <Text style={{ fontSize: 13, color: '#F48FB1', fontWeight: 'bold' }}>Sign up free</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function RegisterScreen({ goTo, onLogin, t }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [journey, setJourney]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const fade  = useFadeIn();
  const slide = useSlideUp();

  const journeys = [
    { key: 'ttc',        emoji: '🌱', label: 'Trying to Conceive' },
    { key: 'pregnant',   emoji: '🤰', label: 'Pregnant'           },
    { key: 'surrogacy',  emoji: '🤝', label: 'Surrogacy'          },
    { key: 'postpartum', emoji: '👶', label: 'Postpartum'         },
    { key: 'wellness',   emoji: '💕', label: 'General Wellness'   },
  ];

  const handleRegister = async () => {
    if (!name.trim())        { setError('Please enter your name');                  return; }
    if (!email.trim())       { setError('Please enter your email');                 return; }
    if (!password.trim())    { setError('Please create a password');                return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!journey)            { setError('Please select your journey mode');         return; }
    setError(''); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: { data: { name: name.trim(), journey_mode: journey, plan: 'FREE' } }
      });
      if (error) { setError(error.message); setLoading(false); return; }
      await supabase.from('users').upsert({ email: email.toLowerCase().trim(), name: name.trim(), journey_mode: journey, plan: 'FREE' });
      setLoading(false);
      onLogin(name.trim(), email.toLowerCase().trim(), journey, 'FREE');
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.authHeader, { position: 'relative', overflow: 'hidden' }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('welcome')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{t.back}</Text>
        </TouchableOpacity>
        <View style={s.authLogo}><Text style={{ fontSize: 30 }}>🌸</Text></View>
        <Text style={s.authTitle}>Create your account</Text>
        <Text style={s.authSub}>Join thousands of women on their journey 💕</Text>
      </View>
      <Animated.View style={[s.formCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={s.inputLabel}>Full name</Text>
        <View style={s.inputWrap}>
          <Text style={s.inputIcon}>👤</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor="#BDBDBD" />
        </View>
        <Text style={s.inputLabel}>Email address</Text>
        <View style={s.inputWrap}>
          <Text style={s.inputIcon}>📧</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#BDBDBD" keyboardType="email-address" autoCapitalize="none" />
        </View>
        <Text style={s.inputLabel}>Create password</Text>
        <View style={s.inputWrap}>
          <Text style={s.inputIcon}>🔒</Text>
          <TextInput style={[s.input, { flex: 1 }]} value={password} onChangeText={setPassword} placeholder="At least 6 characters" placeholderTextColor="#BDBDBD" secureTextEntry={!showPass} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.inputLabel}>My journey 🌸</Text>
        <View style={{ gap: 8, marginBottom: 16 }}>
          {journeys.map(j => (
            <TouchableOpacity key={j.key} onPress={() => setJourney(j.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: journey === j.key ? '#F48FB1' : 'rgba(0,0,0,0.08)', backgroundColor: journey === j.key ? '#FFF0F5' : '#f9f9f9' }}>
              <Text style={{ fontSize: 22 }}>{j.emoji}</Text>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: journey === j.key ? '#c2185b' : '#616161' }}>{j.label}</Text>
              {journey === j.key && <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 12, color: 'white' }}>✓</Text></View>}
            </TouchableOpacity>
          ))}
        </View>
        {error ? <View style={{ backgroundColor: '#FFEBEE', borderRadius: 12, padding: 12, marginBottom: 12 }}><Text style={{ fontSize: 12, color: '#c62828' }}>⚠️ {error}</Text></View> : null}
        <TouchableOpacity style={[s.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
          <Text style={s.primaryBtnTxt}>{loading ? 'Creating account...' : 'Create my account 🌸'}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
          <Text style={{ fontSize: 13, color: '#9e9e9e' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => goTo('login')}>
            <Text style={{ fontSize: 13, color: '#F48FB1', fontWeight: 'bold' }}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function AuthFlow({ onLogin, t }) {
  const [mode, setMode] = useState('welcome');
  if (mode === 'welcome')  return <WelcomeScreen  goTo={setMode} t={t} />;
  if (mode === 'login')    return <LoginScreen    goTo={setMode} onLogin={onLogin} t={t} />;
  if (mode === 'register') return <RegisterScreen goTo={setMode} onLogin={onLogin} t={t} />;
}
export default function App() {
  const [appState, setAppState]               = useState('splash');
  const [screen, setScreen]                   = useState('Home');
  const [userName, setUserName]               = useState('');
  const [userEmail, setUserEmail]             = useState('');
  const [userJourney, setUserJourney]         = useState('ttc');
  const [userPlan, setUserPlan]               = useState('FREE');
  const [language, setLanguage]               = useState('en');
  const [showSignOut, setShowSignOut]         = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const goTo = (newScreen, params = null) => {
    if (newScreen === 'Article' && params) setSelectedArticle(params);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setScreen(newScreen), 120);
  };

  const handleSignOut = () => {
    setShowSignOut(false);
    supabase.auth.signOut();
    setUserName(''); setUserEmail(''); setUserJourney('ttc'); setUserPlan('FREE');
    setScreen('Home'); setAppState('auth');
  };

  const scheduleNotification = async (title, body, seconds = 5) => {
    Alert.alert('🔔 Reminder Set!', `"${title}" reminder has been scheduled!`, [{ text: 'OK' }]);
  };

  if (appState === 'splash')     return <SplashScreen     onDone={() => setAppState('onboarding')} />;
  if (appState === 'onboarding') return <OnboardingScreen onDone={() => setAppState('auth')} />;
  if (appState === 'auth')       return <AuthFlow t={t} onLogin={(name, email, journey, plan) => {
    setUserName(name); setUserEmail(email); setUserJourney(journey); setUserPlan(plan || 'FREE');
    setAppState('app');
  }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8FA' }}>
      <SignOutModal visible={showSignOut} onConfirm={handleSignOut} onCancel={() => setShowSignOut(false)} t={t} />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {screen === 'Home'          && <HomeScreen          goTo={goTo} userName={userName} userJourney={userJourney} userPlan={userPlan} t={t} />}
        {screen === 'Tracker'       && <TrackerScreen       goTo={goTo} userJourney={userJourney} />}
        {screen === 'Chat'          && <ChatScreen          goTo={goTo} userName={userName} userJourney={userJourney} userPlan={userPlan} t={t} />}
        {screen === 'Academy'       && <AcademyScreen       goTo={goTo} userJourney={userJourney} userPlan={userPlan} />}
        {screen === 'Article'       && <ArticleScreen       goTo={goTo} article={selectedArticle} />}
        {screen === 'CareFinder'    && <CareFinderScreen    goTo={goTo} userPlan={userPlan} />}
        {screen === 'Intimacy'      && <IntimacyScreen      goTo={goTo} userPlan={userPlan} />}
        {screen === 'PartnerMode'   && <PartnerModeScreen   goTo={goTo} userPlan={userPlan} userName={userName} />}
        {screen === 'Nutrition'     && <NutritionScreen     goTo={goTo} userPlan={userPlan} userJourney={userJourney} />}
        {screen === 'BabyNames'     && <BabyNamesScreen     goTo={goTo} userPlan={userPlan} />}
        {screen === 'SymptomCheck'  && <SymptomCheckerScreen goTo={goTo} />}
        {screen === 'BBTGraph'      && <BBTGraphScreen      goTo={goTo} />}
        {screen === 'Calendar'      && <CalendarScreen      goTo={goTo} />}
        {screen === 'Notifications' && <NotificationsScreen goTo={goTo} scheduleNotification={scheduleNotification} />}
        {screen === 'Community'     && <CommunityScreen     goTo={goTo} userName={userName} />}
        {screen === 'Profile'       && <ProfileScreen       goTo={goTo} userName={userName} userEmail={userEmail} userJourney={userJourney} userPlan={userPlan} onSignOut={() => setShowSignOut(true)} language={language} setLanguage={setLanguage} t={t} />}
        {screen === 'Subscription'  && <SubscriptionScreen  goTo={goTo} />}
        {screen === 'Admin'         && <AdminScreen         goTo={goTo} />}
      </Animated.View>
      <View style={s.tabBar}>
        {[
          { key: 'Home',      icon: '🏠', label: t.home      },
          { key: 'Tracker',   icon: '📅', label: t.tracker   },
          { key: 'Chat',      icon: '🩺', label: t.bella     },
          { key: 'Community', icon: '💬', label: t.community },
          { key: 'Profile',   icon: '👤', label: t.profile   },
        ].map(tab => (
          <TouchableOpacity key={tab.key} style={s.tabItem} onPress={() => goTo(tab.key)}>
            <View style={[s.tabIconWrap, screen === tab.key && s.tabIconActive]}>
              <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            </View>
            <Text style={[s.tabLabel, screen === tab.key && s.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function HomeScreen({ goTo, userName, userJourney, userPlan, t }) {
  const journey     = JOURNEY_LABELS[userJourney] || JOURNEY_LABELS.ttc;
  const headerFade  = useFadeIn(600);
  const headerSlide = useSlideUp(600);
  const heroPulse   = usePulse();
  const firstName   = userName ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : 'Friend';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <Animated.View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{t.goodMorning}</Text>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 2 }}>{t.hello}, {firstName} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => goTo('Profile')} style={s.avatarLarge}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{firstName[0]}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.journeyBadge}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>{journey.emoji} {journey.label}</Text>
          </View>
        </Animated.View>
      </View>
      <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
        <AnimatedStatCard label={t.cycleDay} val={`${CYCLE_DAY}`}            sub={`of ${CYCLE_LENGTH}`} color="#F48FB1" delay={0}   />
        <AnimatedStatCard label={t.fertile}  val={isFertile ? 'Yes!' : 'No'} sub={t.window}            color="#f06292" delay={100} />
        <AnimatedStatCard label={t.next}     val={`${daysUntilPeriod}d`}     sub={t.period}            color="#CE93D8" delay={200} />
      </View>
      <Animated.View style={{ transform: [{ scale: heroPulse }] }}>
        <TouchableOpacity style={s.heroCard} onPress={() => goTo('Chat')} activeOpacity={0.9}>
          <View style={s.heroBlob1} /><View style={s.heroBlob2} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <View style={s.bellaAvatar}><Text style={{ fontSize: 18 }}>🩺</Text></View>
            <View>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5 }}>AI HEALTH ASSISTANT</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>{t.chatWithBella}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', lineHeight: 18 }}>Ask anything about your {journey.label}, symptoms or medications today</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 12 }}>
            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{t.startChatting}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      <View style={[s.wideCard, { marginHorizontal: 16, marginBottom: 12, backgroundColor: journey.color + '18', borderLeftWidth: 4, borderLeftColor: journey.color }]}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: journey.color, marginBottom: 6 }}>{journey.emoji} {t.todaysTip}</Text>
        <Text style={{ fontSize: 12, color: '#616161', lineHeight: 18 }}>
          {userJourney === 'ttc'        ? (isFertile ? "🌸 You are in your fertile window! This is a great time for intimacy." : "Track your BBT and CM today. Stay hydrated and take your vitamins.") :
           userJourney === 'pregnant'   ? "Stay hydrated with at least 8 glasses of water today. Gentle walks are great 🤰" :
           userJourney === 'postpartum' ? "Be kind to yourself today. Recovery takes time. Rest when baby rests 👶" :
           userJourney === 'surrogacy'  ? "You are doing something incredible. Prioritise your own health today 🤝" :
           "Take a moment for yourself today. Your health is your greatest asset 💕"}
        </Text>
      </View>
      <Text style={s.sectionLabel}>{t.quickActions}</Text>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 12 }}>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#EDE7F6' }]} onPress={() => goTo('SymptomCheck')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#D1C4E9' }]}><Text style={{ fontSize: 20 }}>🔍</Text></View>
          <Text style={[s.featureTitle, { color: '#4527A0' }]}>{t.symptomChecker}</Text>
          <Text style={[s.featureSub, { color: '#7E57C2' }]}>AI-powered</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#C8E6C9' }]} onPress={() => goTo('CareFinder')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#A5D6A7' }]}><Text style={{ fontSize: 20 }}>🏥</Text></View>
          <Text style={[s.featureTitle, { color: '#1B5E20' }]}>{t.careFinder}</Text>
          <Text style={[s.featureSub, { color: '#388E3C' }]}>Clinics nearby</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 12 }}>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#FCE4EC' }]} onPress={() => goTo('PartnerMode')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#F8BBD9' }]}><Text style={{ fontSize: 20 }}>👫</Text></View>
          <Text style={[s.featureTitle, { color: '#880E4F' }]}>{t.partnerMode}</Text>
          <Text style={[s.featureSub, { color: '#AD1457' }]}>Plus feature</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#FFE0B2' }]} onPress={() => goTo('Nutrition')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#FFCC80' }]}><Text style={{ fontSize: 20 }}>🥗</Text></View>
          <Text style={[s.featureTitle, { color: '#E65100' }]}>{t.nutrition}</Text>
          <Text style={[s.featureSub, { color: '#F57C00' }]}>Pro feature</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 12 }}>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#E0F2F1' }]} onPress={() => goTo('BabyNames')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#B2DFDB' }]}><Text style={{ fontSize: 20 }}>👶</Text></View>
          <Text style={[s.featureTitle, { color: '#00695C' }]}>{t.babyNames}</Text>
          <Text style={[s.featureSub, { color: '#00897B' }]}>Pro feature</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#F3E5F5' }]} onPress={() => goTo('Intimacy')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#E1BEE7' }]}><Text style={{ fontSize: 20 }}>💕</Text></View>
          <Text style={[s.featureTitle, { color: '#6A1B9A' }]}>{t.intimacy}</Text>
          <Text style={[s.featureSub, { color: '#7B1FA2' }]}>Pro only</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#E8F5E9' }]} onPress={() => goTo('BBTGraph')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#C8E6C9' }]}><Text style={{ fontSize: 20 }}>📊</Text></View>
          <Text style={[s.featureTitle, { color: '#2E7D32' }]}>BBT Graph</Text>
          <Text style={[s.featureSub, { color: '#388E3C' }]}>Temperature</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.featureCard, { backgroundColor: '#E3F2FD' }]} onPress={() => goTo('Calendar')}>
          <View style={[s.featureIconWrap, { backgroundColor: '#BBDEFB' }]}><Text style={{ fontSize: 20 }}>📅</Text></View>
          <Text style={[s.featureTitle, { color: '#1565C0' }]}>Full Calendar</Text>
          <Text style={[s.featureSub, { color: '#1976D2' }]}>Cycle view</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sectionLabel}>Your tracker</Text>
      <TouchableOpacity style={[s.wideCard, { marginHorizontal: 16, marginBottom: 12 }]} onPress={() => goTo('Tracker')}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View>
            <Text style={s.featureTitle}>📅 Cycle Tracker</Text>
            <Text style={s.featureSub}>Day {CYCLE_DAY} · {isFertile ? 'Fertile window 🌸' : 'Tracking'}</Text>
          </View>
          <Text style={{ color: '#F48FB1', fontWeight: 'bold', fontSize: 13 }}>View →</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {Array.from({ length: 7 }, (_, i) => {
            const day      = CYCLE_DAY - 3 + i;
            const isToday  = day === CYCLE_DAY;
            const fertile  = day >= FERTILE_START && day <= FERTILE_END;
            const ovulation = day === OVULATION_DAY;
            const logged   = day < CYCLE_DAY;
            return (
              <View key={i} style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#bdbdbd' }}>{['M','T','W','T','F','S','S'][(day - 1) % 7]}</Text>
                <View style={[s.dayCircle, isToday && { backgroundColor: '#F48FB1' }, ovulation && !isToday && { backgroundColor: '#f06292' }, fertile && !isToday && !ovulation && { backgroundColor: '#FCE4EC' }, logged && !isToday && !fertile && { backgroundColor: '#E8EAF6' }]}>
                  <Text style={[{ fontSize: 11, fontWeight: 'bold', color: '#9e9e9e' }, (isToday || ovulation) && { color: 'white' }, fertile && !isToday && !ovulation && { color: '#c2185b' }, logged && !isToday && !fertile && { color: '#7986CB' }]}>{day > 0 ? day : ''}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
      <Text style={s.sectionLabel}>Today's reminders</Text>
      <ReminderCard icon="💊" text="Prenatal vitamins"   time="8:00 AM" done={true}  />
      <ReminderCard icon="🌡️" text="Log BBT temperature" time="Now"     done={false} shake={true} />
      <ReminderCard icon="🌙" text="Evening folic acid"  time="9:00 PM" done={false} />
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function ReminderCard({ icon, text, time, done, shake: shouldShake }) {
  const [shakeAnim, triggerShake] = useShake();
  const fade = useFadeIn(400);
  useEffect(() => {
    if (shouldShake) {
      const timer = setTimeout(() => triggerShake(), 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  return (
    <Animated.View style={[s.wideCard, { marginHorizontal: 16, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#F48FB1', opacity: fade, transform: [{ translateX: shakeAnim }] }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: done ? '#E8F5E9' : '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
        </View>
        <Text style={[{ flex: 1, fontSize: 13, fontWeight: '600', color: '#1a1a2e' }, done && { textDecorationLine: 'line-through', color: '#bdbdbd' }]}>{text}</Text>
        <View style={{ backgroundColor: time === 'Now' ? '#FFEBEE' : '#FFF8E1', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: time === 'Now' ? '#c62828' : '#F57C00' }}>{time}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function ChatScreen({ goTo, userName, userJourney, userPlan, t }) {
  const firstName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : 'Friend';
  const journey = JOURNEY_LABELS[userJourney] || JOURNEY_LABELS.wellness;
  const currentT = t || TRANSLATIONS.en;
  const systemPrompt = currentT.bellaSystemPrompt || TRANSLATIONS.en.bellaSystemPrompt;
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${firstName}! I am Bella 💕 I am your personal AI women's health nurse. I am here to support your ${journey.label} journey. How can I help you today? 🌸` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef(null);
  const FREE_LIMIT = 5;
  const isAtLimit = userPlan === 'FREE' && messageCount >= FREE_LIMIT;

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    if (isAtLimit) {
      Alert.alert('💜 Upgrade to Plus', 'You have used your 5 free messages with Bella today. Upgrade for unlimited AI conversations!',
        [{ text: 'Maybe later', style: 'cancel' }, { text: 'Upgrade 👑', onPress: () => goTo('Subscription') }]
      );
      return;
    }
    setInput('');
    setLoading(true);
    setMessageCount(c => c + 1);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));
      conversationHistory.push({ role: 'user', content: msg });
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': BELLA_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt + ` The user's name is ${firstName} and they are on the ${journey.label} journey.`,
          messages: conversationHistory,
        }),
      });
      const data = await response.json();
      if (data.content && data.content[0]) {
        setMessages(prev => [...prev, { role: 'ai', text: data.content[0].text }]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        throw new Error('No response');
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "I am sorry, I had trouble connecting just now 💕 Please check your internet and try again." }]);
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8FA' }}>
      <View style={[s.pinkHeader, { paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <View style={s.blob1} />
        <TouchableOpacity onPress={() => goTo('Home')} style={s.backBtn}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <View style={s.bellaAvatar}><Text style={{ fontSize: 22 }}>🩺</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Bella — AI Nurse</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>🟢 Online · Powered by Claude AI</Text>
        </View>
        {userPlan === 'FREE' && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white' }}>{Math.max(0, FREE_LIMIT - messageCount)}/{FREE_LIMIT}</Text>
          </View>
        )}
      </View>
      <ScrollView ref={scrollRef} style={{ flex: 1, padding: 14 }} showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m, i) => (
          <View key={i} style={[{ maxWidth: '82%', padding: 12, borderRadius: 18, marginBottom: 8 }, m.role === 'user' ? { backgroundColor: '#E0E0E0', alignSelf: 'flex-end', borderBottomRightRadius: 4 } : { backgroundColor: '#FECFE9', alignSelf: 'flex-start', borderBottomLeftRadius: 4 }]}>
            {m.role === 'ai' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Text style={{ fontSize: 12 }}>🩺</Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#c2185b' }}>Bella</Text>
              </View>
            )}
            <Text style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 20 }}>{m.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={{ backgroundColor: '#FECFE9', alignSelf: 'flex-start', padding: 12, borderRadius: 18, borderBottomLeftRadius: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: '#9e9e9e' }}>Bella is thinking... 💕</Text>
          </View>
        )}
        {!loading && messages.length === 1 && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#bdbdbd', letterSpacing: 1, marginBottom: 8 }}>QUICK QUESTIONS</Text>
            {[
              '🌸 What are signs of ovulation?',
              '💊 What vitamins should I take for TTC?',
              '🤕 I have cramps, what should I do?',
              '😴 Why am I so tired during my cycle?',
              '🤰 What are early pregnancy symptoms?',
              '🧠 How do hormones affect my mood?',
            ].map((q, i) => (
              <TouchableOpacity key={i} onPress={() => sendMessage(q)} style={{ backgroundColor: 'white', borderRadius: 14, padding: 12, marginBottom: 6, borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.3)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#616161', fontWeight: '600', flex: 1 }}>{q}</Text>
                <Text style={{ color: '#F48FB1' }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {isAtLimit && (
          <View style={{ backgroundColor: '#FFF0F5', borderRadius: 16, padding: 16, marginTop: 8, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.25)' }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#F48FB1', marginBottom: 4 }}>Daily limit reached 💜</Text>
            <Text style={{ fontSize: 11, color: '#9e9e9e', textAlign: 'center', lineHeight: 17, marginBottom: 12 }}>Upgrade to Plus for unlimited Bella conversations 💕</Text>
            <TouchableOpacity onPress={() => goTo('Subscription')} style={s.primaryBtn}>
              <Text style={s.primaryBtnTxt}>Upgrade now 👑</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingBottom: 24, backgroundColor: 'white', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' }}>
        <TextInput
          style={{ flex: 1, height: 46, backgroundColor: '#f5f5f5', borderRadius: 23, paddingHorizontal: 18, fontSize: 13, color: '#1a1a2e' }}
          value={input}
          onChangeText={setInput}
          placeholder={isAtLimit ? 'Upgrade to continue...' : 'Ask Bella anything...'}
          placeholderTextColor="#BDBDBD"
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
          editable={!isAtLimit && !loading}
          multiline
        />
        <TouchableOpacity
          style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: isAtLimit ? '#E0E0E0' : '#F48FB1', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => sendMessage()}
          disabled={isAtLimit || loading}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>➤</Text>
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: '#FFF8FA', paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 9, color: '#bdbdbd', textAlign: 'center', lineHeight: 14 }}>
          Bella provides general health information only. Always consult your GP for medical advice. For emergencies call 999.
        </Text>
      </View>
    </View>
  );
}
function TrackerScreen({ goTo, userJourney }) {
  const [selectedMood, setSelectedMood]         = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [water, setWater]                       = useState(3);
  const [saving, setSaving]                     = useState(false);
  const [saved, setSaved]                       = useState(false);
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const toggleSym = (sym) => setSelectedSymptoms(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);

  const saveLog = async () => {
    setSaving(true);
    try {
      await supabase.from('cycle_logs').insert({ cycle_day: CYCLE_DAY, mood: selectedMood, symptoms: selectedSymptoms, water_glasses: water, logged_at: new Date().toISOString() });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.log('Save error:', e); }
    setSaving(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>CYCLE TRACKING</Text>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 4 }}>My Tracker 🌱</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Day {CYCLE_DAY} · {isFertile ? 'Fertile window open 🌸' : 'Tracking'}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
        <AnimatedStatCard label="CYCLE DAY" val={`${CYCLE_DAY}`}            sub={`of ${CYCLE_LENGTH}`} color="#F48FB1" delay={0}   />
        <AnimatedStatCard label="FERTILE"   val={isFertile ? 'Now!' : 'No'} sub="window"              color="#f06292" delay={100} />
        <AnimatedStatCard label="NEXT"      val={`${daysUntilPeriod}d`}     sub="period"              color="#CE93D8" delay={200} />
      </View>
      <Animated.View style={[s.wideCard, { marginHorizontal: 16, marginBottom: 14, opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={[s.featureTitle, { marginBottom: 14 }]}>📊 Cycle progress</Text>
        <ProgressBar progress={CYCLE_DAY / CYCLE_LENGTH} color="#F48FB1" label="Cycle progress"             delay={200} />
        <ProgressBar progress={isFertile ? 0.8 : 0.1}   color="#f06292" label="Fertile window"             delay={400} />
        <ProgressBar progress={water / 8}                color="#80CBC4" label={`Water ${water}/8 glasses`} delay={600} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <TouchableOpacity onPress={() => setWater(w => Math.max(0, w - 1))} style={{ flex: 1, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#80CBC4', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#80CBC4', fontWeight: 'bold', fontSize: 16 }}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWater(w => Math.min(8, w + 1))} style={{ flex: 1, height: 36, borderRadius: 18, backgroundColor: '#80CBC4', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>+ Glass</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <Text style={s.sectionLabel}>How are you feeling today?</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 16 }}>
        {[{ emoji: '😊', label: 'Happy' }, { emoji: '😔', label: 'Sad' }, { emoji: '😤', label: 'Anxious' }, { emoji: '😴', label: 'Tired' }, { emoji: '🌟', label: 'Great' }].map((mood, i) => (
          <TouchableOpacity key={i} onPress={() => setSelectedMood(mood.emoji)} style={[{ alignItems: 'center', width: 56, height: 68, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }, selectedMood === mood.emoji && { backgroundColor: '#FFF0F5', borderWidth: 2, borderColor: '#F48FB1' }]}>
            <Text style={{ fontSize: 26 }}>{mood.emoji}</Text>
            <Text style={[{ fontSize: 9, fontWeight: 'bold', color: '#bdbdbd', marginTop: 3 }, selectedMood === mood.emoji && { color: '#F48FB1' }]}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.wideCard, { marginHorizontal: 16, marginBottom: 24 }]}>
        <Text style={[s.featureTitle, { marginBottom: 12 }]}>Log today's symptoms</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['💊 Vitamins', '🌡️ BBT', '💧 CM', '🤕 Cramps', '💕 Intimacy', '🩸 Spotting', '😴 Fatigue', '🤢 Nausea'].map((sym, i) => (
            <TouchableOpacity key={i} onPress={() => toggleSym(sym)} style={[{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 22, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: 'transparent' }, selectedSymptoms.includes(sym) && { backgroundColor: '#FCE4EC', borderColor: '#F48FB1' }]}>
              <Text style={[{ fontSize: 12, fontWeight: '700', color: '#616161' }, selectedSymptoms.includes(sym) && { color: '#c2185b' }]}>{sym}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {(selectedSymptoms.length > 0 || selectedMood) && (
          <TouchableOpacity onPress={saveLog} disabled={saving} style={{ marginTop: 12, height: 44, borderRadius: 22, backgroundColor: saved ? '#4CAF50' : '#F48FB1', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>{saving ? 'Saving...' : saved ? '✓ Saved!' : "Save today's log ✓"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function BBTGraphScreen({ goTo }) {
  const [bbtData, setBbtData] = useState([
    { day: 1, temp: 36.4 }, { day: 2, temp: 36.3 }, { day: 3, temp: 36.5 },
    { day: 4, temp: 36.4 }, { day: 5, temp: 36.3 }, { day: 6, temp: 36.6 },
    { day: 7, temp: 36.4 }, { day: 8, temp: 36.5 }, { day: 9, temp: 36.4 },
    { day: 10, temp: 36.3 }, { day: 11, temp: 36.5 }, { day: 12, temp: 36.6 },
    { day: 13, temp: 36.7 }, { day: 14, temp: 37.1 }, { day: 15, temp: 37.2 },
    { day: 16, temp: 37.0 }, { day: 17, temp: 37.1 }, { day: 18, temp: 37.2 },
    { day: 19, temp: 37.0 }, { day: 20, temp: 37.1 }, { day: 21, temp: 37.0 },
  ]);
  const [newTemp, setNewTemp] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const minTemp = 36.0; const maxTemp = 37.5;
  const graphH = 180; const graphW = 300; const coverline = 36.8;
  const getY = (temp) => graphH - ((temp - minTemp) / (maxTemp - minTemp)) * graphH;
  const getX = (i) => (i / (bbtData.length - 1)) * graphW;
  const addTemp = () => {
    const temp = parseFloat(newTemp);
    if (isNaN(temp) || temp < 35 || temp > 39) return;
    setBbtData(prev => [...prev, { day: prev.length + 1, temp }]);
    setNewTemp(''); setShowAdd(false);
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 4 }}>BBT Graph 📊</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Basal Body Temperature tracking</Text>
        </View>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={{ backgroundColor: '#FFF3E0', borderRadius: 14, padding: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
          <Text style={{ fontSize: 11, color: '#E65100', fontWeight: '600', lineHeight: 17 }}>📌 Take your temperature every morning before getting out of bed at the same time each day.</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <AnimatedStatCard label="TODAY"  val={`${bbtData[bbtData.length - 1]?.temp}°`} sub="celsius" color="#F48FB1" delay={0} />
          <AnimatedStatCard label="STATUS" val={bbtData[bbtData.length - 1]?.temp >= coverline ? 'HIGH' : 'LOW'} sub="vs coverline" color={bbtData[bbtData.length - 1]?.temp >= coverline ? '#4CAF50' : '#F48FB1'} delay={100} />
          <AnimatedStatCard label="DAYS"   val={`${bbtData.length}`} sub="logged" color="#CE93D8" delay={200} />
        </View>
        <View style={[s.wideCard, { marginBottom: 16, overflow: 'hidden' }]}>
          <Text style={[s.featureTitle, { marginBottom: 4 }]}>📈 Temperature chart</Text>
          <Text style={{ fontSize: 11, color: '#9e9e9e', marginBottom: 14 }}>Pink line = coverline (36.8°C)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width: Math.max(graphW, bbtData.length * 18), height: graphH + 40, position: 'relative' }}>
              {[36.0, 36.4, 36.8, 37.2, 37.5].map((temp, i) => (
                <View key={i} style={{ position: 'absolute', left: 0, top: getY(temp) - 8 }}>
                  <Text style={{ fontSize: 8, color: '#bdbdbd', width: 30 }}>{temp}°</Text>
                </View>
              ))}
              <View style={{ position: 'absolute', left: 30, right: 0, top: getY(coverline), height: 1.5, backgroundColor: '#F48FB1', opacity: 0.6 }} />
              {bbtData.map((point, i) => {
                const x = 30 + getX(i); const y = getY(point.temp); const isHigh = point.temp >= coverline;
                return (
                  <View key={i}>
                    {i > 0 && (
                      <View style={{ position: 'absolute', left: 30 + getX(i - 1), top: getY(bbtData[i - 1].temp), width: Math.sqrt(Math.pow(getX(i) - getX(i - 1), 2) + Math.pow(getY(point.temp) - getY(bbtData[i - 1].temp), 2)), height: 1.5, backgroundColor: isHigh ? '#4CAF50' : '#7986CB', transform: [{ rotate: `${Math.atan2(getY(point.temp) - getY(bbtData[i - 1].temp), getX(i) - getX(i - 1))}rad` }], transformOrigin: 'left center' }} />
                    )}
                    <View style={{ position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: isHigh ? '#4CAF50' : '#7986CB', borderWidth: 2, borderColor: 'white' }} />
                    <Text style={{ position: 'absolute', left: x - 8, top: graphH + 4, fontSize: 8, color: '#bdbdbd' }}>{point.day}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
        <View style={[s.wideCard, { marginBottom: 16 }]}>
          <Text style={[s.featureTitle, { marginBottom: 8 }]}>🌡️ Log today's temperature</Text>
          {showAdd ? (
            <View>
              <View style={s.inputWrap}>
                <Text style={s.inputIcon}>🌡️</Text>
                <TextInput style={s.input} value={newTemp} onChangeText={setNewTemp} placeholder="e.g. 36.7" placeholderTextColor="#BDBDBD" keyboardType="decimal-pad" />
                <Text style={{ fontSize: 13, color: '#9e9e9e', fontWeight: '600' }}>°C</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => setShowAdd(false)} style={{ flex: 1, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#F48FB1', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#F48FB1', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addTemp} style={{ flex: 2, height: 44, borderRadius: 22, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Save reading ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={s.primaryBtn} onPress={() => setShowAdd(true)}>
              <Text style={s.primaryBtnTxt}>+ Add today's BBT reading</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[s.sectionLabel, { marginLeft: 0, marginTop: 0 }]}>Recent readings</Text>
        {[...bbtData].reverse().slice(0, 7).map((point, i) => (
          <View key={i} style={[s.wideCard, { marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: point.temp >= coverline ? '#E8F5E9' : '#E8EAF6', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: point.temp >= coverline ? '#2E7D32' : '#5C6BC0' }}>{point.temp}°</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e' }}>Day {point.day}</Text>
              <Text style={{ fontSize: 11, color: '#9e9e9e' }}>{point.temp >= coverline ? 'Above coverline' : 'Below coverline'}</Text>
            </View>
            <Text style={{ fontSize: 20 }}>{point.temp >= coverline ? '🟢' : '🔵'}</Text>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}

function CalendarScreen({ goTo }) {
  const [selectedDay, setSelectedDay] = useState(CYCLE_DAY);
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const daysInMonth = 31; const firstDayOffset = 1;
  const monthName = TODAY.toLocaleString('default', { month: 'long', year: 'numeric' });
  const getDayType = (day) => {
    if (day === CYCLE_DAY) return 'today';
    if (day === OVULATION_DAY) return 'ovulation';
    if (day >= FERTILE_START && day <= FERTILE_END) return 'fertile';
    if (day >= 1 && day <= 5) return 'period';
    if (day < CYCLE_DAY) return 'logged';
    return 'future';
  };
  const getDayStyle = (type) => {
    switch (type) {
      case 'today': return { backgroundColor: '#F48FB1' };
      case 'ovulation': return { backgroundColor: '#f06292' };
      case 'fertile': return { backgroundColor: '#FCE4EC' };
      case 'period': return { backgroundColor: '#EF9A9A' };
      case 'logged': return { backgroundColor: '#E8EAF6' };
      default: return { backgroundColor: 'white' };
    }
  };
  const getDayTextStyle = (type) => {
    switch (type) {
      case 'today': return { color: 'white', fontWeight: 'bold' };
      case 'ovulation': return { color: 'white', fontWeight: 'bold' };
      case 'fertile': return { color: '#c2185b', fontWeight: '600' };
      case 'period': return { color: 'white', fontWeight: '600' };
      case 'logged': return { color: '#7986CB', fontWeight: '600' };
      default: return { color: '#616161' };
    }
  };
  const selectedInfo = {
    today:     { label: 'Today',          emoji: '🌸', desc: `Cycle day ${CYCLE_DAY} of ${CYCLE_LENGTH}. ${isFertile ? 'You are in your fertile window!' : 'Regular tracking day.'}` },
    ovulation: { label: 'Ovulation Day',  emoji: '🥚', desc: 'Peak fertility day! This is when the egg is released.' },
    fertile:   { label: 'Fertile Window', emoji: '🌱', desc: 'You are in your fertile window. Intimacy now can lead to conception.' },
    period:    { label: 'Period Days',    emoji: '🩸', desc: 'Menstruation phase. Rest and stay hydrated.' },
    logged:    { label: 'Past Day',       emoji: '✅', desc: 'This day has been logged.' },
    future:    { label: 'Future Day',     emoji: '📅', desc: 'Keep tracking daily to improve your predictions.' },
  };
  const info = selectedInfo[getDayType(selectedDay)] || selectedInfo.future;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 4 }}>Full Calendar 📅</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{monthName}</Text>
        </View>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <AnimatedStatCard label="CYCLE DAY" val={`${CYCLE_DAY}`}         sub={`of ${CYCLE_LENGTH}`} color="#F48FB1" delay={0}   />
          <AnimatedStatCard label="OVULATION" val={`Day ${OVULATION_DAY}`} sub="predicted"            color="#f06292" delay={100} />
          <AnimatedStatCard label="PERIOD"    val={`${daysUntilPeriod}d`}  sub="away"                 color="#CE93D8" delay={200} />
        </View>
        <View style={[s.wideCard, { marginBottom: 16 }]}>
          <Text style={[s.featureTitle, { marginBottom: 14, textAlign: 'center' }]}>{monthName}</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 'bold', color: '#bdbdbd' }}>{d}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: firstDayOffset }, (_, i) => (
              <View key={`empty-${i}`} style={{ width: '14.28%', height: 44 }} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1; const type = getDayType(day);
              return (
                <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={{ width: '14.28%', height: 44, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                  <View style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: selectedDay === day ? 2 : 0, borderColor: '#F48FB1' }, getDayStyle(type)]}>
                    <Text style={[{ fontSize: 12 }, getDayTextStyle(type)]}>{day}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }}>
            {[{ color: '#F48FB1', label: 'Today' }, { color: '#EF9A9A', label: 'Period' }, { color: '#FCE4EC', label: 'Fertile' }, { color: '#f06292', label: 'Ovulation' }, { color: '#E8EAF6', label: 'Logged' }].map((l, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l.color }} />
                <Text style={{ fontSize: 10, color: '#9e9e9e', fontWeight: '600' }}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[s.wideCard, { marginBottom: 16, backgroundColor: '#FFF0F5', borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.3)' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <Text style={{ fontSize: 32 }}>{info.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#F48FB1', letterSpacing: 1, marginBottom: 2 }}>DAY {selectedDay}</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1a1a2e' }}>{info.label}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, color: '#616161', lineHeight: 20 }}>{info.desc}</Text>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}

function NotificationsScreen({ goTo, scheduleNotification }) {
  const [notifs, setNotifs] = useState([
    { id: 1, emoji: '🌸', title: 'Fertile window starting soon', body: 'Your fertile window begins in 2 days!', time: '2 min ago', read: false, type: 'fertility' },
    { id: 2, emoji: '💊', title: 'Time for your vitamins!', body: 'Do not forget your prenatal vitamins today.', time: '1 hour ago', read: false, type: 'reminder' },
    { id: 3, emoji: '🌡️', title: 'Log your BBT temperature', body: 'Best time to log is first thing in the morning.', time: '3 hours ago', read: true, type: 'reminder' },
    { id: 4, emoji: '💬', title: 'Sarah replied to your post', body: 'Sending you so much love! You have got this', time: 'Yesterday', read: true, type: 'community' },
    { id: 5, emoji: '👑', title: 'Upgrade to Pro', body: 'Unlock Intimacy Health, Nutrition Planner and more!', time: '2 days ago', read: true, type: 'promo' },
  ]);
  const [activeFilter, setActiveFilter] = useState('All');
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifs(prev => prev.filter(n => n.id !== id));
  const filtered = notifs.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Fertility') return n.type === 'fertility';
    if (activeFilter === 'Reminders') return n.type === 'reminder';
    if (activeFilter === 'Community') return n.type === 'community';
    return true;
  });
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Profile')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 4 }}>Notifications 🔔</Text>
              {unreadCount > 0 && <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{unreadCount} unread</Text>}
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead} style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, paddingVertical: 12 }}>
          {['All', 'Fertility', 'Reminders', 'Community'].map(f => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: activeFilter === f ? '#F48FB1' : 'white', borderWidth: 1.5, borderColor: activeFilter === f ? '#F48FB1' : 'rgba(0,0,0,0.08)' }]}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeFilter === f ? 'white' : '#616161' }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[s.wideCard, { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFF0F5', borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.3)' }]}>
          <Text style={[s.featureTitle, { marginBottom: 6, color: '#F48FB1' }]}>🔔 Schedule a reminder</Text>
          <View style={{ gap: 8 }}>
            {[
              { title: '💊 Vitamin reminder', body: 'Time to take your prenatal vitamins! 🌸', seconds: 5 },
              { title: '🌡️ BBT reminder', body: 'Log your temperature before getting up!', seconds: 10 },
              { title: '💧 Water reminder', body: 'Have you had enough water today? 💕', seconds: 15 },
              { title: '🌸 Fertile window alert', body: 'Your fertile window is coming up!', seconds: 20 },
            ].map((notif, i) => (
              <TouchableOpacity key={i} onPress={() => scheduleNotification(notif.title, notif.body, notif.seconds)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(244,143,177,0.2)' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FCE4EC', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20 }}>{notif.title.split(' ')[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1a1a2e' }}>{notif.title}</Text>
                </View>
                <View style={{ backgroundColor: '#F48FB1', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>Send 🔔</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          {filtered.map(notif => (
            <TouchableOpacity key={notif.id} onPress={() => markRead(notif.id)} style={[s.wideCard, { marginBottom: 10, borderLeftWidth: 4, borderLeftColor: notif.read ? 'rgba(244,143,177,0.2)' : '#F48FB1', opacity: notif.read ? 0.85 : 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: notif.read ? '#f5f5f5' : '#FCE4EC', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22 }}>{notif.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: notif.read ? '600' : 'bold', color: '#1a1a2e', flex: 1, marginBottom: 4 }}>{notif.title}</Text>
                  <Text style={{ fontSize: 12, color: '#616161', lineHeight: 17, marginBottom: 6 }}>{notif.body}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#bdbdbd' }}>{notif.time}</Text>
                    <TouchableOpacity onPress={() => deleteNotif(notif.id)}>
                      <Text style={{ fontSize: 11, color: '#bdbdbd', fontWeight: '600' }}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}
function SymptomCheckerScreen({ goTo }) {
  const [selected, setSelected] = useState([]);
  const [result, setResult]     = useState(null);
  const [checking, setChecking] = useState(false);
  const fade  = useFadeIn();
  const slide = useSlideUp();

  const symptoms = [
    { id: 1,  emoji: '🤕', label: 'Headache'            },
    { id: 2,  emoji: '😴', label: 'Fatigue'             },
    { id: 3,  emoji: '🤢', label: 'Nausea'              },
    { id: 4,  emoji: '🩸', label: 'Spotting'            },
    { id: 5,  emoji: '🌡️', label: 'Fever'               },
    { id: 6,  emoji: '💊', label: 'Cramps'              },
    { id: 7,  emoji: '😰', label: 'Bloating'            },
    { id: 8,  emoji: '💧', label: 'Discharge changes'   },
    { id: 9,  emoji: '🫀', label: 'Heart palpitations'  },
    { id: 10, emoji: '😮', label: 'Shortness of breath' },
    { id: 11, emoji: '🦵', label: 'Leg swelling'        },
    { id: 12, emoji: '👁️', label: 'Vision changes'      },
    { id: 13, emoji: '🧠', label: 'Brain fog'           },
    { id: 14, emoji: '😔', label: 'Low mood'            },
    { id: 15, emoji: '😤', label: 'Anxiety'             },
    { id: 16, emoji: '🔥', label: 'Hot flushes'         },
  ];

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const checkSymptoms = () => {
    setChecking(true);
    setTimeout(() => {
      const hasRedFlag      = selected.some(id => [9, 10, 11, 12].includes(id));
      const hasMood         = selected.some(id => [14, 15].includes(id));
      const hasPregSymptoms = selected.some(id => [3, 6, 4].includes(id));
      if (hasRedFlag) {
        setResult({ title: 'Please seek medical attention', message: 'Some of your symptoms may require prompt medical evaluation. Please contact your GP or go to A&E if symptoms are severe.', color: '#EF5350', bg: '#FFEBEE', emoji: '🚨' });
      } else if (hasMood) {
        setResult({ title: 'Consider speaking to your GP', message: 'You are experiencing mood-related symptoms. This is very common during hormonal changes. You are not alone 💕', color: '#FF9800', bg: '#FFF3E0', emoji: '💛' });
      } else if (hasPregSymptoms) {
        setResult({ title: 'Possible early pregnancy symptoms', message: 'Nausea, cramps, and spotting can be signs of early pregnancy. Take a pregnancy test and speak to your GP for confirmation.', color: '#F48FB1', bg: '#FCE4EC', emoji: '🌸' });
      } else {
        setResult({ title: 'Monitor your symptoms', message: 'Your symptoms may be related to your menstrual cycle. Stay hydrated, rest well. If symptoms persist, please see your GP.', color: '#4CAF50', bg: '#E8F5E9', emoji: '💚' });
      }
      setChecking(false);
    }, 1500);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 4 }}>Symptom Checker 🔍</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Select all symptoms you are experiencing</Text>
        </View>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={{ backgroundColor: '#FFF3E0', borderRadius: 14, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
          <Text style={{ fontSize: 11, color: '#E65100', fontWeight: '600', lineHeight: 18 }}>This tool is for educational guidance only. Always consult a qualified healthcare professional.</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {symptoms.map(sym => (
            <TouchableOpacity key={sym.id} onPress={() => toggle(sym.id)} style={[{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 6 }, selected.includes(sym.id) && { backgroundColor: '#FCE4EC', borderColor: '#F48FB1' }]}>
              <Text style={{ fontSize: 16 }}>{sym.emoji}</Text>
              <Text style={[{ fontSize: 12, fontWeight: '700', color: '#616161' }, selected.includes(sym.id) && { color: '#c2185b' }]}>{sym.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {selected.length > 0 && !result && (
          <TouchableOpacity style={[s.primaryBtn, checking && { opacity: 0.7 }]} onPress={checkSymptoms} disabled={checking}>
            <Text style={s.primaryBtnTxt}>{checking ? 'Checking... 🔍' : `Check ${selected.length} symptom${selected.length > 1 ? 's' : ''} →`}</Text>
          </TouchableOpacity>
        )}
        {result && (
          <View style={{ backgroundColor: result.bg, borderRadius: 18, padding: 18, borderWidth: 2, borderColor: result.color + '44' }}>
            <Text style={{ fontSize: 32, marginBottom: 10, textAlign: 'center' }}>{result.emoji}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: result.color, marginBottom: 10, textAlign: 'center' }}>{result.title}</Text>
            <Text style={{ fontSize: 13, color: '#616161', lineHeight: 22, marginBottom: 16 }}>{result.message}</Text>
            <TouchableOpacity onPress={() => Linking.openURL('tel:+44111')} style={{ height: 44, borderRadius: 22, backgroundColor: result.color, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>📞 Contact my GP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setResult(null); setSelected([]); }} style={{ height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: result.color, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: result.color, fontWeight: 'bold', fontSize: 13 }}>Check again</Text>
            </TouchableOpacity>
          </View>
        )}
        {selected.length === 0 && !result && (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🔍</Text>
            <Text style={{ fontSize: 13, color: '#9e9e9e', textAlign: 'center' }}>Select your symptoms above to get guidance</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function PartnerModeScreen({ goTo, userPlan, userName }) {
  const fade        = useFadeIn();
  const slide       = useSlideUp();
  const isPlusOrPro = userPlan === 'PLUS' || userPlan === 'PRO';
  const firstName   = userName ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : 'Friend';

  if (!isPlusOrPro) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF8FA', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ position: 'absolute', top: 60, left: 16 }}>
          <TouchableOpacity onPress={() => goTo('Home')}><Text style={{ color: '#F48FB1', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        </View>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>👫</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 10, textAlign: 'center' }}>Partner Mode</Text>
        <Text style={{ fontSize: 14, color: '#9e9e9e', textAlign: 'center', lineHeight: 22, marginBottom: 30 }}>Share your cycle journey with your partner. Available on Plus and Pro plans.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => goTo('Subscription')}><Text style={s.primaryBtnTxt}>Upgrade to Plus 💜</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => goTo('Home')} style={{ marginTop: 12 }}><Text style={{ color: '#9e9e9e', fontSize: 13 }}>Maybe later</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}><Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 8 }}>Partner Mode 👫</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Share your journey with your partner</Text>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={[s.wideCard, { marginBottom: 16 }]}>
          <Text style={[s.featureTitle, { marginBottom: 6 }]}>💌 Invite your partner</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>📧</Text>
            <TextInput style={s.input} placeholder="Partner's email address" placeholderTextColor="#BDBDBD" keyboardType="email-address" autoCapitalize="none" />
          </View>
          <TouchableOpacity style={s.primaryBtn} onPress={() => Alert.alert('Invitation sent! 💕', 'Your partner will receive an email with instructions.')}><Text style={s.primaryBtnTxt}>Send invitation 💕</Text></TouchableOpacity>
        </View>
        <View style={[s.wideCard, { marginBottom: 16, backgroundColor: '#FCE4EC' }]}>
          <Text style={[s.featureTitle, { marginBottom: 4, color: '#c2185b' }]}>🌸 What your partner sees today</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 14, marginTop: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 }}>
              {isFertile ? '🌱 Fertile window' : CYCLE_DAY > 21 ? '🌙 Pre-period phase' : '💕 Regular phase'}
            </Text>
            <Text style={{ fontSize: 13, color: '#616161', lineHeight: 20 }}>
              {isFertile ? `${firstName} is in her fertile window. Show extra affection today.` :
               CYCLE_DAY > 21 ? `${firstName} may be approaching her period. Extra cuddles go a long way 💕` :
               `${firstName} is in the middle of her cycle. A great time for quality time together.`}
            </Text>
          </View>
        </View>
        {[
          { emoji: '💊', tip: 'Remind her about vitamins and medications' },
          { emoji: '💧', tip: 'Encourage her to drink enough water today' },
          { emoji: '🧘', tip: 'Be patient — hormones can affect mood' },
          { emoji: '🍲', tip: 'Cook or order her favourite meal' },
          { emoji: '💬', tip: 'Check in with how are you feeling today' },
          { emoji: '🤗', tip: 'Extra hugs are always appreciated' },
        ].map((item, i) => (
          <View key={i} style={[s.wideCard, { marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
            <Text style={{ flex: 1, fontSize: 13, color: '#616161', lineHeight: 18 }}>{item.tip}</Text>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}

function NutritionScreen({ goTo, userPlan, userJourney }) {
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const isPro = userPlan === 'PRO';

  if (!isPro) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF8FA', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ position: 'absolute', top: 60, left: 16 }}>
          <TouchableOpacity onPress={() => goTo('Home')}><Text style={{ color: '#F48FB1', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        </View>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>🥗</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 10, textAlign: 'center' }}>Nutrition Planner</Text>
        <Text style={{ fontSize: 14, color: '#9e9e9e', textAlign: 'center', lineHeight: 22, marginBottom: 30 }}>Personalised nutrition guidance. Pro feature.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => goTo('Subscription')}><Text style={s.primaryBtnTxt}>Upgrade to Pro 👑</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => goTo('Home')} style={{ marginTop: 12 }}><Text style={{ color: '#9e9e9e', fontSize: 13 }}>Maybe later</Text></TouchableOpacity>
      </View>
    );
  }

  const nutrients = {
    ttc: [
      { name: 'Folic Acid', amount: '400mcg/day', food: 'Leafy greens, fortified cereals', emoji: '🥬', reason: 'Prevents neural tube defects' },
      { name: 'Iron',       amount: '18mg/day',   food: 'Red meat, lentils, spinach',      emoji: '🥩', reason: 'Supports healthy blood and fertility' },
      { name: 'Vitamin D',  amount: '10mcg/day',  food: 'Oily fish, egg yolks, sunlight',  emoji: '🐟', reason: 'Linked to improved fertility outcomes' },
      { name: 'Omega-3',    amount: '250mg DHA',  food: 'Salmon, walnuts, flaxseeds',      emoji: '🐠', reason: 'Supports egg quality' },
      { name: 'Zinc',       amount: '8mg/day',    food: 'Pumpkin seeds, chickpeas, beef',  emoji: '🌻', reason: 'Essential for reproductive health' },
      { name: 'CoQ10',      amount: '200-600mg',  food: 'Supplement recommended',          emoji: '💊', reason: 'Improves egg quality' },
    ],
    pregnant: [
      { name: 'Folic Acid', amount: '400mcg/day',  food: 'Leafy greens, cereals', emoji: '🥬', reason: 'Critical in first trimester' },
      { name: 'Iron',       amount: '27mg/day',    food: 'Red meat, lentils',     emoji: '🥩', reason: 'Prevents anaemia in pregnancy' },
      { name: 'Calcium',    amount: '1000mg/day',  food: 'Dairy, tofu, milk',     emoji: '🥛', reason: 'Baby bone development' },
      { name: 'Vitamin D',  amount: '10mcg/day',   food: 'Oily fish, supplements',emoji: '🐟', reason: 'Calcium absorption and immunity' },
      { name: 'Protein',    amount: '75-100g/day', food: 'Eggs, chicken, legumes',emoji: '🥚', reason: 'Baby growth and development' },
      { name: 'DHA',        amount: '200mg/day',   food: 'Oily fish, algae',      emoji: '🐠', reason: 'Baby brain and eye development' },
    ],
  };

  const plan = nutrients[userJourney] || nutrients.ttc;
  const mealPlan = [
    { meal: 'Breakfast',   emoji: '🌅', items: ['Greek yoghurt with berries', 'Whole grain toast with avocado and egg'] },
    { meal: 'Lunch',       emoji: '☀️', items: ['Salmon salad with leafy greens', 'Brown rice'] },
    { meal: 'Dinner',      emoji: '🌙', items: ['Lean protein', 'Roasted vegetables', 'Quinoa or sweet potato'] },
    { meal: 'Evening',     emoji: '🌟', items: ['Turmeric milk or herbal tea', 'Prenatal vitamin'] },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}><Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 8 }}>Nutrition Planner 🥗</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Personalised for your journey</Text>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={{ backgroundColor: '#FFF3E0', borderRadius: 14, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
          <Text style={{ fontSize: 11, color: '#E65100', fontWeight: '600', lineHeight: 18 }}>General nutritional guidance only. Always consult a registered dietitian or GP for personalised advice.</Text>
        </View>
        <Text style={[s.sectionLabel, { marginLeft: 0, marginTop: 0 }]}>Key nutrients for you</Text>
        {plan.map((n, i) => (
          <View key={i} style={[s.wideCard, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 28 }}>{n.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e' }}>{n.name}</Text>
                <Text style={{ fontSize: 11, color: '#F48FB1', fontWeight: '600' }}>{n.amount}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 11, color: '#9e9e9e', marginBottom: 4 }}>Found in: {n.food}</Text>
            <Text style={{ fontSize: 11, color: '#4CAF50', fontWeight: '600' }}>✓ {n.reason}</Text>
          </View>
        ))}
        <Text style={[s.sectionLabel, { marginLeft: 0, marginTop: 8 }]}>Sample meal plan</Text>
        {mealPlan.map((meal, i) => (
          <View key={i} style={[s.wideCard, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 22 }}>{meal.emoji}</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1a1a2e' }}>{meal.meal}</Text>
            </View>
            {meal.items.map((item, j) => (
              <View key={j} style={{ flexDirection: 'row', gap: 8, marginBottom: 5 }}>
                <Text style={{ color: '#F48FB1', fontWeight: 'bold' }}>•</Text>
                <Text style={{ fontSize: 12, color: '#616161', flex: 1, lineHeight: 18 }}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}

function BabyNamesScreen({ goTo, userPlan }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [saved, setSaved]   = useState([]);
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const isPro = userPlan === 'PRO';

  if (!isPro) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF8FA', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ position: 'absolute', top: 60, left: 16 }}>
          <TouchableOpacity onPress={() => goTo('Home')}><Text style={{ color: '#F48FB1', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        </View>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>👶</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 10, textAlign: 'center' }}>Baby Name Generator</Text>
        <Text style={{ fontSize: 14, color: '#9e9e9e', textAlign: 'center', lineHeight: 22, marginBottom: 30 }}>Explore beautiful baby names with meanings and origins. Pro feature.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => goTo('Subscription')}><Text style={s.primaryBtnTxt}>Upgrade to Pro 👑</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => goTo('Home')} style={{ marginTop: 12 }}><Text style={{ color: '#9e9e9e', fontSize: 13 }}>Maybe later</Text></TouchableOpacity>
      </View>
    );
  }

  const names = [
    { name: 'Amara',  gender: 'Girl', origin: 'African',  meaning: 'Grace, eternal',    popular: '⭐⭐⭐⭐'  },
    { name: 'Zara',   gender: 'Girl', origin: 'Arabic',   meaning: 'Blossoming flower', popular: '⭐⭐⭐⭐⭐' },
    { name: 'Isla',   gender: 'Girl', origin: 'Scottish', meaning: 'Island',            popular: '⭐⭐⭐⭐⭐' },
    { name: 'Freya',  gender: 'Girl', origin: 'Norse',    meaning: 'Goddess of love',   popular: '⭐⭐⭐⭐'  },
    { name: 'Luna',   gender: 'Girl', origin: 'Latin',    meaning: 'Moon',              popular: '⭐⭐⭐⭐⭐' },
    { name: 'Aria',   gender: 'Girl', origin: 'Italian',  meaning: 'Air, song',         popular: '⭐⭐⭐⭐'  },
    { name: 'Noah',   gender: 'Boy',  origin: 'Hebrew',   meaning: 'Rest, comfort',     popular: '⭐⭐⭐⭐⭐' },
    { name: 'Elias',  gender: 'Boy',  origin: 'Greek',    meaning: 'My God is Yahweh',  popular: '⭐⭐⭐⭐'  },
    { name: 'Leo',    gender: 'Boy',  origin: 'Latin',    meaning: 'Lion',              popular: '⭐⭐⭐⭐⭐' },
    { name: 'Theo',   gender: 'Boy',  origin: 'Greek',    meaning: 'Divine gift',       popular: '⭐⭐⭐⭐⭐' },
    { name: 'Kai',    gender: 'Both', origin: 'Hawaiian', meaning: 'Sea',               popular: '⭐⭐⭐⭐'  },
    { name: 'River',  gender: 'Both', origin: 'English',  meaning: 'Flowing water',     popular: '⭐⭐⭐'    },
    { name: 'Reine',  gender: 'Girl', origin: 'French',   meaning: 'Queen',             popular: '⭐⭐⭐⭐'  },
    { name: 'Bella',  gender: 'Girl', origin: 'Italian',  meaning: 'Beautiful',         popular: '⭐⭐⭐⭐⭐' },
    { name: 'Sage',   gender: 'Both', origin: 'Latin',    meaning: 'Wise, healthy',     popular: '⭐⭐⭐'    },
    { name: 'Nadia',  gender: 'Girl', origin: 'Slavic',   meaning: 'Hope',              popular: '⭐⭐⭐'    },
    { name: 'Ezra',   gender: 'Boy',  origin: 'Hebrew',   meaning: 'Help, helper',      popular: '⭐⭐⭐⭐'  },
    { name: 'Sienna', gender: 'Girl', origin: 'Italian',  meaning: 'Orange-red',        popular: '⭐⭐⭐⭐'  },
  ];

  const filtered = names.filter(n => {
    const matchGender = filter === 'All' || n.gender === filter || n.gender === 'Both';
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase()) || n.meaning.toLowerCase().includes(search.toLowerCase());
    return matchGender && matchSearch;
  });

  const toggleSave = (name) => setSaved(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}><Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 8 }}>Baby Name Generator 👶</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Discover beautiful names with meanings</Text>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={[s.inputWrap, { marginBottom: 12 }]}>
          <Text style={s.inputIcon}>🔍</Text>
          <TextInput style={s.input} value={search} onChangeText={setSearch} placeholder="Search names or meanings..." placeholderTextColor="#BDBDBD" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {['All', 'Girl', 'Boy', 'Both'].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[{ flex: 1, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: filter === f ? '#F48FB1' : 'rgba(0,0,0,0.1)', backgroundColor: filter === f ? '#F48FB1' : 'white' }]}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: filter === f ? 'white' : '#9e9e9e' }}>
                {f === 'Girl' ? '👧' : f === 'Boy' ? '👦' : f === 'Both' ? '👶' : '✨'} {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {saved.length > 0 && (
          <View style={[s.wideCard, { marginBottom: 16, backgroundColor: '#FCE4EC' }]}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#c2185b', marginBottom: 8 }}>Saved names ({saved.length})</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {saved.map(name => (
                <View key={name} style={{ backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#F48FB1' }}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <Text style={[s.sectionLabel, { marginLeft: 0, marginTop: 0 }]}>{filtered.length} names found</Text>
        {filtered.map((n, i) => (
          <View key={i} style={[s.wideCard, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: n.gender === 'Girl' ? '#FCE4EC' : n.gender === 'Boy' ? '#E8EAF6' : '#E0F2F1', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22 }}>{n.gender === 'Girl' ? '👧' : n.gender === 'Boy' ? '👦' : '👶'}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' }}>{n.name}</Text>
                  <Text style={{ fontSize: 11, color: '#9e9e9e' }}>{n.origin} · {n.gender}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleSave(n.name)}>
                <Text style={{ fontSize: 22 }}>{saved.includes(n.name) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: '#616161', marginBottom: 4 }}>✨ Meaning: {n.meaning}</Text>
            <Text style={{ fontSize: 11, color: '#9e9e9e' }}>Popularity: {n.popular}</Text>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}
function AcademyScreen({ goTo, userJourney, userPlan }) {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch]       = useState('');
  const [completed, setCompleted] = useState([]);
  const [saved, setSaved]         = useState([]);
  const fade  = useFadeIn();
  const slide = useSlideUp();

  const isPlusOrPro = userPlan === 'PLUS' || userPlan === 'PRO';
  const isPro       = userPlan === 'PRO';
  const canAccess   = (plan) => {
    if (plan === 'FREE') return true;
    if (plan === 'PLUS') return isPlusOrPro;
    if (plan === 'PRO')  return isPro;
    return false;
  };

  const categories = ['All', 'TTC', 'Pregnancy', 'Postpartum', 'Mental Health', 'Women Health'];

  const articles = [
    { id: 1,  title: 'Understanding Your Menstrual Cycle',  category: 'TTC',           emoji: '🌸', duration: '5 min',  plan: 'FREE', desc: 'Learn how your cycle works and how to track it.', body: 'Your menstrual cycle is a complex and beautiful process controlled by hormones. The average cycle is 28 days, though anywhere from 21 to 35 days is considered normal.\n\nThe cycle has four phases:\n\n1. Menstruation (Days 1-5): Your uterine lining sheds.\n\n2. Follicular Phase (Days 1-13): Oestrogen rises, thickening the uterine lining.\n\n3. Ovulation (Day 14): A surge in LH causes the release of a mature egg.\n\n4. Luteal Phase (Days 15-28): Progesterone rises to prepare the uterus. If pregnancy does not occur, hormone levels drop and menstruation begins.' },
    { id: 2,  title: 'Fertility 101: What You Need to Know', category: 'TTC',           emoji: '🌱', duration: '7 min',  plan: 'PLUS', desc: 'A complete guide to understanding fertility and ovulation.', body: 'Fertility is the natural ability to conceive a child.\n\nYour fertile window is approximately 6 days long — the 5 days before ovulation and the day of ovulation itself.\n\nSigns of ovulation include:\n• Clear, slippery cervical mucus\n• A slight rise in basal body temperature\n• Mild pelvic pain or cramping\n• Increased sex drive\n\nIf you have been trying for over 12 months (or 6 months if over 35), speak to your GP.' },
    { id: 3,  title: 'C-Section Recovery Guide',            category: 'Postpartum',    emoji: '💊', duration: '8 min',  plan: 'PLUS', desc: 'Everything about recovering from a caesarean section.', body: 'A caesarean section is major abdominal surgery and recovery takes time.\n\nFirst week: Rest is essential. Avoid lifting anything heavier than your baby.\n\nWeeks 2-6: Gradual return to light activity.\n\nBeyond 6 weeks: Most women are cleared at their 6-week check.\n\nContact your GP if you experience increased pain, redness, or fever.' },
    { id: 4,  title: 'Natural Birth Preparation',           category: 'Pregnancy',     emoji: '🤰', duration: '10 min', plan: 'PLUS', desc: 'Practical tips and breathing techniques for natural childbirth.', body: 'Preparing for natural birth involves physical, mental, and practical preparation.\n\nBreathing techniques:\n• Slow breathing: Inhale for 4 counts, exhale for 6 counts during contractions\n• Surge breathing: Long, slow breaths during peaks\n\nPhysical preparation:\n• Perineal massage from 34 weeks reduces tearing risk\n• Gentle yoga and walking keep your body strong\n\nRemember: every birth is different. Being flexible is key.' },
    { id: 5,  title: 'Breastfeeding Basics',                category: 'Postpartum',    emoji: '👶', duration: '6 min',  plan: 'PLUS', desc: 'A beginner-friendly guide to breastfeeding and latching.', body: 'Breastfeeding is natural but can take practice.\n\nGetting a good latch:\n• Bring baby to breast, not breast to baby\n• Baby mouth should cover most of the areola\n• You should feel pulling but not pain\n\nFeeding frequency:\n• Newborns typically feed 8-12 times per 24 hours\n\nContact a lactation consultant if breastfeeding is consistently painful.' },
    { id: 6,  title: 'Postpartum Mental Health',            category: 'Mental Health', emoji: '🧠', duration: '5 min',  plan: 'PLUS', desc: 'Understanding baby blues, postpartum depression and support.', body: 'The postpartum period brings enormous emotional changes.\n\nBaby blues (Days 3-10): Mood swings affecting up to 80% of new mothers. Usually resolves within two weeks.\n\nPostpartum depression: Affects approximately 1 in 5 mothers.\n\nPlease seek help immediately if you feel like harming yourself or your baby.\n\nYou are not alone. PPD is treatable. Contact your GP or midwife.' },
    { id: 7,  title: 'Birth Control Methods Explained',     category: 'Women Health',  emoji: '💊', duration: '8 min',  plan: 'PLUS', desc: 'A clear guide to all types of birth control.', body: 'There are many birth control options available.\n\nHormonal methods:\n• Combined pill: Contains oestrogen and progestogen. 99% effective.\n• Mini pill: Progestogen only. Good for breastfeeding mothers.\n• Implant: Lasts 3 years. Over 99% effective.\n\nBarrier methods:\n• Condoms: Only method protecting against STIs.\n\nLong-acting:\n• Copper coil: Hormone-free, lasts 5-10 years.\n\nAlways discuss options with your GP.' },
    { id: 8,  title: 'Hormones and Your Health',            category: 'Women Health',  emoji: '⚗️', duration: '7 min',  plan: 'PLUS', desc: 'How hormones affect your mood, energy, skin and cycle.', body: 'Hormones are chemical messengers regulating almost every function in your body.\n\nOestrogen: Controls the menstrual cycle, bone density, heart health.\n\nProgesterone: Rises after ovulation. Promotes sleep and calm.\n\nFSH: Stimulates egg development.\n\nLH: Triggers ovulation.\n\nThyroid hormones: Regulate metabolism. Thyroid issues can affect the menstrual cycle and fertility.' },
    { id: 9,  title: 'Nutrition for Women',                 category: 'Women Health',  emoji: '🥗', duration: '6 min',  plan: 'FREE', desc: 'Key nutrients every woman needs at different life stages.', body: 'Good nutrition is the foundation of womens health.\n\nIron: Women lose iron through menstruation. Found in red meat, lentils, spinach.\n\nFolic acid: Essential before and during early pregnancy. 400mcg daily if trying to conceive.\n\nCalcium: Vital for bone health. Found in dairy, tofu, almonds.\n\nVitamin D: Supports calcium absorption and mood.\n\nOmega-3: Supports heart health and brain function.' },
    { id: 10, title: 'Managing Anxiety During TTC',         category: 'Mental Health', emoji: '🧘', duration: '5 min',  plan: 'PLUS', desc: 'Practical strategies to manage the stress of trying to conceive.', body: 'The TTC journey can be emotionally challenging.\n\nAcknowledge your feelings: Anxiety, sadness, and hope are all normal.\n\nPractical coping strategies:\n• Mindfulness: 10 minutes of meditation daily reduces anxiety\n• Exercise: Regular gentle exercise releases endorphins\n• Journalling: Writing helps process difficult emotions\n\nRemember: Stress does not cause infertility, but managing it supports your wellbeing.' },
    { id: 11, title: 'Vitamin D and Fertility',             category: 'TTC',           emoji: '☀️', duration: '4 min',  plan: 'PLUS', desc: 'The link between vitamin D and fertility outcomes.', body: 'Vitamin D plays an important role in reproductive health.\n\nHow vitamin D affects female fertility:\n• Vitamin D receptors are found in the ovaries, uterus, and placenta\n• Adequate levels are linked to improved IVF success rates\n• May improve egg quality and embryo development\n\nHow to optimise vitamin D:\n• Sunlight: 15-20 minutes of midday sun\n• Supplementation: 10mcg daily is recommended in the UK' },
    { id: 12, title: 'Safe Medications in Pregnancy',       category: 'Pregnancy',     emoji: '💉', duration: '9 min',  plan: 'PRO',  desc: 'Which medications are safe during pregnancy.', body: 'Medication safety during pregnancy should always be discussed with your doctor.\n\nGenerally considered safe:\n• Paracetamol: Preferred pain reliever during pregnancy\n• Some antibiotics: Penicillin-based are generally safe\n\nAvoid during pregnancy:\n• Ibuprofen: Especially after 20 weeks\n• Aspirin: Unless specifically prescribed\n\nAlways tell any healthcare provider you are pregnant.' },
  ];

  const filtered = articles.filter(a => {
    const matchTab    = activeTab === 'All' || a.category === activeTab;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleComplete = (id) => setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSave     = (id) => setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 4 }}>Bellava Academy 🎓</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Health education made simple</Text>
        </View>
      </View>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={[s.wideCard, { marginHorizontal: 16, marginTop: 16, marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={s.featureTitle}>📊 Your progress</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#F48FB1' }}>{completed.length}/{articles.length} lessons</Text>
          </View>
          <ProgressBar progress={completed.length / articles.length || 0} color="#F48FB1" label="Lessons completed" />
        </View>
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <View style={[s.inputWrap, { marginBottom: 0 }]}>
            <Text style={s.inputIcon}>🔍</Text>
            <TextInput style={s.input} value={search} onChangeText={setSearch} placeholder="Search articles..." placeholderTextColor="#BDBDBD" />
            {search ? <TouchableOpacity onPress={() => setSearch('')}><Text style={{ fontSize: 16, color: '#bdbdbd' }}>x</Text></TouchableOpacity> : null}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, paddingLeft: 16 }}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setActiveTab(cat)} style={[{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: activeTab === cat ? '#F48FB1' : 'white', borderWidth: 1.5, borderColor: activeTab === cat ? '#F48FB1' : 'rgba(0,0,0,0.08)' }]}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeTab === cat ? 'white' : '#616161' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[s.sectionLabel, { marginLeft: 16 }]}>Articles ({filtered.length})</Text>
        {filtered.map(article => {
          const access     = canAccess(article.plan);
          const isComplete = completed.includes(article.id);
          const isSaved    = saved.includes(article.id);
          return (
            <TouchableOpacity key={article.id} onPress={() => access ? goTo('Article', article) : goTo('Subscription')} style={[s.wideCard, { marginHorizontal: 16, marginBottom: 10, opacity: access ? 1 : 0.75 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: '#FCE4EC', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{article.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e', flex: 1 }}>{article.title}</Text>
                    {!access && <Text style={{ fontSize: 14 }}>🔒</Text>}
                    {isComplete && <Text style={{ fontSize: 14 }}>✅</Text>}
                  </View>
                  <Text style={{ fontSize: 11, color: '#9e9e9e', lineHeight: 16, marginBottom: 8 }}>{article.desc}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ backgroundColor: '#FFF0F5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#F48FB1' }}>{article.duration}</Text>
                    </View>
                    <View style={{ backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#9e9e9e' }}>{article.category}</Text>
                    </View>
                    {article.plan !== 'FREE' && (
                      <View style={{ backgroundColor: article.plan === 'PRO' ? '#FCE4EC' : '#EDE7F6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: article.plan === 'PRO' ? '#c2185b' : '#7E57C2' }}>{article.plan}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', gap: 8, marginLeft: 'auto' }}>
                      <TouchableOpacity onPress={() => toggleSave(article.id)}>
                        <Text style={{ fontSize: 16 }}>{isSaved ? '🔖' : '🗂️'}</Text>
                      </TouchableOpacity>
                      {access && (
                        <TouchableOpacity onPress={() => toggleComplete(article.id)}>
                          <Text style={{ fontSize: 16 }}>{isComplete ? '✅' : '⭕'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}

function ArticleScreen({ goTo, article }) {
  const [liked, setLiked]         = useState(false);
  const [saved, setSaved]         = useState(false);
  const [completed, setCompleted] = useState(false);
  const [heartAnim, bounce]       = useHeartBounce();
  const fade = useFadeIn();

  const displayArticle = article || {
    title: 'Health Article', emoji: '🌸', category: 'TTC', duration: '5 min',
    body: 'Welcome to Bellava Academy. Select an article to read.',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Academy')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>{displayArticle.emoji} {displayArticle.category}</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>{displayArticle.duration}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 10, lineHeight: 30 }}>{displayArticle.title}</Text>
      </View>
      <Animated.View style={{ padding: 20, opacity: fade }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20, backgroundColor: 'white', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <TouchableOpacity style={{ alignItems: 'center', gap: 4 }} onPress={() => { bounce(); setLiked(!liked); }}>
            <Animated.Text style={{ fontSize: 24, transform: [{ scale: heartAnim }] }}>{liked ? '❤️' : '🤍'}</Animated.Text>
            <Text style={{ fontSize: 10, color: liked ? '#F48FB1' : '#9e9e9e', fontWeight: '600' }}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', gap: 4 }} onPress={() => setSaved(!saved)}>
            <Text style={{ fontSize: 24 }}>{saved ? '🔖' : '🗂️'}</Text>
            <Text style={{ fontSize: 10, color: saved ? '#F48FB1' : '#9e9e9e', fontWeight: '600' }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', gap: 4 }} onPress={() => setCompleted(!completed)}>
            <Text style={{ fontSize: 24 }}>{completed ? '✅' : '⭕'}</Text>
            <Text style={{ fontSize: 10, color: completed ? '#4CAF50' : '#9e9e9e', fontWeight: '600' }}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', gap: 4 }} onPress={() => Share.share({ message: `Check out this article on Bellava: ${displayArticle.title}` })}>
            <Text style={{ fontSize: 24 }}>📤</Text>
            <Text style={{ fontSize: 10, color: '#9e9e9e', fontWeight: '600' }}>Share</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: '#FFF3E0', borderRadius: 14, padding: 14, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#FF9800', flexDirection: 'row', gap: 10 }}>
          <Text style={{ fontSize: 18 }}>⚠️</Text>
          <Text style={{ fontSize: 11, color: '#E65100', lineHeight: 18, flex: 1, fontWeight: '600' }}>Medical disclaimer: This article is for educational purposes only. Always consult a qualified healthcare professional before making any health decisions.</Text>
        </View>
        <Text style={{ fontSize: 14, color: '#616161', lineHeight: 24 }}>{displayArticle.body}</Text>
        <View style={{ backgroundColor: '#FFF0F5', borderRadius: 16, padding: 16, marginTop: 20, marginBottom: 20, borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.25)' }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F48FB1', marginBottom: 8 }}>🌸 Remember</Text>
          <Text style={{ fontSize: 12, color: '#616161', lineHeight: 20 }}>Every woman's body is unique. Always work with your healthcare provider for personalised guidance.</Text>
        </View>
        <TouchableOpacity onPress={() => setCompleted(true)} style={[s.primaryBtn, completed && { backgroundColor: '#4CAF50' }]}>
          <Text style={s.primaryBtnTxt}>{completed ? '✅ Lesson completed!' : 'Mark as completed'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

function CareFinderScreen({ goTo }) {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch]       = useState('');
  const [medSearch, setMedSearch] = useState('');
  const [showMedResult, setShowMedResult] = useState(false);
  const fade  = useFadeIn();
  const slide = useSlideUp();

  const facilities = [
    { name: "St Mary's Hospital",     type: 'Hospital', distance: '0.8 km', rating: '4.8', open: true,  emoji: '🏥', address: '123 Praed Street London W2', phone: '+442071234567' },
    { name: 'Reine Health Clinic',    type: 'Clinic',   distance: '1.2 km', rating: '4.9', open: true,  emoji: '🏪', address: '45 Oxford Street London W1', phone: '+442079876543' },
    { name: 'Boots Pharmacy',         type: 'Pharmacy', distance: '0.3 km', rating: '4.5', open: true,  emoji: '💊', address: '78 High Street London W1',   phone: '+442071112222' },
    { name: 'City Diagnostic Lab',    type: 'Lab',      distance: '2.1 km', rating: '4.7', open: false, emoji: '🔬', address: '22 Baker Street London NW1', phone: '+442073334444' },
    { name: "Chelsea Women's Clinic", type: 'Clinic',   distance: '3.4 km', rating: '4.9', open: true,  emoji: '🏪', address: '88 Kings Road London SW3',   phone: '+442075556666' },
    { name: 'Superdrug Pharmacy',     type: 'Pharmacy', distance: '0.5 km', rating: '4.3', open: true,  emoji: '💊', address: '34 Regent Street London W1', phone: '+442077778888' },
  ];

  const medications = {
    paracetamol: { name: 'Paracetamol', uses: 'Pain relief and fever reduction.', howItWorks: 'Blocks pain signals in the brain and reduces fever.', pregnancySafety: 'Generally safe at recommended doses.', breastfeedingSafety: 'Safe during breastfeeding.', sideEffects: 'Rare at normal doses. Overdose causes serious liver damage.', avoid: 'Avoid with liver disease. Do not exceed 4g per day.' },
    ibuprofen:   { name: 'Ibuprofen',   uses: 'Anti-inflammatory pain relief.', howItWorks: 'Blocks prostaglandins causing pain and inflammation.', pregnancySafety: 'NOT recommended during pregnancy, especially after 20 weeks.', breastfeedingSafety: 'Low levels in breast milk. Generally safe short-term.', sideEffects: 'Stomach irritation. Always take with food.', avoid: 'Avoid in pregnancy, with kidney problems, or stomach ulcers.' },
    folicacid:   { name: 'Folic Acid',  uses: 'Prevents neural tube defects.', howItWorks: 'Essential B vitamin for DNA synthesis and cell division.', pregnancySafety: 'Strongly recommended. 400mcg daily.', breastfeedingSafety: 'Safe and beneficial during breastfeeding.', sideEffects: 'Very rare at recommended doses.', avoid: 'No significant contraindications at recommended doses.' },
  };

  const getMedResult = () => medications[medSearch.toLowerCase().replace(/\s/g, '')] || null;
  const filteredFacilities = facilities.filter(f => (activeTab === 'All' || f.type === activeTab) && f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={s.pinkHeader}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginTop: 4 }}>Care Finder 🏥</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Find nearby health services</Text>
        </View>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={[s.inputWrap, { marginBottom: 12 }]}>
          <Text style={s.inputIcon}>📍</Text>
          <TextInput style={s.input} value={search} onChangeText={setSearch} placeholder="Search by name..." placeholderTextColor="#BDBDBD" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {['All', 'Hospital', 'Clinic', 'Pharmacy', 'Lab'].map((tab, i) => (
            <TouchableOpacity key={i} onPress={() => setActiveTab(tab)} style={[{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: activeTab === tab ? '#F48FB1' : 'white', borderWidth: 1.5, borderColor: activeTab === tab ? '#F48FB1' : 'rgba(0,0,0,0.08)' }]}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeTab === tab ? 'white' : '#616161' }}>
                {tab === 'Hospital' ? '🏥' : tab === 'Clinic' ? '🏪' : tab === 'Pharmacy' ? '💊' : tab === 'Lab' ? '🔬' : '✨'} {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{ height: 160, backgroundColor: '#E8F5E9', borderRadius: 20, marginBottom: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(76,175,80,0.3)' }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🗺️</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 }}>Map View</Text>
          <Text style={{ fontSize: 11, color: '#9e9e9e', textAlign: 'center' }}>Google Maps integration coming soon</Text>
        </View>
        <Text style={[s.sectionLabel, { marginLeft: 0, marginTop: 0 }]}>Nearby ({filteredFacilities.length} found)</Text>
        {filteredFacilities.map((facility, i) => (
          <View key={i} style={[s.wideCard, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FCE4EC', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>{facility.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e', flex: 1 }}>{facility.name}</Text>
                  <View style={{ backgroundColor: facility.open ? '#E8F5E9' : '#FFEBEE', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: facility.open ? '#2E7D32' : '#c62828' }}>{facility.open ? 'OPEN' : 'CLOSED'}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#9e9e9e', marginBottom: 6 }}>{facility.address}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, color: '#F48FB1', fontWeight: '600' }}>{facility.distance}</Text>
                  <Text style={{ fontSize: 11, color: '#FFB74D', fontWeight: '600' }}>⭐ {facility.rating}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={{ flex: 1, height: 34, borderRadius: 17, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center' }} onPress={() => Linking.openURL(`tel:${facility.phone}`)}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>📞 Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, height: 34, borderRadius: 17, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }} onPress={() => Linking.openURL(`maps://maps.google.com/maps?q=${encodeURIComponent(facility.address)}`)}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2E7D32' }}>🗺️ Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
        <Text style={[s.sectionLabel, { marginLeft: 0, marginTop: 8 }]}>Medication Education 💊</Text>
        <View style={[s.wideCard, { marginBottom: 20 }]}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 }}>Search a medication</Text>
          <Text style={{ fontSize: 11, color: '#9e9e9e', marginBottom: 12 }}>Try: paracetamol · ibuprofen · folicacid</Text>
          <View style={[s.inputWrap, { marginBottom: 10 }]}>
            <Text style={s.inputIcon}>💊</Text>
            <TextInput style={s.input} value={medSearch} onChangeText={setMedSearch} placeholder="Enter medication name..." placeholderTextColor="#BDBDBD" autoCapitalize="none" />
          </View>
          <TouchableOpacity style={s.primaryBtn} onPress={() => setShowMedResult(true)}>
            <Text style={s.primaryBtnTxt}>Search medication →</Text>
          </TouchableOpacity>
          {showMedResult && medSearch && (() => {
            const med = getMedResult();
            if (!med) return (
              <View style={{ backgroundColor: '#FFEBEE', borderRadius: 12, padding: 14, marginTop: 12 }}>
                <Text style={{ fontSize: 13, color: '#c62828', fontWeight: '600' }}>Medication not found in our database yet.</Text>
              </View>
            );
            return (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 14 }}>{med.name}</Text>
                {[
                  { label: 'What it is used for',  value: med.uses               },
                  { label: 'How it works',          value: med.howItWorks         },
                  { label: 'Pregnancy safety',      value: med.pregnancySafety    },
                  { label: 'Breastfeeding safety',  value: med.breastfeedingSafety },
                  { label: 'Side effects',          value: med.sideEffects        },
                  { label: 'When to avoid',         value: med.avoid              },
                ].map((item, i) => (
                  <View key={i} style={{ marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#F48FB1', marginBottom: 4 }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, color: '#616161', lineHeight: 18 }}>{item.value}</Text>
                  </View>
                ))}
              </View>
            );
          })()}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function IntimacyScreen({ goTo, userPlan }) {
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const isPro = userPlan === 'PRO';

  if (!isPro) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF8FA', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ position: 'absolute', top: 60, left: 16 }}>
          <TouchableOpacity onPress={() => goTo('Home')}><Text style={{ color: '#F48FB1', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        </View>
        <Text style={{ fontSize: 56, marginBottom: 20 }}>🔒</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 10, textAlign: 'center' }}>Pro Feature</Text>
        <Text style={{ fontSize: 14, color: '#9e9e9e', textAlign: 'center', lineHeight: 22, marginBottom: 30 }}>Intimacy and Relationship Health is a Pro feature.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => goTo('Subscription')}><Text style={s.primaryBtnTxt}>Upgrade to Pro 👑</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => goTo('Home')} style={{ marginTop: 12 }}><Text style={{ color: '#9e9e9e', fontSize: 13 }}>Maybe later</Text></TouchableOpacity>
      </View>
    );
  }

  const topics = [
    { id: 1, title: 'Emotional Intimacy in Relationships', emoji: '💞', duration: '5 min', desc: 'Building deeper emotional connection through communication and vulnerability.' },
    { id: 2, title: 'Libido Changes During Pregnancy',    emoji: '🤰', duration: '6 min', desc: 'Understanding why sex drive changes during pregnancy.' },
    { id: 3, title: 'Postpartum Intimacy Guide',          emoji: '👶', duration: '7 min', desc: 'When and how to resume intimacy after birth.' },
    { id: 4, title: 'Communicating with Your Partner',   emoji: '💬', duration: '5 min', desc: 'Practical strategies to strengthen relationships.' },
    { id: 5, title: 'Pain During Intercourse',           emoji: '⚕️', duration: '6 min', desc: 'Medical information about dyspareunia — causes and treatment.' },
    { id: 6, title: 'Safe Sex Education',                emoji: '💊', duration: '7 min', desc: 'Guide to contraception, STI prevention, and sexual health.' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Home')}><Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text></TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 10 }}>Intimacy and Relationship Health 💕</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Educational health content only</Text>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={{ backgroundColor: '#FFF3E0', borderRadius: 14, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
          <Text style={{ fontSize: 11, color: '#BF360C', lineHeight: 18 }}>All content is strictly educational. For personal medical advice, please consult a qualified healthcare professional or therapist.</Text>
        </View>
        {topics.map(topic => (
          <View key={topic.id} style={[s.wideCard, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FCE4EC', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>{topic.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 }}>{topic.title}</Text>
                <Text style={{ fontSize: 11, color: '#9e9e9e', lineHeight: 16, marginBottom: 8 }}>{topic.desc}</Text>
                <View style={{ backgroundColor: '#FFF0F5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#F48FB1' }}>{topic.duration}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </Animated.View>
    </ScrollView>
  );
}
function CommunityScreen({ goTo, userName }) {
  const [activeTab, setActiveTab] = useState('🌱 TTC');
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [newPost, setNewPost]     = useState('');
  const [posting, setPosting]     = useState(false);
  const [showInput, setShowInput] = useState(false);

  const staticPosts = [
    { id: 's1', author_name: 'Sarah M.',     is_anonymous: false, body: "Just got a positive OPK! This is our 4th cycle trying. Anyone else find the TWW absolutely exhausting? Sending love to everyone in the wait.", like_count: 18, comment_count: 2, created_at: new Date(Date.now() - 120000).toISOString() },
    { id: 's2', author_name: 'Anonymous',    is_anonymous: true,  body: "Does anyone else feel like they cannot talk to people in their life about TTC? I feel so alone in this journey.", like_count: 34, comment_count: 5, created_at: new Date(Date.now() - 900000).toISOString() },
    { id: 's3', author_name: 'Dr. Amara O.', is_anonymous: false, body: "Reminder: taking prenatal vitamins 3 months before conception significantly improves egg quality. Folic acid 400mcg daily is key.", like_count: 67, comment_count: 8, created_at: new Date(Date.now() - 3600000).toISOString() },
  ];

  useEffect(() => { loadPosts(); }, [activeTab]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const groupMap = { '🌱 TTC': 'ttc', '🤰 Pregnancy': 'pregnant', '🤝 Surrogacy': 'surrogacy', '👶 Postpartum': 'postpartum' };
      const { data } = await supabase.from('community_posts').select('*').eq('group_name', groupMap[activeTab] || 'ttc').order('created_at', { ascending: false }).limit(20);
      setPosts(data && data.length > 0 ? [...data, ...staticPosts] : staticPosts);
    } catch (e) { setPosts(staticPosts); }
    setLoading(false);
  };

  const submitPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    const groupMap = { '🌱 TTC': 'ttc', '🤰 Pregnancy': 'pregnant', '🤝 Surrogacy': 'surrogacy', '👶 Postpartum': 'postpartum' };
    try {
      const { data } = await supabase.from('community_posts').insert({ author_name: userName || 'Friend', is_anonymous: false, group_name: groupMap[activeTab] || 'ttc', body: newPost.trim(), like_count: 0, comment_count: 0 }).select().single();
      if (data) setPosts(prev => [data, ...prev]);
    } catch (e) { console.log('Post error:', e); }
    setNewPost(''); setShowInput(false); setPosting(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8FA' }}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 14, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>Community 💕</Text>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>4 groups · real women supporting each other</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: 'rgba(244,143,177,0.15)', maxHeight: 46, flexGrow: 0 }}>
        {['🌱 TTC', '🤰 Pregnancy', '🤝 Surrogacy', '👶 Postpartum'].map((tab, i) => (
          <TouchableOpacity key={i} onPress={() => setActiveTab(tab)} style={[{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2.5, borderBottomColor: 'transparent' }, activeTab === tab && { borderBottomColor: '#F48FB1' }]}>
            <Text style={[{ fontSize: 12, fontWeight: 'bold', color: '#bdbdbd' }, activeTab === tab && { color: '#F48FB1' }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {showInput && (
        <View style={{ backgroundColor: 'white', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }}>
          <TextInput style={{ backgroundColor: '#f5f5f5', borderRadius: 14, padding: 12, fontSize: 13, color: '#1a1a2e', minHeight: 80, textAlignVertical: 'top', marginBottom: 10 }} value={newPost} onChangeText={setNewPost} placeholder="Share something with the community... 💕" placeholderTextColor="#BDBDBD" multiline />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => setShowInput(false)} style={{ flex: 1, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#F48FB1', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#F48FB1', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submitPost} disabled={posting} style={{ flex: 2, height: 40, borderRadius: 20, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{posting ? 'Posting...' : 'Post 💕'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {loading ? <Text style={{ textAlign: 'center', color: '#bdbdbd', marginTop: 20 }}>Loading posts... 💕</Text> : posts.map(post => <CommunityPost key={post.id} post={post} />)}
      </ScrollView>
      <TouchableOpacity onPress={() => setShowInput(true)} style={{ position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center', shadowColor: '#F48FB1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 }}>
        <Text style={{ color: 'white', fontSize: 28 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function CommunityPost({ post }) {
  const [liked, setLiked]               = useState(false);
  const [likeCount, setLikeCount]       = useState(post.like_count || 0);
  const [heartAnim, triggerHeartBounce] = useHeartBounce();
  const handleLike = async () => {
    if (!liked) {
      triggerHeartBounce(); setLikeCount(c => c + 1);
      try { await supabase.from('community_posts').update({ like_count: likeCount + 1 }).eq('id', post.id); } catch (e) {}
    } else { setLikeCount(c => c - 1); }
    setLiked(!liked);
  };
  const timeAgo = (dateStr) => {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  return (
    <View style={[s.wideCard, { marginBottom: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: post.is_anonymous ? '#f0f0f0' : '#FCE4EC' }}>
          <Text style={{ color: post.is_anonymous ? '#9e9e9e' : '#c2185b', fontWeight: 'bold', fontSize: 12 }}>{post.is_anonymous ? '👤' : (post.author_name || 'U')[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: '#1a1a2e' }}>{post.is_anonymous ? 'Anonymous' : post.author_name}</Text>
          <Text style={{ fontSize: 10, color: '#9e9e9e' }}>{timeAgo(post.created_at)}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 20, marginBottom: 12 }}>{post.body}</Text>
      <View style={{ flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 10 }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: liked ? '#FFF0F5' : '#f9f9f9' }} onPress={handleLike}>
          <Animated.Text style={{ fontSize: 16, transform: [{ scale: heartAnim }] }}>{liked ? '❤️' : '🤍'}</Animated.Text>
          <Text style={[{ fontSize: 12, fontWeight: '600', color: '#9e9e9e' }, liked && { color: '#F48FB1' }]}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#f9f9f9' }}>
          <Text style={{ fontSize: 13 }}>💬</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#9e9e9e' }}>{post.comment_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SubscriptionScreen({ goTo }) {
  const [billing, setBilling] = useState('monthly');
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const plans = [
    {
      name: 'Free', price: { monthly: '£0', yearly: '£0' },
      color: '#9e9e9e', bg: '#f5f5f5', badge: 'Current Plan',
      features: ['Basic cycle tracking', 'Bella AI (5 messages/day)', 'Symptom Checker', 'BBT Graph', 'Full Calendar', 'Community read access'],
      locked: ['Bellava Academy', 'Care Finder', 'Partner Mode', 'Nutrition Planner', 'Baby Names', 'Intimacy Health'],
    },
    {
      name: 'Plus', price: { monthly: '£4.99', yearly: '£3.33' },
      color: '#7E57C2', bg: '#EDE7F6', badge: '💜 Popular',
      features: ['Everything in Free', 'Unlimited Bella AI chat', 'Bellava Academy', 'Care Finder', 'Partner Mode', 'Community posting'],
      locked: ['Intimacy Health', 'Nutrition Planner', 'Baby Names', 'Weekly AI Reports'],
    },
    {
      name: 'Pro', price: { monthly: '£19.99', yearly: '£12.49' },
      color: '#c2185b', bg: '#FCE4EC', badge: '👑 Best Value',
      features: ['Everything in Plus', 'Intimacy Health', 'Nutrition Planner', 'Baby Names', 'Weekly AI Reports', 'Anonymous AI Q&A', 'Download your data', 'Early access'],
      locked: [],
    },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Profile')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 8 }}>Unlock Premium 👑</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Choose the plan that fits your journey</Text>
      </View>
      <Animated.View style={{ flexDirection: 'row', margin: 16, backgroundColor: 'white', borderRadius: 20, padding: 4, opacity: fade, transform: [{ translateY: slide }] }}>
        {['monthly', 'yearly'].map(b => (
          <TouchableOpacity key={b} onPress={() => setBilling(b)} style={[{ flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center' }, billing === b && { backgroundColor: '#F48FB1' }]}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: billing === b ? 'white' : '#9e9e9e' }}>
              {b === 'monthly' ? 'Monthly' : 'Yearly · Save 33%'}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
      {plans.map((plan) => (
        <View key={plan.name} style={{ marginHorizontal: 16, marginBottom: 14, borderRadius: 22, padding: 18, backgroundColor: plan.bg, borderWidth: plan.name === 'Pro' ? 2.5 : 1, borderColor: plan.name === 'Pro' ? plan.color : 'rgba(0,0,0,0.08)' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: plan.color }}>{plan.name}</Text>
              <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1a1a2e', marginTop: 2 }}>{plan.price[billing]}</Text>
              <Text style={{ fontSize: 11, color: '#9e9e9e' }}>per month{billing === 'yearly' ? ' · billed yearly' : ''}</Text>
            </View>
            <View style={{ backgroundColor: plan.color + '22', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: plan.color }}>{plan.badge}</Text>
            </View>
          </View>
          {plan.features.map((f, j) => (
            <View key={j} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: plan.color, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, color: 'white', fontWeight: 'bold' }}>✓</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#1a1a2e', fontWeight: '600', flex: 1 }}>{f}</Text>
            </View>
          ))}
          {plan.name !== 'Free' && (
            <TouchableOpacity style={{ marginTop: 16, height: 52, borderRadius: 26, backgroundColor: plan.name === 'Pro' ? plan.color : 'transparent', borderWidth: plan.name === 'Plus' ? 2 : 0, borderColor: plan.color, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: plan.name === 'Pro' ? 'white' : plan.color }}>
                {plan.name === 'Pro' ? '👑 Subscribe Now' : '💜 Get Plus →'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <View style={{ alignItems: 'center', padding: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: '#9e9e9e', textAlign: 'center', lineHeight: 20 }}>
          7-day free trial on Plus and Pro{'\n'}Cancel anytime · No hidden fees{'\n'}Secured by Stripe
        </Text>
      </View>
    </ScrollView>
  );
}

function AdminScreen({ goTo }) {
  const fade  = useFadeIn();
  const slide = useSlideUp();
  const [notification, setNotification] = useState('');
  const stats = [
    { label: 'Total Users',      val: '1,247',  icon: '👥', color: '#F48FB1', change: '+12% this week'  },
    { label: 'Active Today',     val: '342',    icon: '🟢', color: '#4CAF50', change: '+5% vs yesterday' },
    { label: 'Pro Subscribers',  val: '89',     icon: '👑', color: '#FFB74D', change: '+3 this week'     },
    { label: 'Plus Subscribers', val: '234',    icon: '💜', color: '#CE93D8', change: '+8 this week'     },
    { label: 'Community Posts',  val: '5,621',  icon: '💬', color: '#80CBC4', change: '+45 today'        },
    { label: 'Monthly Revenue',  val: '£2,947', icon: '💰', color: '#F48FB1', change: '+18% this month'  },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 14, paddingHorizontal: 20 }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <TouchableOpacity style={s.backBtn} onPress={() => goTo('Profile')}>
          <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 8 }}>Admin Dashboard 👑</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Bellava v3.0 · Reine Mande Ltd</Text>
      </View>
      <Animated.View style={{ padding: 16, opacity: fade, transform: [{ translateY: slide }] }}>
        <Text style={[s.sectionLabel, { marginLeft: 0, marginTop: 0 }]}>Platform Statistics</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {stats.map((stat, i) => (
            <View key={i} style={{ width: '47%', backgroundColor: 'white', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 }}>
              <Text style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: stat.color }}>{stat.val}</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1a1a2e', marginTop: 2 }}>{stat.label}</Text>
              <Text style={{ fontSize: 10, color: '#4CAF50', marginTop: 2 }}>↑ {stat.change}</Text>
            </View>
          ))}
        </View>
        <View style={[s.wideCard, { marginBottom: 16 }]}>
          <Text style={[s.featureTitle, { marginBottom: 14 }]}>Send Push Notification</Text>
          <TextInput style={{ backgroundColor: '#f5f5f5', borderRadius: 14, padding: 14, fontSize: 13, color: '#1a1a2e', minHeight: 100, textAlignVertical: 'top', marginBottom: 14 }} value={notification} onChangeText={setNotification} placeholder="Write your notification message..." placeholderTextColor="#BDBDBD" multiline />
          <TouchableOpacity style={s.primaryBtn} onPress={() => Alert.alert('Notification sent! 🔔', 'Your message has been sent to all users.')}>
            <Text style={s.primaryBtnTxt}>🔔 Send notification</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function ProfileScreen({ goTo, userName, userEmail, userJourney, userPlan, onSignOut, language, setLanguage, t }) {
  const [notifs, setNotifs] = useState({ daily: true, community: true, appointments: true, fertility: true, marketing: false });
  const journey   = JOURNEY_LABELS[userJourney] || JOURNEY_LABELS.ttc;
  const fade      = useFadeIn();
  const slide     = useSlideUp();
  const firstName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() : 'Friend';
  const languages = [
    { code: 'en', label: 'English',    flag: '🇬🇧' },
    { code: 'fr', label: 'Français',   flag: '🇫🇷' },
    { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
    { code: 'es', label: 'Español',    flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
    { code: 'pt', label: 'Português',  flag: '🇵🇹' },
  ];
  const handleDownloadData = async () => {
    try {
      const exportData = { exportedAt: new Date().toISOString(), profile: { name: userName, email: userEmail, journey: userJourney, plan: userPlan } };
      await Share.share({ message: JSON.stringify(exportData, null, 2), title: 'My Bellava Data Export' });
    } catch (e) { Alert.alert('Export failed', 'Could not export your data. Please try again.'); }
  };
  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure? This will permanently delete all your data and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete permanently', style: 'destructive', onPress: async () => {
        try {
          await supabase.from('users').delete().eq('email', userEmail);
          await supabase.auth.signOut();
        } catch (e) { console.log('Delete error:', e); }
        onSignOut();
      }},
    ]);
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF8FA' }} showsVerticalScrollIndicator={false}>
      <View style={[s.pinkHeader, { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' }]}>
        <View style={s.blob1} /><View style={s.blob2} />
        <Animated.View style={{ alignItems: 'center', opacity: fade, transform: [{ translateY: slide }] }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'white' }}>{firstName[0]}</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{firstName}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>{userEmail || 'hello@reinehealth.org'}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <View style={s.journeyBadge}><Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>{journey.emoji} {journey.label}</Text></View>
            <View style={[s.journeyBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}><Text style={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}>{userPlan || 'Free'} Plan</Text></View>
          </View>
        </Animated.View>
      </View>
      <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 4 }}>
        <TouchableOpacity onPress={() => goTo('Subscription')} style={{ backgroundColor: '#1a1a2e', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: 'white' }}>{t.upgrade}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Academy · Care Finder · Nutrition · Intimacy</Text>
          </View>
          <View style={{ backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#F48FB1' }}>£19.99/mo</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={s.sectionLabel}>Features</Text>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 }}>
        {[
          { icon: '🎓', label: 'Academy',     screen: 'Academy'      },
          { icon: '🏥', label: 'Care Finder', screen: 'CareFinder'   },
          { icon: '👫', label: 'Partner',     screen: 'PartnerMode'  },
          { icon: '🥗', label: 'Nutrition',   screen: 'Nutrition'    },
        ].map((item, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(item.screen)} style={{ flex: 1, alignItems: 'center', backgroundColor: 'white', borderRadius: 14, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#9e9e9e', textAlign: 'center' }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 }}>
        {[
          { icon: '👶', label: 'Baby Names', screen: 'BabyNames'    },
          { icon: '💕', label: 'Intimacy',   screen: 'Intimacy'     },
          { icon: '📊', label: 'BBT Graph',  screen: 'BBTGraph'     },
          { icon: '📅', label: 'Calendar',   screen: 'Calendar'     },
        ].map((item, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(item.screen)} style={{ flex: 1, alignItems: 'center', backgroundColor: 'white', borderRadius: 14, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#9e9e9e', textAlign: 'center' }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 }}>
        {[
          { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
          { icon: '🔍', label: 'Symptoms',      screen: 'SymptomCheck'  },
          { icon: '👑', label: 'Admin',         screen: 'Admin'         },
          { icon: '💬', label: 'Community',     screen: 'Community'     },
        ].map((item, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(item.screen)} style={{ flex: 1, alignItems: 'center', backgroundColor: 'white', borderRadius: 14, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#9e9e9e', textAlign: 'center' }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.sectionLabel}>Language 🌍</Text>
      <View style={[s.wideCard, { marginHorizontal: 16, marginBottom: 4 }]}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {languages.map(lang => (
            <TouchableOpacity key={lang.code} onPress={() => setLanguage(lang.code)} style={[{ flex: 1, minWidth: '30%', flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 14, borderWidth: 1.5, borderColor: language === lang.code ? '#F48FB1' : 'rgba(0,0,0,0.08)', backgroundColor: language === lang.code ? '#FFF0F5' : '#f9f9f9' }]}>
              <Text style={{ fontSize: 18 }}>{lang.flag}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: language === lang.code ? '#c2185b' : '#616161', flex: 1 }}>{lang.label}</Text>
              {language === lang.code && <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 9, color: 'white' }}>✓</Text></View>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text style={s.sectionLabel}>Notifications</Text>
      <View style={[s.wideCard, { marginHorizontal: 16 }]}>
        {[
          { key: 'daily',        icon: '🔔', bg: '#FCE4EC', label: 'Daily reminders',   sub: 'Vitamins, BBT'     },
          { key: 'community',    icon: '💬', bg: '#E8EAF6', label: 'Community replies', sub: 'Replies to posts'  },
          { key: 'appointments', icon: '📅', bg: '#E0F2F1', label: 'Appointments',      sub: '24h and 1h before' },
          { key: 'fertility',    icon: '🌸', bg: '#FFF3E0', label: 'Fertility alerts',  sub: 'Peak fertile days' },
          { key: 'marketing',    icon: '📣', bg: '#f5f5f5', label: 'Marketing',         sub: 'News and updates'  },
        ].map((n, i, arr) => (
          <View key={n.key} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 }, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }]}>
            <View style={[{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: n.bg }]}>
              <Text style={{ fontSize: 16 }}>{n.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.featureTitle}>{n.label}</Text>
              <Text style={s.featureSub}>{n.sub}</Text>
            </View>
            <TouchableOpacity onPress={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))} style={[{ width: 40, height: 24, borderRadius: 12, backgroundColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', padding: 2 }, notifs[n.key] && { backgroundColor: '#F48FB1' }]}>
              <View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' }, notifs[n.key] && { marginLeft: 'auto' }]} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <Text style={s.sectionLabel}>Support and Legal</Text>
      <View style={[s.wideCard, { marginHorizontal: 16 }]}>
        {[
          { label: 'Help and FAQ',     icon: '❓', action: null },
          { label: 'Send feedback',    icon: '💌', action: () => Linking.openURL('mailto:hello@reinehealth.org?subject=Bellava Feedback') },
          { label: 'Privacy Policy',   icon: '🔒', action: () => Linking.openURL('https://reinehealth.org/privacy') },
          { label: 'Terms of Service', icon: '📄', action: () => Linking.openURL('https://reinehealth.org/terms') },
          { label: 'Download my data', icon: '📥', action: handleDownloadData },
          { label: 'Report content',   icon: '🚩', action: () => Linking.openURL('mailto:hello@reinehealth.org?subject=Content Report') },
        ].map((item, i, arr) => (
          <TouchableOpacity key={item.label} onPress={item.action || undefined} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }]}>
            <Text style={{ fontSize: 18, width: 28 }}>{item.icon}</Text>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: '#1a1a2e' }}>{item.label}</Text>
            <Text style={{ color: '#bdbdbd', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.sectionLabel}>Account</Text>
      <View style={[s.wideCard, { marginHorizontal: 16, borderWidth: 1.5, borderColor: 'rgba(239,83,80,0.2)' }]}>
        <TouchableOpacity onPress={handleDeleteAccount} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16 }}>🗑️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.featureTitle, { color: '#EF5350' }]}>Delete account</Text>
            <Text style={s.featureSub}>Permanently removes all your data</Text>
          </View>
          <Text style={{ color: '#bdbdbd', fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onSignOut} style={{ margin: 16, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.4)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#F48FB1' }}>{t.signOut}</Text>
      </TouchableOpacity>
      <Text style={{ textAlign: 'center', fontSize: 11, color: '#bdbdbd', marginBottom: 8 }}>Bellava v3.0.0 · Reine Mande Ltd · London, UK</Text>
      <Text style={{ textAlign: 'center', fontSize: 10, color: '#bdbdbd', marginBottom: 30, paddingHorizontal: 20, lineHeight: 16 }}>
        All health content is for educational purposes only. Always consult a qualified healthcare professional.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pinkHeader:      { backgroundColor: '#F48FB1', position: 'relative', overflow: 'hidden' },
  blob1:           { position: 'absolute', width: 120, height: 120, borderRadius: 60,  backgroundColor: 'rgba(255,255,255,0.1)',  bottom: -30, right: -20 },
  blob2:           { position: 'absolute', width: 70,  height: 70,  borderRadius: 35,  backgroundColor: 'rgba(255,255,255,0.07)', top: -10,    right: 70  },
  avatarLarge:     { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  journeyBadge:    { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 10 },
  statCard:        { flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  statVal:         { fontSize: 22, fontWeight: 'bold' },
  statLabel:       { fontSize: 9,  fontWeight: 'bold', color: '#bdbdbd', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 },
  statSub:         { fontSize: 10, color: '#9e9e9e', marginTop: 1 },
  heroCard:        { marginHorizontal: 16, borderRadius: 20, backgroundColor: '#F48FB1', padding: 18, marginBottom: 8, overflow: 'hidden', shadowColor: '#F48FB1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 },
  heroBlob1:       { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.1)',  bottom: -30, right: -20 },
  heroBlob2:       { position: 'absolute', width: 65,  height: 65,  borderRadius: 33, backgroundColor: 'rgba(255,255,255,0.07)', top: -10,    right: 65  },
  bellaAvatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  featureCard:     { flex: 1, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  featureIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitle:    { fontSize: 13, fontWeight: 'bold', color: '#1a1a2e' },
  featureSub:      { fontSize: 11, color: '#9e9e9e', marginTop: 2 },
  wideCard:        { backgroundColor: 'white', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  sectionLabel:    { fontSize: 10, fontWeight: 'bold', color: '#bdbdbd', marginLeft: 18, marginTop: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5 },
  dayCircle:       { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  tabBar:          { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)', height: 84, paddingBottom: 16, paddingTop: 6 },
  tabItem:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabIconWrap:     { width: 44, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabIconActive:   { backgroundColor: '#FFF0F5' },
  tabLabel:        { fontSize: 9,  fontWeight: '600', color: '#BDBDBD' },
  tabLabelActive:  { color: '#F48FB1' },
  backBtn:         { position: 'absolute', top: 58, left: 16, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  authHeader:      { backgroundColor: '#F48FB1', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, alignItems: 'center' },
  authLogo:        { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  authTitle:       { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  authSub:         { fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  formCard:        { backgroundColor: 'white', margin: 16, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  inputLabel:      { fontSize: 12, fontWeight: 'bold', color: '#616161', marginBottom: 6, marginTop: 4 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(244,143,177,0.25)', paddingHorizontal: 14, height: 50, marginBottom: 14 },
  inputIcon:       { fontSize: 16, marginRight: 10 },
  input:           { flex: 1, fontSize: 13, color: '#1a1a2e' },
  primaryBtn:      { width: '100%', height: 54, borderRadius: 27, backgroundColor: '#F48FB1', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#F48FB1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  primaryBtnTxt:   { fontSize: 15, fontWeight: 'bold', color: 'white' },
  secondaryBtn:    { width: '100%', height: 54, borderRadius: 27, borderWidth: 2, borderColor: 'rgba(244,143,177,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: 'white' },
  secondaryBtnTxt: { fontSize: 14, fontWeight: '700', color: '#F48FB1' },
  socialBtn:       { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  socialBtnTxt:    { fontSize: 13, fontWeight: 'bold', color: '#1a1a2e' },
});
