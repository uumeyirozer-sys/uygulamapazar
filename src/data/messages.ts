export type Message = {
  id: string;
  sender: "me" | "them";
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  participant: string;
  avatar: string;
  username: string;
  productTitle: string;
  productSlug: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  messages: Message[];
};

export const conversations: Conversation[] = [
  {
    id: "conv_001",
    participant: "Studio Alp",
    avatar: "SA",
    username: "studioalp",
    productTitle: "TaskFlow Pro SaaS",
    productSlug: "taskflow-pro-saas",
    lastMessage: "Demo erişimini inceledim, lisans kapsamını da paylaşabilir misiniz?",
    unreadCount: 2,
    updatedAt: "10:42",
    messages: [
      {
        id: "msg_001",
        sender: "them",
        content: "Merhaba, TaskFlow Pro SaaS için demo linkini kontrol edebilirsiniz.",
        createdAt: "10:28"
      },
      {
        id: "msg_002",
        sender: "me",
        content: "Teşekkürler. Ürün white-label kullanım için uygun mu?",
        createdAt: "10:34"
      },
      {
        id: "msg_003",
        sender: "them",
        content: "Evet, arayüz ve marka alanları kolayca özelleştirilebilir. Lisans kapsamını da paylaşabilirim.",
        createdAt: "10:42"
      }
    ]
  },
  {
    id: "conv_002",
    participant: "GameForge",
    avatar: "GF",
    username: "gameforge",
    productTitle: "Pixel Runner Mobile",
    productSlug: "pixel-runner-mobile",
    lastMessage: "Unity sürümü ve reklam entegrasyonu hazır durumda.",
    unreadCount: 0,
    updatedAt: "Dün",
    messages: [
      {
        id: "msg_004",
        sender: "me",
        content: "Pixel Runner Mobile için AdMob yerleşimleri dahil mi?",
        createdAt: "Dün 14:12"
      },
      {
        id: "msg_005",
        sender: "them",
        content: "Evet, rewarded ve interstitial reklam alanları hazır geliyor.",
        createdAt: "Dün 14:30"
      }
    ]
  },
  {
    id: "conv_003",
    participant: "KodLab",
    avatar: "KL",
    username: "kodlab",
    productTitle: "AI Resume Builder",
    productSlug: "ai-resume-builder",
    lastMessage: "OpenAI anahtarı kullanıcı tarafında yapılandırılabiliyor.",
    unreadCount: 1,
    updatedAt: "Pzt",
    messages: [
      {
        id: "msg_006",
        sender: "them",
        content: "AI Resume Builder ürününde prompt akışları ve şablon yönetimi hazır.",
        createdAt: "Pzt 09:18"
      },
      {
        id: "msg_007",
        sender: "me",
        content: "API anahtarı ve kullanım limitleri nereden yönetiliyor?",
        createdAt: "Pzt 09:25"
      },
      {
        id: "msg_008",
        sender: "them",
        content: "OpenAI anahtarı kullanıcı tarafında yapılandırılabiliyor. Limit ekranı mock olarak mevcut.",
        createdAt: "Pzt 09:40"
      }
    ]
  }
];
