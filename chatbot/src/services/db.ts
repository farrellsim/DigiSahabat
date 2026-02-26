// src/services/db.ts
// Multi-language database for the digital literacy app

// Types
interface Module {
  id: number;
  title: string;
  desc: string;
  image: string;
  mins: number;
  status: string;
  category: string;
  icon: string;
}

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description: string;
  duration: number;
  type: string;
  content_type: string;
  completed: boolean;
  order: number;
}

interface Progress {
  module_id: number;
  status: string;
  completed_lessons: number;
  total_lessons: number;
}

// Language type
type Language = 'en' | 'ms' | 'zh'
;

// In-memory data storage
let modules: Module[] = [];
let lessons: Lesson[] = [];
let progress: Progress[] = [];
let currentLanguage: Language = 'en';

// Translations
const translations = {
  en: {
    modules: {
      gmail: {
        title: "Gmail Basics",
        desc: "Learn how to use Gmail on your phone - sending emails, reading messages, and organizing your inbox.",
      },
      whatsapp: {
        title: "WhatsApp Messenger",
        desc: "Master WhatsApp - send messages, make calls, share photos, and join group chats safely.",
      },
      googlemaps: {
        title: "Google Maps Navigation",
        desc: "Learn to navigate with Google Maps - find locations, get directions, and explore nearby places.",
      },
      onlinebanking: {
        title: "Online Banking Safety",
        desc: "Safely manage your bank account online - check balance, transfer money, and pay bills securely.",
      },
      youtube: {
        title: "YouTube Basics",
        desc: "Discover how to watch videos, search for content, subscribe to channels, and manage your viewing history.",
      },
      onlineshopping: {
        title: "Online Shopping Guide",
        desc: "Shop safely online - browse products, make purchases, and protect yourself from scams.",
      },
    },
    lessons: {
      // Gmail lessons
      gmail_inbox: {
        title: "Understanding Your Inbox",
        desc: "Learn how to navigate your Gmail inbox and identify important emails.",
      },
      gmail_reading: {
        title: "Reading Emails",
        desc: "Open, read, and interact with your emails effectively.",
      },
      gmail_compose: {
        title: "Composing & Sending Emails",
        desc: "Learn how to write and send emails to your contacts.",
      },
      gmail_quiz: {
        title: "Gmail Knowledge Quiz",
        desc: "Test your understanding of Gmail basics.",
      },
      // WhatsApp lessons
      whatsapp_setup: {
        title: "Setting Up WhatsApp",
        desc: "Install and configure WhatsApp on your phone.",
      },
      whatsapp_messaging: {
        title: "Sending Messages",
        desc: "Learn to send text, voice messages, and emojis.",
      },
      whatsapp_media: {
        title: "Sharing Photos & Videos",
        desc: "Share images, videos, and documents with your contacts.",
      },
      whatsapp_calls: {
        title: "Making Voice & Video Calls",
        desc: "Make free voice and video calls through WhatsApp.",
      },
      whatsapp_quiz: {
        title: "WhatsApp Skills Quiz",
        desc: "Test your WhatsApp knowledge.",
      },
      // Google Maps lessons
      maps_search: {
        title: "Searching for Places",
        desc: "Find restaurants, shops, and other locations near you.",
      },
      maps_directions: {
        title: "Getting Directions",
        desc: "Navigate to any destination with turn-by-turn directions.",
      },
      maps_features: {
        title: "Exploring Map Features",
        desc: "Use Street View, save places, and explore nearby areas.",
      },
      maps_quiz: {
        title: "Maps Navigation Quiz",
        desc: "Test your map navigation skills.",
      },
      // Online Banking lessons
      banking_login: {
        title: "Secure Login",
        desc: "Log into your bank account safely and securely.",
      },
      banking_balance: {
        title: "Checking Your Balance",
        desc: "View your account balance and transaction history.",
      },
      banking_transfer: {
        title: "Transferring Money",
        desc: "Send money to other accounts safely.",
      },
      banking_safety: {
        title: "Staying Safe Online",
        desc: "Protect yourself from phishing and fraud.",
      },
      banking_quiz: {
        title: "Banking Safety Quiz",
        desc: "Test your online banking knowledge.",
      },
      // YouTube lessons
      youtube_search: {
        title: "Searching for Videos",
        desc: "Find videos you want to watch on YouTube.",
      },
      youtube_watching: {
        title: "Watching & Interacting",
        desc: "Play videos, adjust quality, and use playback controls.",
      },
      youtube_subscribe: {
        title: "Subscribing to Channels",
        desc: "Follow your favorite content creators.",
      },
      youtube_quiz: {
        title: "YouTube Basics Quiz",
        desc: "Test your YouTube knowledge.",
      },
      // Online Shopping lessons
      shopping_browsing: {
        title: "Browsing Products",
        desc: "Search and explore products online safely.",
      },
      shopping_checkout: {
        title: "Making a Purchase",
        desc: "Add items to cart and complete checkout.",
      },
      shopping_safety: {
        title: "Shopping Safety Tips",
        desc: "Identify secure websites and avoid scams.",
      },
      shopping_quiz: {
        title: "Online Shopping Quiz",
        desc: "Test your safe shopping knowledge.",
      },
    },
    ui: {
      notStarted: "Not Started",
      inProgress: "In Progress",
      completed: "Completed",
      minutes: "minutes",
      interactive: "Interactive",
      startLearning: "Start Learning",
      continueLearning: "Continue Learning",
      reviewModule: "Review Module",
      loadingModules: "Loading modules...",
      noModules: "No modules available",
      checkBack: "Check back soon for new content",
      learningPath: "Learning Path",
      masterDigital: "Master digital literacy one step at a time",
      quiz: "QUIZ",
    },
  },
  ms: {
    modules: {
      gmail: {
        title: "Asas Gmail",
        desc: "Belajar cara menggunakan Gmail di telefon anda - menghantar e-mel, membaca mesej, dan mengatur peti masuk.",
      },
      whatsapp: {
        title: "WhatsApp Messenger",
        desc: "Kuasai WhatsApp - hantar mesej, buat panggilan, kongsi foto, dan sertai sembang kumpulan dengan selamat.",
      },
      googlemaps: {
        title: "Navigasi Google Maps",
        desc: "Belajar navigasi dengan Google Maps - cari lokasi, dapatkan arah, dan terokai tempat berdekatan.",
      },
      onlinebanking: {
        title: "Keselamatan Perbankan Dalam Talian",
        desc: "Urus akaun bank anda dengan selamat - semak baki, pindah wang, dan bayar bil dengan selamat.",
      },
      youtube: {
        title: "Asas YouTube",
        desc: "Ketahui cara menonton video, cari kandungan, langgan saluran, dan urus sejarah tontonan anda.",
      },
      onlineshopping: {
        title: "Panduan Membeli-belah Dalam Talian",
        desc: "Beli-belah dengan selamat - layari produk, buat pembelian, dan lindungi diri dari penipuan.",
      },
    },
    lessons: {
      gmail_inbox: {
        title: "Memahami Peti Masuk Anda",
        desc: "Belajar cara menavigasi peti masuk Gmail dan mengenal pasti e-mel penting.",
      },
      gmail_reading: {
        title: "Membaca E-mel",
        desc: "Buka, baca, dan berinteraksi dengan e-mel anda dengan berkesan.",
      },
      gmail_compose: {
        title: "Menulis & Menghantar E-mel",
        desc: "Belajar cara menulis dan menghantar e-mel kepada kenalan anda.",
      },
      gmail_quiz: {
        title: "Kuiz Pengetahuan Gmail",
        desc: "Uji pemahaman anda tentang asas Gmail.",
      },
      whatsapp_setup: {
        title: "Menyediakan WhatsApp",
        desc: "Pasang dan konfigurasikan WhatsApp di telefon anda.",
      },
      whatsapp_messaging: {
        title: "Menghantar Mesej",
        desc: "Belajar menghantar teks, mesej suara, dan emoji.",
      },
      whatsapp_media: {
        title: "Berkongsi Foto & Video",
        desc: "Kongsi gambar, video, dan dokumen dengan kenalan anda.",
      },
      whatsapp_calls: {
        title: "Membuat Panggilan Suara & Video",
        desc: "Buat panggilan suara dan video percuma melalui WhatsApp.",
      },
      whatsapp_quiz: {
        title: "Kuiz Kemahiran WhatsApp",
        desc: "Uji pengetahuan WhatsApp anda.",
      },
      maps_search: {
        title: "Mencari Tempat",
        desc: "Cari restoran, kedai, dan lokasi lain berhampiran anda.",
      },
      maps_directions: {
        title: "Mendapat Arah",
        desc: "Navigasi ke mana-mana destinasi dengan arahan belokan demi belokan.",
      },
      maps_features: {
        title: "Meneroka Ciri-ciri Peta",
        desc: "Gunakan Street View, simpan tempat, dan terokai kawasan berdekatan.",
      },
      maps_quiz: {
        title: "Kuiz Navigasi Peta",
        desc: "Uji kemahiran navigasi peta anda.",
      },
      banking_login: {
        title: "Log Masuk Selamat",
        desc: "Log masuk ke akaun bank anda dengan selamat.",
      },
      banking_balance: {
        title: "Menyemak Baki Anda",
        desc: "Lihat baki akaun dan sejarah transaksi anda.",
      },
      banking_transfer: {
        title: "Memindahkan Wang",
        desc: "Hantar wang ke akaun lain dengan selamat.",
      },
      banking_safety: {
        title: "Kekal Selamat Dalam Talian",
        desc: "Lindungi diri anda dari pancingan data dan penipuan.",
      },
      banking_quiz: {
        title: "Kuiz Keselamatan Perbankan",
        desc: "Uji pengetahuan perbankan dalam talian anda.",
      },
      youtube_search: {
        title: "Mencari Video",
        desc: "Cari video yang anda ingin tonton di YouTube.",
      },
      youtube_watching: {
        title: "Menonton & Berinteraksi",
        desc: "Main video, laraskan kualiti, dan gunakan kawalan main balik.",
      },
      youtube_subscribe: {
        title: "Melanggan Saluran",
        desc: "Ikuti pencipta kandungan kegemaran anda.",
      },
      youtube_quiz: {
        title: "Kuiz Asas YouTube",
        desc: "Uji pengetahuan YouTube anda.",
      },
      shopping_browsing: {
        title: "Melayari Produk",
        desc: "Cari dan terokai produk dalam talian dengan selamat.",
      },
      shopping_checkout: {
        title: "Membuat Pembelian",
        desc: "Tambah item ke troli dan lengkapkan pembayaran.",
      },
      shopping_safety: {
        title: "Petua Keselamatan Membeli-belah",
        desc: "Kenal pasti laman web selamat dan elakkan penipuan.",
      },
      shopping_quiz: {
        title: "Kuiz Membeli-belah Dalam Talian",
        desc: "Uji pengetahuan membeli-belah selamat anda.",
      },
    },
    ui: {
      notStarted: "Belum Bermula",
      inProgress: "Dalam Kemajuan",
      completed: "Selesai",
      minutes: "minit",
      interactive: "Interaktif",
      startLearning: "Mula Belajar",
      continueLearning: "Teruskan Belajar",
      reviewModule: "Semak Modul",
      loadingModules: "Memuatkan modul...",
      noModules: "Tiada modul tersedia",
      checkBack: "Sila semak kembali untuk kandungan baharu",
      learningPath: "Laluan Pembelajaran",
      masterDigital: "Kuasai literasi digital langkah demi langkah",
      quiz: "KUIZ",
    },
  },
  zh: {
    modules: {
      gmail: {
        title: "Gmail 基础知识",
        desc: "学习如何在手机上使用 Gmail - 发送电子邮件、阅读消息和整理收件箱。",
      },
      whatsapp: {
        title: "WhatsApp 信使",
        desc: "掌握 WhatsApp - 发送消息、拨打电话、分享照片并安全加入群聊。",
      },
      googlemaps: {
        title: "Google 地图导航",
        desc: "学习使用 Google 地图导航 - 查找位置、获取路线和探索附近地点。",
      },
      onlinebanking: {
        title: "网上银行安全",
        desc: "安全管理您的银行账户 - 查看余额、转账和安全支付账单。",
      },
      youtube: {
        title: "YouTube 基础知识",
        desc: "了解如何观看视频、搜索内容、订阅频道和管理观看历史。",
      },
      onlineshopping: {
        title: "网上购物指南",
        desc: "安全网购 - 浏览产品、购买商品并保护自己免受诈骗。",
      },
    },
    lessons: {
      gmail_inbox: {
        title: "了解您的收件箱",
        desc: "学习如何浏览 Gmail 收件箱并识别重要电子邮件。",
      },
      gmail_reading: {
        title: "阅读电子邮件",
        desc: "有效地打开、阅读和与您的电子邮件互动。",
      },
      gmail_compose: {
        title: "撰写和发送电子邮件",
        desc: "学习如何给您的联系人写信和发送电子邮件。",
      },
      gmail_quiz: {
        title: "Gmail 知识测验",
        desc: "测试您对 Gmail 基础知识的理解。",
      },
      whatsapp_setup: {
        title: "设置 WhatsApp",
        desc: "在您的手机上安装和配置 WhatsApp。",
      },
      whatsapp_messaging: {
        title: "发送消息",
        desc: "学习发送文本、语音消息和表情符号。",
      },
      whatsapp_media: {
        title: "分享照片和视频",
        desc: "与您的联系人分享图片、视频和文档。",
      },
      whatsapp_calls: {
        title: "进行语音和视频通话",
        desc: "通过 WhatsApp 进行免费语音和视频通话。",
      },
      whatsapp_quiz: {
        title: "WhatsApp 技能测验",
        desc: "测试您的 WhatsApp 知识。",
      },
      maps_search: {
        title: "搜索地点",
        desc: "查找您附近的餐厅、商店和其他位置。",
      },
      maps_directions: {
        title: "获取路线",
        desc: "使用逐向导航到任何目的地。",
      },
      maps_features: {
        title: "探索地图功能",
        desc: "使用街景、保存地点和探索附近区域。",
      },
      maps_quiz: {
        title: "地图导航测验",
        desc: "测试您的地图导航技能。",
      },
      banking_login: {
        title: "安全登录",
        desc: "安全地登录您的银行账户。",
      },
      banking_balance: {
        title: "查看余额",
        desc: "查看您的账户余额和交易历史。",
      },
      banking_transfer: {
        title: "转账",
        desc: "安全地向其他账户汇款。",
      },
      banking_safety: {
        title: "保持网上安全",
        desc: "保护自己免受网络钓鱼和欺诈。",
      },
      banking_quiz: {
        title: "银行安全测验",
        desc: "测试您的网上银行知识。",
      },
      youtube_search: {
        title: "搜索视频",
        desc: "在 YouTube 上查找您想观看的视频。",
      },
      youtube_watching: {
        title: "观看和互动",
        desc: "播放视频、调整质量和使用播放控件。",
      },
      youtube_subscribe: {
        title: "订阅频道",
        desc: "关注您喜欢的内容创作者。",
      },
      youtube_quiz: {
        title: "YouTube 基础测验",
        desc: "测试您的 YouTube 知识。",
      },
      shopping_browsing: {
        title: "浏览产品",
        desc: "安全地在线搜索和探索产品。",
      },
      shopping_checkout: {
        title: "购买商品",
        desc: "将商品添加到购物车并完成结账。",
      },
      shopping_safety: {
        title: "购物安全提示",
        desc: "识别安全网站并避免诈骗。",
      },
      shopping_quiz: {
        title: "网上购物测验",
        desc: "测试您的安全购物知识。",
      },
    },
    ui: {
      notStarted: "未开始",
      inProgress: "进行中",
      completed: "已完成",
      minutes: "分钟",
      interactive: "互动",
      startLearning: "开始学习",
      continueLearning: "继续学习",
      reviewModule: "复习模块",
      loadingModules: "加载模块中...",
      noModules: "没有可用模块",
      checkBack: "请稍后查看新内容",
      learningPath: "学习路径",
      masterDigital: "逐步掌握数字素养",
      quiz: "测验",
    },
  },
  ta: {
    modules: {
      gmail: {
        title: "Gmail அடிப்படைகள்",
        desc: "உங்கள் தொலைபேசியில் Gmail ஐ எவ்வாறு பயன்படுத்துவது என்பதைக் கற்றுக்கொள்ளுங்கள் - மின்னஞ்சல்களை அனுப்புதல், செய்திகளைப் படித்தல் மற்றும் உங்கள் இன்பாக்ஸை ஒழுங்கமைத்தல்.",
      },
      whatsapp: {
        title: "WhatsApp செய்திப் பரிமாற்றி",
        desc: "WhatsApp ஐ தேர்ச்சி பெறுங்கள் - செய்திகளை அனுப்புதல், அழைப்புகளை மேற்கொள்ளுதல், புகைப்படங்களைப் பகிர்தல் மற்றும் குழு அரட்டைகளில் பாதுகாப்பாக சேருதல்.",
      },
      googlemaps: {
        title: "Google வரைபடங்கள் வழிசெலுத்தல்",
        desc: "Google வரைபடங்களுடன் வழிசெலுத்தக் கற்றுக்கொள்ளுங்கள் - இடங்களைக் கண்டறிதல், திசைகளைப் பெறுதல் மற்றும் அருகிலுள்ள இடங்களை ஆராய்தல்.",
      },
      onlinebanking: {
        title: "ஆன்லைன் வங்கி பாதுகாப்பு",
        desc: "உங்கள் வங்கி கணக்கை பாதுகாப்பாக நிர்வகிக்கவும் - இருப்பை சரிபார்க்கவும், பணத்தை மாற்றவும், பில்களை பாதுகாப்பாக செலுத்தவும்.",
      },
      youtube: {
        title: "YouTube அடிப்படைகள்",
        desc: "வீடியோக்களை எவ்வாறு பார்ப்பது, உள்ளடக்கத்தைத் தேடுவது, சேனல்களுக்கு குழுசேர்வது மற்றும் உங்கள் பார்வை வரலாற்றை நிர்வகிப்பது என்பதைக் கண்டறியவும்.",
      },
      onlineshopping: {
        title: "ஆன்லைன் வாங்குதல் வழிகாட்டி",
        desc: "பாதுகாப்பாக ஆன்லைனில் வாங்கவும் - தயாரிப்புகளை உலாவவும், வாங்கவும், மோசடிகளிலிருந்து உங்களைப் பாதுகாத்துக்கொள்ளவும்.",
      },
    },
    lessons: {
      gmail_inbox: {
        title: "உங்கள் இன்பாக்ஸைப் புரிந்துகொள்ளுதல்",
        desc: "உங்கள் Gmail இன்பாக்ஸை எவ்வாறு செலுத்துவது மற்றும் முக்கியமான மின்னஞ்சல்களை அடையாளம் காண்பது எப்படி என்பதைக் கற்றுக்கொள்ளுங்கள்.",
      },
      gmail_reading: {
        title: "மின்னஞ்சல்களைப் படித்தல்",
        desc: "உங்கள் மின்னஞ்சல்களை திறந்து, படித்து, திறம்பட தொடர்பு கொள்ளுங்கள்.",
      },
      gmail_compose: {
        title: "மின்னஞ்சல்களை எழுதுதல் & அனுப்புதல்",
        desc: "உங்கள் தொடர்புகளுக்கு மின்னஞ்சல்களை எவ்வாறு எழுதுவது மற்றும் அனுப்புவது என்பதைக் கற்றுக்கொள்ளுங்கள்.",
      },
      gmail_quiz: {
        title: "Gmail அறிவு வினாடி வினா",
        desc: "Gmail அடிப்படைகள் பற்றிய உங்கள் புரிதலை சோதிக்கவும்.",
      },
      whatsapp_setup: {
        title: "WhatsApp ஐ அமைத்தல்",
        desc: "உங்கள் தொலைபேசியில் WhatsApp ஐ நிறுவவும் உள்ளமைக்கவும்.",
      },
      whatsapp_messaging: {
        title: "செய்திகளை அனுப்புதல்",
        desc: "உரை, குரல் செய்திகள் மற்றும் எமோஜிகளை அனுப்ப கற்றுக்கொள்ளுங்கள்.",
      },
      whatsapp_media: {
        title: "புகைப்படங்கள் & வீடியோக்களைப் பகிர்தல்",
        desc: "உங்கள் தொடர்புகளுடன் படங்கள், வீடியோக்கள் மற்றும் ஆவணங்களைப் பகிரவும்.",
      },
      whatsapp_calls: {
        title: "குரல் & வீடியோ அழைப்புகளை மேற்கொள்ளுதல்",
        desc: "WhatsApp மூலம் இலவச குரல் மற்றும் வீடியோ அழைப்புகளை மேற்கொள்ளுங்கள்.",
      },
      whatsapp_quiz: {
        title: "WhatsApp திறன் வினாடி வினா",
        desc: "உங்கள் WhatsApp அறிவை சோதிக்கவும்.",
      },
      maps_search: {
        title: "இடங்களைத் தேடுதல்",
        desc: "உங்களுக்கு அருகில் உள்ள உணவகங்கள், கடைகள் மற்றும் பிற இடங்களைக் கண்டறியவும்.",
      },
      maps_directions: {
        title: "திசைகளைப் பெறுதல்",
        desc: "திருப்பம்-திருப்ப திசைகளுடன் எந்த இடத்திற்கும் செல்லவும்.",
      },
      maps_features: {
        title: "வரைபட அம்சங்களை ஆராய்தல்",
        desc: "Street View ஐப் பயன்படுத்தவும், இடங்களைச் சேமிக்கவும், அருகிலுள்ள பகுதிகளை ஆராயவும்.",
      },
      maps_quiz: {
        title: "வரைபட வழிசெலுத்தல் வினாடி வினா",
        desc: "உங்கள் வரைபட வழிசெலுத்தல் திறன்களை சோதிக்கவும்.",
      },
      banking_login: {
        title: "பாதுகாப்பான உள்நுழைவு",
        desc: "உங்கள் வங்கி கணக்கில் பாதுகாப்பாக உள்நுழையவும்.",
      },
      banking_balance: {
        title: "உங்கள் இருப்பைச் சரிபார்த்தல்",
        desc: "உங்கள் கணக்கு இருப்பு மற்றும் பரிவர்த்தனை வரலாற்றைக் காணவும்.",
      },
      banking_transfer: {
        title: "பணத்தை மாற்றுதல்",
        desc: "பிற கணக்குகளுக்கு பாதுகாப்பாக பணம் அனுப்பவும்.",
      },
      banking_safety: {
        title: "ஆன்லைனில் பாதுகாப்பாக இருத்தல்",
        desc: "ஃபிஷிங் மற்றும் மோசடிகளிலிருந்து உங்களைப் பாதுகாத்துக்கொள்ளுங்கள்.",
      },
      banking_quiz: {
        title: "வங்கி பாதுகாப்பு வினாடி வினா",
        desc: "உங்கள் ஆன்லைன் வங்கி அறிவை சோதிக்கவும்.",
      },
      youtube_search: {
        title: "வீடியோக்களைத் தேடுதல்",
        desc: "YouTube இல் நீங்கள் பார்க்க விரும்பும் வீடியோக்களைக் கண்டறியவும்.",
      },
      youtube_watching: {
        title: "பார்த்தல் & தொடர்புகொள்ளுதல்",
        desc: "வீடியோக்களை இயக்கவும், தரத்தை சரிசெய்யவும், பின்னணி கட்டுப்பாடுகளைப் பயன்படுத்தவும்.",
      },
      youtube_subscribe: {
        title: "சேனல்களுக்கு குழுசேர்தல்",
        desc: "உங்களுக்கு பிடித்த உள்ளடக்க படைப்பாளர்களைப் பின்தொடரவும்.",
      },
      youtube_quiz: {
        title: "YouTube அடிப்படை வினாடி வினா",
        desc: "உங்கள் YouTube அறிவை சோதிக்கவும்.",
      },
      shopping_browsing: {
        title: "தயாரிப்புகளை உலாவுதல்",
        desc: "பாதுகாப்பாக ஆன்லைனில் தயாரிப்புகளைத் தேடி ஆராயவும்.",
      },
      shopping_checkout: {
        title: "வாங்குதல்",
        desc: "பொருட்களை வண்டியில் சேர்த்து செக்அவுட்டை முடிக்கவும்.",
      },
      shopping_safety: {
        title: "வாங்குதல் பாதுகாப்பு குறிப்புகள்",
        desc: "பாதுகாப்பான இணையதளங்களை அடையாளம் கண்டு மோசடிகளைத் தவிர்க்கவும்.",
      },
      shopping_quiz: {
        title: "ஆன்லைன் வாங்குதல் வினாடி வினா",
        desc: "உங்கள் பாதுகாப்பான வாங்குதல் அறிவை சோதிக்கவும்.",
      },
    },
    ui: {
      notStarted: "தொடங்கவில்லை",
      inProgress: "முன்னேற்றத்தில்",
      completed: "முடிந்தது",
      minutes: "நிமிடங்கள்",
      interactive: "ஊடாடும்",
      startLearning: "கற்றல் தொடங்கு",
      continueLearning: "கற்றலைத் தொடரவும்",
      reviewModule: "தொகுதியை மதிப்பாய்வு செய்யவும்",
      loadingModules: "தொகுதிகள் ஏற்றப்படுகின்றன...",
      noModules: "தொகுதிகள் இல்லை",
      checkBack: "புதிய உள்ளடக்கத்திற்கு விரைவில் சரிபார்க்கவும்",
      learningPath: "கற்றல் பாதை",
      masterDigital: "ஒரு நேரத்தில் ஒரு படியாக டிஜிட்டல் எழுத்தறிவை தேர்ச்சி பெறுங்கள்",
      quiz: "வினாடி வினா",
    },
  },
};

// Get translation for current language
const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

// Set language
export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  console.log(`Language set to: ${lang}`);
};

// Get current language
export const getLanguage = (): Language => {
  return currentLanguage;
};

// Initialize database with sample data
export const initDB = () => {
  // All Modules
  modules = [
    {
      id: 1,
      title: t('modules.gmail.title'),
      desc: t('modules.gmail.desc'),
      image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800",
      mins: 20,
      status: t('ui.notStarted'),
      category: "communication",
      icon: "mail",
    },
    {
      id: 2,
      title: t('modules.whatsapp.title'),
      desc: t('modules.whatsapp.desc'),
      image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800",
      mins: 25,
      status: t('ui.notStarted'),
      category: "communication",
      icon: "chatbubbles",
    },
    {
      id: 3,
      title: t('modules.googlemaps.title'),
      desc: t('modules.googlemaps.desc'),
      image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800",
      mins: 18,
      status: t('ui.notStarted'),
      category: "navigation",
      icon: "map",
    },
    {
      id: 4,
      title: t('modules.onlinebanking.title'),
      desc: t('modules.onlinebanking.desc'),
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
      mins: 30,
      status: t('ui.notStarted'),
      category: "finance",
      icon: "card",
    },
    {
      id: 5,
      title: t('modules.youtube.title'),
      desc: t('modules.youtube.desc'),
      image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800",
      mins: 15,
      status: t('ui.notStarted'),
      category: "entertainment",
      icon: "play-circle",
    },
    {
      id: 6,
      title: t('modules.onlineshopping.title'),
      desc: t('modules.onlineshopping.desc'),
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800",
      mins: 22,
      status: t('ui.notStarted'),
      category: "shopping",
      icon: "cart",
    },
  ];

  // All Lessons
  lessons = [
    // Gmail Lessons (Module 1)
    {
      id: 1,
      module_id: 1,
      title: t('lessons.gmail_inbox.title'),
      description: t('lessons.gmail_inbox.desc'),
      duration: 5,
      type: "tutorial",
      content_type: "inbox_basics",
      completed: false,
      order: 1,
    },
    {
      id: 2,
      module_id: 1,
      title: t('lessons.gmail_reading.title'),
      description: t('lessons.gmail_reading.desc'),
      duration: 4,
      type: "tutorial",
      content_type: "reading_email",
      completed: false,
      order: 2,
    },
    {
      id: 3,
      module_id: 1,
      title: t('lessons.gmail_compose.title'),
      description: t('lessons.gmail_compose.desc'),
      duration: 6,
      type: "tutorial",
      content_type: "compose_email",
      completed: false,
      order: 3,
    },
    {
      id: 4,
      module_id: 1,
      title: t('lessons.gmail_quiz.title'),
      description: t('lessons.gmail_quiz.desc'),
      duration: 5,
      type: "quiz",
      content_type: "quiz",
      completed: false,
      order: 4,
    },
    
    // WhatsApp Lessons (Module 2)
    {
      id: 5,
      module_id: 2,
      title: t('lessons.whatsapp_setup.title'),
      description: t('lessons.whatsapp_setup.desc'),
      duration: 6,
      type: "tutorial",
      content_type: "whatsapp_setup",
      completed: false,
      order: 1,
    },
    {
      id: 6,
      module_id: 2,
      title: t('lessons.whatsapp_messaging.title'),
      description: t('lessons.whatsapp_messaging.desc'),
      duration: 5,
      type: "tutorial",
      content_type: "whatsapp_messaging",
      completed: false,
      order: 2,
    },
    {
      id: 7,
      module_id: 2,
      title: t('lessons.whatsapp_media.title'),
      description: t('lessons.whatsapp_media.desc'),
      duration: 6,
      type: "tutorial",
      content_type: "whatsapp_media",
      completed: false,
      order: 3,
    },
    {
      id: 8,
      module_id: 2,
      title: t('lessons.whatsapp_calls.title'),
      description: t('lessons.whatsapp_calls.desc'),
      duration: 4,
      type: "tutorial",
      content_type: "whatsapp_calls",
      completed: false,
      order: 4,
    },
    {
      id: 9,
      module_id: 2,
      title: t('lessons.whatsapp_quiz.title'),
      description: t('lessons.whatsapp_quiz.desc'),
      duration: 4,
      type: "quiz",
      content_type: "quiz",
      completed: false,
      order: 5,
    },

    // Google Maps Lessons (Module 3)
    {
      id: 10,
      module_id: 3,
      title: t('lessons.maps_search.title'),
      description: t('lessons.maps_search.desc'),
      duration: 5,
      type: "tutorial",
      content_type: "maps_search",
      completed: false,
      order: 1,
    },
    {
      id: 11,
      module_id: 3,
      title: t('lessons.maps_directions.title'),
      description: t('lessons.maps_directions.desc'),
      duration: 6,
      type: "tutorial",
      content_type: "maps_directions",
      completed: false,
      order: 2,
    },
    {
      id: 12,
      module_id: 3,
      title: t('lessons.maps_features.title'),
      description: t('lessons.maps_features.desc'),
      duration: 4,
      type: "tutorial",
      content_type: "maps_features",
      completed: false,
      order: 3,
    },
    {
      id: 13,
      module_id: 3,
      title: t('lessons.maps_quiz.title'),
      description: t('lessons.maps_quiz.desc'),
      duration: 3,
      type: "quiz",
      content_type: "quiz",
      completed: false,
      order: 4,
    },

    // Online Banking Lessons (Module 4)
    {
      id: 14,
      module_id: 4,
      title: t('lessons.banking_login.title'),
      description: t('lessons.banking_login.desc'),
      duration: 6,
      type: "tutorial",
      content_type: "banking_login",
      completed: false,
      order: 1,
    },
    {
      id: 15,
      module_id: 4,
      title: t('lessons.banking_balance.title'),
      description: t('lessons.banking_balance.desc'),
      duration: 5,
      type: "tutorial",
      content_type: "banking_balance",
      completed: false,
      order: 2,
    },
    {
      id: 16,
      module_id: 4,
      title: t('lessons.banking_transfer.title'),
      description: t('lessons.banking_transfer.desc'),
      duration: 8,
      type: "tutorial",
      content_type: "banking_transfer",
      completed: false,
      order: 3,
    },
    {
      id: 17,
      module_id: 4,
      title: t('lessons.banking_safety.title'),
      description: t('lessons.banking_safety.desc'),
      duration: 6,
      type: "tutorial",
      content_type: "banking_safety",
      completed: false,
      order: 4,
    },
    {
      id: 18,
      module_id: 4,
      title: t('lessons.banking_quiz.title'),
      description: t('lessons.banking_quiz.desc'),
      duration: 5,
      type: "quiz",
      content_type: "quiz",
      completed: false,
      order: 5,
    },

    // YouTube Lessons (Module 5)
    {
      id: 19,
      module_id: 5,
      title: t('lessons.youtube_search.title'),
      description: t('lessons.youtube_search.desc'),
      duration: 4,
      type: "tutorial",
      content_type: "youtube_search",
      completed: false,
      order: 1,
    },
    {
      id: 20,
      module_id: 5,
      title: t('lessons.youtube_watching.title'),
      description: t('lessons.youtube_watching.desc'),
      duration: 5,
      type: "tutorial",
      content_type: "youtube_watching",
      completed: false,
      order: 2,
    },
    {
      id: 21,
      module_id: 5,
      title: t('lessons.youtube_subscribe.title'),
      description: t('lessons.youtube_subscribe.desc'),
      duration: 3,
      type: "tutorial",
      content_type: "youtube_subscribe",
      completed: false,
      order: 3,
    },
    {
      id: 22,
      module_id: 5,
      title: t('lessons.youtube_quiz.title'),
      description: t('lessons.youtube_quiz.desc'),
      duration: 3,
      type: "quiz",
      content_type: "quiz",
      completed: false,
      order: 4,
    },

    // Online Shopping Lessons (Module 6)
    {
      id: 23,
      module_id: 6,
      title: t('lessons.shopping_browsing.title'),
      description: t('lessons.shopping_browsing.desc'),
      duration: 6,
      type: "tutorial",
      content_type: "shopping_browsing",
      completed: false,
      order: 1,
    },
    {
      id: 24,
      module_id: 6,
      title: t('lessons.shopping_checkout.title'),
      description: t('lessons.shopping_checkout.desc'),
      duration: 8,
      type: "tutorial",
      content_type: "shopping_checkout",
      completed: false,
      order: 2,
    },
    {
      id: 25,
      module_id: 6,
      title: t('lessons.shopping_safety.title'),
      description: t('lessons.shopping_safety.desc'),
      duration: 5,
      type: "tutorial",
      content_type: "shopping_safety",
      completed: false,
      order: 3,
    },
    {
      id: 26,
      module_id: 6,
      title: t('lessons.shopping_quiz.title'),
      description: t('lessons.shopping_quiz.desc'),
      duration: 3,
      type: "quiz",
      content_type: "quiz",
      completed: false,
      order: 4,
    },
  ];

  // Initialize progress for all modules
  progress = modules.map(m => ({
    module_id: m.id,
    status: t('ui.notStarted'),
    completed_lessons: 0,
    total_lessons: lessons.filter(l => l.module_id === m.id).length,
  }));

  console.log(`Database initialized with ${modules.length} modules in ${currentLanguage} language`);
};

// Refresh module and lesson translations
export const refreshTranslations = () => {
  modules = modules.map(m => {
    let key = '';
    switch(m.id) {
      case 1: key = 'gmail'; break;
      case 2: key = 'whatsapp'; break;
      case 3: key = 'googlemaps'; break;
      case 4: key = 'onlinebanking'; break;
      case 5: key = 'youtube'; break;
      case 6: key = 'onlineshopping'; break;
    }
    return {
      ...m,
      title: t(`modules.${key}.title`),
      desc: t(`modules.${key}.desc`),
      status: m.status === 'Completed' || m.status === 'Selesai' || m.status === '已完成' || m.status === 'முடிந்தது' 
        ? t('ui.completed')
        : m.status === 'In Progress' || m.status === 'Dalam Kemajuan' || m.status === '进行中' || m.status === 'முன்னேற்றத்தில்'
        ? t('ui.inProgress')
        : t('ui.notStarted'),
    };
  });

  lessons = lessons.map(l => {
    const lessonKeys = [
      'gmail_inbox', 'gmail_reading', 'gmail_compose', 'gmail_quiz',
      'whatsapp_setup', 'whatsapp_messaging', 'whatsapp_media', 'whatsapp_calls', 'whatsapp_quiz',
      'maps_search', 'maps_directions', 'maps_features', 'maps_quiz',
      'banking_login', 'banking_balance', 'banking_transfer', 'banking_safety', 'banking_quiz',
      'youtube_search', 'youtube_watching', 'youtube_subscribe', 'youtube_quiz',
      'shopping_browsing', 'shopping_checkout', 'shopping_safety', 'shopping_quiz',
    ];
    const key = lessonKeys[l.id - 1];
    return {
      ...l,
      title: t(`lessons.${key}.title`),
      description: t(`lessons.${key}.desc`),
    };
  });

  progress = progress.map(p => ({
    ...p,
    status: p.status === 'Completed' || p.status === 'Selesai' || p.status === '已完成' || p.status === 'முடிந்தது'
      ? t('ui.completed')
      : p.status === 'In Progress' || p.status === 'Dalam Kemajuan' || p.status === '进行中' || p.status === 'முன்னேற்றத்தில்'
      ? t('ui.inProgress')
      : t('ui.notStarted'),
  }));
};

// Get all modules with progress
export const getModules = (): Module[] => {
  return modules.map((module) => {
    const moduleProgress = progress.find((p) => p.module_id === module.id);
    return {
      ...module,
      status: moduleProgress?.status || t('ui.notStarted'),
    };
  });
};

// Get modules by category
export const getModulesByCategory = (category: string): Module[] => {
  return modules.filter(m => m.category === category).map((module) => {
    const moduleProgress = progress.find((p) => p.module_id === module.id);
    return {
      ...module,
      status: moduleProgress?.status || t('ui.notStarted'),
    };
  });
};

// Get a specific module by ID
export const getModuleById = (id: number): Module | null => {
  const module = modules.find((m) => m.id === id);
  if (!module) return null;

  const moduleProgress = progress.find((p) => p.module_id === id);
  return {
    ...module,
    status: moduleProgress?.status || t('ui.notStarted'),
  };
};

// Get all lessons for a specific module
export const getLessonsByModule = (moduleId: number): Lesson[] => {
  return lessons
    .filter((l) => l.module_id === moduleId)
    .sort((a, b) => a.order - b.order);
};

// Get a specific lesson by ID
export const getLessonById = (id: number): Lesson | null => {
  return lessons.find((l) => l.id === id) || null;
};

// Mark a lesson as complete
export const markLessonComplete = (lessonId: number) => {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return;

  lesson.completed = true;

  const moduleProgress = progress.find((p) => p.module_id === lesson.module_id);
  if (moduleProgress) {
    const completedCount = lessons.filter(
      (l) => l.module_id === lesson.module_id && l.completed
    ).length;
    
    moduleProgress.completed_lessons = completedCount;
    
    if (completedCount === moduleProgress.total_lessons) {
      moduleProgress.status = t('ui.completed');
      
      const module = modules.find((m) => m.id === lesson.module_id);
      if (module) {
        module.status = t('ui.completed');
      }
    } else if (completedCount > 0) {
      moduleProgress.status = t('ui.inProgress');
      
      const module = modules.find((m) => m.id === lesson.module_id);
      if (module) {
        module.status = t('ui.inProgress');
      }
    }
  }

  console.log(`Lesson ${lessonId} marked as complete`);
};

// Update module progress
export const updateModuleProgress = (moduleId: number, status: string) => {
  const moduleProgress = progress.find((p) => p.module_id === moduleId);
  if (moduleProgress) {
    moduleProgress.status = status;
  }

  const module = modules.find((m) => m.id === moduleId);
  if (module) {
    module.status = status;
  }

  console.log(`Module ${moduleId} status updated to ${status}`);
};

// Get progress for a specific module
export const getModuleProgress = (moduleId: number): Progress | null => {
  return progress.find((p) => p.module_id === moduleId) || null;
};

// Reset all progress
export const resetProgress = () => {
  lessons.forEach((lesson) => {
    lesson.completed = false;
  });

  progress.forEach((p) => {
    p.status = t('ui.notStarted');
    p.completed_lessons = 0;
  });

  modules.forEach((m) => {
    m.status = t('ui.notStarted');
  });

  console.log("All progress reset");
};

// Get translation helper (export for use in components)
export { t };

export default {
  initDB,
  setLanguage,
  getLanguage,
  refreshTranslations,
  getModules,
  getModulesByCategory,
  getModuleById,
  getLessonsByModule,
  getLessonById,
  markLessonComplete,
  updateModuleProgress,
  getModuleProgress,
  resetProgress,
  t,
};