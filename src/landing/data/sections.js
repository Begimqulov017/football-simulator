// Landing sahifadagi bo'lim kartalari ma'lumoti.
// `key` App darajasidagi navigatsiya handlerlariga mos keladi.
export const SECTIONS = [
  {
    key: 'match',
    tone: 'brand',
    icon: 'ball',
    title: 'Match Simulator',
    tag: 'Bepul',
    description:
      "Instant yoki o'zingiz sozlagan o'yinlarni simulyatsiya qiling: jamoalarni tanlang, jonli sharhni kuzating va natijani bashorat qiling.",
    features: ['Instant & Custom matchlar', 'Jonli sharh va statistika', 'Turnirlar'],
    cta: "O'yinni boshlash",
  },
  {
    key: 'career',
    tone: 'accent',
    icon: 'trophy',
    title: 'Football Career',
    tag: 'Premium',
    description:
      "Bitta o'yinchining karyerasini boshidan boshlang: klub tanlang, shartnoma tuzing, transferlar va mavsumlar orqali yulduzga aylaning.",
    features: ['Klub va shartnomalar', 'Kunlik kalendar', 'Mavsum mukofotlari'],
    cta: 'Karyerani boshlash',
  },
];
