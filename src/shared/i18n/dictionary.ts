import type { Locale } from "./locale";

export interface UiStrings {
  common: {
    dearGuest: string;
  };
  countdown: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    invalidDate: string;
    todayIsTheDay: string;
  };
  firstTemplate: {
    detailsOverline: string;
    when: string;
    where: string;
    ceremonyAt: string;
    receptionToFollow: string;
  };
  secondTemplate: {
    heroKicker: string;
    scroll: string;
    detailsKicker: string;
    detailsHeading: string;
    ceremonyHeading: string;
    madeWithLove: string;
    envelopeClickToOpen: string;
  };
  thirdTemplate: {
    heroKicker: string;
    forever: string;
    begins: string;
    withLove: string;
    rootedInLine1: string;
    rootedInLine2: string;
    blossomingLine1: string;
    blossomingLine2: string;
    ceremonyReceptionKicker: string;
    weddingDetailsHeading: string;
    eveningBlurb: string;
    venueHeading: string;
    arriveBefore: string;
    arriveBeforeSuffix: string;
  };
  map: {
    openInMaps: string;
    yandexMaps: string;
    yandexGo: string;
    yandexNavigator: string;
  };
  date: {
    weekdays: readonly [string, string, string, string, string, string, string];
    months: readonly [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
  };
}

const en: UiStrings = {
  common: {
    dearGuest: "Dear {name},",
  },
  countdown: {
    days: "Days",
    hours: "Hours",
    minutes: "Min",
    seconds: "Sec",
    invalidDate: "Date was not provided or is invalid",
    todayIsTheDay: "Today is the day ♡",
  },
  firstTemplate: {
    detailsOverline: "The Day",
    when: "When",
    where: "Where",
    ceremonyAt: "Ceremony at",
    receptionToFollow: "Reception to follow",
  },
  secondTemplate: {
    heroKicker: "We're getting married",
    scroll: "Scroll",
    detailsKicker: "The Celebration",
    detailsHeading: "Event Details",
    ceremonyHeading: "Wedding Ceremony",
    madeWithLove: "Made with ♥ for our family & friends",
    envelopeClickToOpen: "Click the seal to open",
  },
  thirdTemplate: {
    heroKicker: "The Wedding Of",
    forever: "Our Forever",
    begins: "Begins",
    withLove: "With love,",
    rootedInLine1: "Rooted in",
    rootedInLine2: "friendship,",
    blossomingLine1: "blossoming",
    blossomingLine2: "into forever.",
    ceremonyReceptionKicker: "Ceremony & Reception",
    weddingDetailsHeading: "Wedding Details",
    eveningBlurb:
      "An evening of dinner, dancing, and stories under the string lights — stay late, we insist.",
    venueHeading: "The Venue",
    arriveBefore: "Arrive a little before",
    arriveBeforeSuffix: "to find your seat before the ceremony begins.",
  },
  map: {
    openInMaps: "Open in Maps",
    yandexMaps: "Yandex Maps",
    yandexGo: "Yandex Go",
    yandexNavigator: "Yandex Navigator",
  },
  date: {
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
};

const ru: UiStrings = {
  common: {
    dearGuest: "Дорогие {name},",
  },
  countdown: {
    days: "Дней",
    hours: "Часов",
    minutes: "Мин",
    seconds: "Сек",
    invalidDate: "Дата не указана или неверна",
    todayIsTheDay: "Сегодня этот день ♡",
  },
  firstTemplate: {
    detailsOverline: "День",
    when: "Когда",
    where: "Где",
    ceremonyAt: "Церемония в",
    receptionToFollow: "Далее — банкет",
  },
  secondTemplate: {
    heroKicker: "Мы женимся",
    scroll: "Листайте",
    detailsKicker: "Торжество",
    detailsHeading: "Детали события",
    ceremonyHeading: "Свадебная церемония",
    madeWithLove: "Сделано с ♥ для наших родных и друзей",
    envelopeClickToOpen: "Нажмите на печать, чтобы открыть",
  },
  thirdTemplate: {
    heroKicker: "Свадьба",
    forever: "Наша история",
    begins: "начинается",
    withLove: "С любовью,",
    rootedInLine1: "Выросшие из",
    rootedInLine2: "дружбы,",
    blossomingLine1: "расцветшей",
    blossomingLine2: "в вечность.",
    ceremonyReceptionKicker: "Церемония и банкет",
    weddingDetailsHeading: "Детали свадьбы",
    eveningBlurb:
      "Вечер ужина, танцев и историй под гирляндами огней — оставайтесь подольше, мы настаиваем.",
    venueHeading: "Место проведения",
    arriveBefore: "Приходите немного раньше",
    arriveBeforeSuffix: "чтобы найти свои места до начала церемонии.",
  },
  map: {
    openInMaps: "Открыть на карте",
    yandexMaps: "Яндекс Карты",
    yandexGo: "Яндекс Go",
    yandexNavigator: "Яндекс Навигатор",
  },
  date: {
    weekdays: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    months: [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ],
  },
};

const uz: UiStrings = {
  common: {
    dearGuest: "Hurmatli {name},",
  },
  countdown: {
    days: "Kun",
    hours: "Soat",
    minutes: "Daqiqa",
    seconds: "Soniya",
    invalidDate: "Sana kiritilmagan yoki noto'g'ri",
    todayIsTheDay: "Bugun ushbu kun ♡",
  },
  firstTemplate: {
    detailsOverline: "Kun tartibi",
    when: "Qachon",
    where: "Qayerda",
    ceremonyAt: "Marosim soat",
    receptionToFollow: "Keyin ziyofat",
  },
  secondTemplate: {
    heroKicker: "Biz turmush qurmoqdamiz",
    scroll: "Pastga suring",
    detailsKicker: "Tantana",
    detailsHeading: "Tadbir tafsilotlari",
    ceremonyHeading: "Nikoh marosimi",
    madeWithLove: "Oila va do'stlarimiz uchun ♥ bilan yaratildi",
    envelopeClickToOpen: "Ochish uchun muhrga bosing",
  },
  thirdTemplate: {
    heroKicker: "To'y egalari",
    forever: "Bizning abadiyatimiz",
    begins: "boshlanmoqda",
    withLove: "Muhabbat bilan,",
    rootedInLine1: "Do'stlikdan",
    rootedInLine2: "ildiz otgan,",
    blossomingLine1: "abadiyatga",
    blossomingLine2: "gullab-yashnamoqda.",
    ceremonyReceptionKicker: "Marosim va ziyofat",
    weddingDetailsHeading: "To'y tafsilotlari",
    eveningBlurb:
      "Kechki ovqat, raqs va hikoyalar bilan to'lib-toshgan kech — uzoqroq qoling, biz shuni istaymiz.",
    venueHeading: "Manzil",
    arriveBefore: "O'rningizni band qilish uchun soat",
    arriveBeforeSuffix: "dan birozroq oldin keling.",
  },
  map: {
    openInMaps: "Xaritada ochish",
    yandexMaps: "Yandex Xaritalar",
    yandexGo: "Yandex Go",
    yandexNavigator: "Yandex Navigator",
  },
  date: {
    weekdays: ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"],
    months: [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "Avgust",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
    ],
  },
};

const kiril: UiStrings = {
  common: {
    dearGuest: "Ҳурматли {name},",
  },
  countdown: {
    days: "Кун",
    hours: "Соат",
    minutes: "Дақиқа",
    seconds: "Сония",
    invalidDate: "Сана киритилмаган ёки нотўғри",
    todayIsTheDay: "Бугун ушбу кун ♡",
  },
  firstTemplate: {
    detailsOverline: "Кун тартиби",
    when: "Қачон",
    where: "Қаерда",
    ceremonyAt: "Маросим соат",
    receptionToFollow: "Кейин зиёфат",
  },
  secondTemplate: {
    heroKicker: "Биз турмуш қурмоқдамиз",
    scroll: "Пастга суринг",
    detailsKicker: "Тантана",
    detailsHeading: "Тадбир тафсилотлари",
    ceremonyHeading: "Никоҳ маросими",
    madeWithLove: "Оила ва дўстларимиз учун ♥ билан яратилди",
    envelopeClickToOpen: "Очиш учун муҳрга босинг",
  },
  thirdTemplate: {
	heroKicker: "Биз турмуш қурмоқдамиз",
    forever: "Бизнинг абадиятимиз",
    begins: "бошланмоқда",
    withLove: "Муҳаббат билан,",
    rootedInLine1: "Дўстликдан",
    rootedInLine2: "илдиз отган,",
    blossomingLine1: "абадиятга",
    blossomingLine2: "гуллаб-яшнамоқда.",
    ceremonyReceptionKicker: "Маросим ва зиёфат",
    weddingDetailsHeading: "Тўй тафсилотлари",
    eveningBlurb:
      "Кечки овқат, рақс ва ҳикоялар билан тўлиб-тошган кеч — узоқроқ қолинг, биз шуни истаймиз.",
    venueHeading: "Манзил",
    arriveBefore: "Ўрнингизни банд қилиш учун соат",
    arriveBeforeSuffix: "дан бирозроқ олдин келинг.",
  },
  map: {
    openInMaps: "Харитада очиш",
    yandexMaps: "Яндекс Хариталар",
    yandexGo: "Яндекс Go",
    yandexNavigator: "Яндекс Навигатор",
  },
  date: {
    weekdays: ["Якшанба", "Душанба", "Сешанба", "Чоршанба", "Пайшанба", "Жума", "Шанба"],
    months: [
      "Январ",
      "Феврал",
      "Март",
      "Апрел",
      "Май",
      "Июн",
      "Июл",
      "Август",
      "Сентябр",
      "Октябр",
      "Ноябр",
      "Декабр",
    ],
  },
};

const dictionary: Record<Locale, UiStrings> = { en, ru, uz, kiril };

export function getDictionary(locale: Locale): UiStrings {
  return dictionary[locale];
}
