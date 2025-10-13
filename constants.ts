import { GameItem, GlossaryTerm, Language, SearchableWasteItem, WasteType } from './types';

export const LANGUAGES: { id: Language; name: string; flag: string }[] = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { id: 'zh', name: '中文', flag: '🇨🇳' },
];

// All translation keys must be in the 'en' object.
// Other languages will fallback to 'en' if a key is missing.
export const TRANSLATIONS = {
    en: {
        // App
        appTitle: 'Waste Wizard',
        chatTab: 'Chat Wizard',
        gameTab: 'Sort Game',
        infoTab: 'Info & Search',
        footer: 'Waste Wizard © 2024 - Learn to sort waste correctly!',

        // Header
        // (no specific keys here)

        // Chat Agent
        chatIntro: "Hello! I'm the Waste Wizard. Ask me anything about waste separation in the Netherlands, for example: 'Where does a milk carton go?' or 'What are the rules for plastic in Amsterdam?'",
        chatPlaceholder: 'Ask the wizard a question...',
        sources: 'Sources',

        // Game
        gameTitle: 'Waste Sorting Game',
        gameIntro: 'Drag the item to the correct bin!',
        score: 'Score',
        finalScore: 'Final Score',
        playAgain: 'Play Again',
        enterNickname: 'Enter your nickname...',
        saveScore: 'Save Score',
        highScores: 'High Scores',
        gameCorrectBinMessage: 'Correct! This goes in the {binName} bin.',

        // Info & Glossary
        infoTitle: 'Useful Information',
        infoIntro: 'Find more information about waste separation at these official sources.',
        gemeenteContact: 'Your Municipality (Gemeente)',
        gemeenteDesc: 'Rules can differ per city. Always check your local municipality website for the most accurate information.',
        milieuCentraal: 'Milieu Centraal',
        milieuCentraalDesc: 'An independent organization with practical information on sustainability and energy.',
        afvalscheidingswijzer: 'Afvalscheidingswijzer',
        afvalscheidingswijzerDesc: 'The official guide for waste separation in the Netherlands.',
        glossaryTitle: 'Glossary of Waste Types',

        // Waste Search
        wasteSearchTitle: 'What goes where?',
        wasteSearchPlaceholder: 'Search for a waste item...',
        wasteTypeResult: 'Goes in:',

        // Waste Types (for bins and glossary)
        gft: 'VGF (Vegetable, Garden & Fruit)',
        pmd: 'PMD (Plastic, Metal & Drink cartons)',
        rest: 'Residual Waste',
        papier: 'Paper & Cardboard',
        glas: 'Glass',
        kca: 'Small Chemical Waste',
        textiel: 'Textiles',
        'e-waste': 'E-Waste',
        grofvuil: 'Bulky Waste',

        // Waste type definitions (glossary)
        gft_def: 'For all your organic waste like fruit and vegetable scraps, food leftovers, and small garden waste.',
        pmd_def: 'For plastic packaging (bottles, containers), metal packaging (cans), and drink cartons (milk, juice).',
        rest_def: 'For all waste that cannot be separated into other categories, such as diapers or chip bags.',
        papier_def: 'For clean and dry paper and cardboard, like newspapers, boxes, and envelopes.',
        glas_def: 'For empty glass bottles and jars. Lids can often go in PMD. Check local rules.',
        kca_def: 'For hazardous waste like batteries, paint, and energy-saving lamps. Must be returned to a special collection point.',
        textiel_def: 'For wearable clothing, shoes, towels, and home textiles. Should be clean and dry, delivered in a closed bag to a textile container.',
        'e-waste_def': 'For all devices with a plug or battery. Return small devices to stores or bring them to a recycling center (milieustraat).',
        grofvuil_def: 'For large items that do not fit in the regular bin, like furniture. Arrange for collection with your municipality or bring it to a recycling center.',

        // Game items
        apple_core: 'Apple Core',
        plastic_bottle: 'Plastic Bottle',
        pizza_box: 'Greasy Pizza Box',
        newspaper: 'Newspaper',
        wine_bottle: 'Wine Bottle',
        battery: 'Battery',
        banana_peel: 'Banana Peel',
        milk_carton: 'Milk Carton',
        chips_bag: 'Chips Bag',
        cardboard_box: 'Cardboard Box',
        jar_of_jam: 'Jam Jar',
        paint_can: 'Paint Can',
        coffee_grounds: 'Coffee Grounds',
        yoghurt_cup: 'Yoghurt Cup',
        light_bulb: 'Incandescent Bulb',
        magazine: 'Magazine',
        old_tshirt: 'Old T-shirt',
        broken_phone: 'Broken Phone',
    },
    nl: {
        // App
        appTitle: 'Afval Wizard',
        chatTab: 'Chat Wizard',
        gameTab: 'Sorteer Spel',
        infoTab: 'Info & Zoeken',
        footer: 'Afval Wizard © 2024 - Leer afval correct te scheiden!',

        // Chat Agent
        chatIntro: "Hallo! Ik ben de Afval Wizard. Stel me een vraag over afvalscheiding in Nederland, bijvoorbeeld: 'Waar hoort een melkpak?' of 'Wat zijn de regels voor plastic in Amsterdam?'",
        chatPlaceholder: 'Stel de wizard een vraag...',
        sources: 'Bronnen',

        // Game
        gameTitle: 'Afval Sorteer Spel',
        gameIntro: 'Sleep het voorwerp naar de juiste bak!',
        score: 'Score',
        finalScore: 'Eindscore',
        playAgain: 'Opnieuw Spelen',
        enterNickname: 'Voer je bijnaam in...',
        saveScore: 'Score Opslaan',
        highScores: 'Highscores',
        gameCorrectBinMessage: 'Correct! Dit hoort in de {binName} bak.',

        // Info & Glossary
        infoTitle: 'Nuttige Informatie',
        infoIntro: 'Vind meer informatie over afvalscheiding bij deze officiële bronnen.',
        gemeenteContact: 'Jouw Gemeente',
        gemeenteDesc: 'Regels kunnen per stad verschillen. Controleer altijd de website van je lokale gemeente voor de meest accurate informatie.',
        milieuCentraal: 'Milieu Centraal',
        milieuCentraalDesc: 'Een onafhankelijke organisatie met praktische informatie over duurzaamheid en energie.',
        afvalscheidingswijzer: 'Afvalscheidingswijzer',
        afvalscheidingswijzerDesc: 'De officiële gids voor afvalscheiding in Nederland.',
        glossaryTitle: 'Woordenlijst Afvalsoorten',

        // Waste Search
        wasteSearchTitle: 'Wat hoort waar?',
        wasteSearchPlaceholder: 'Zoek naar een afvalproduct...',
        wasteTypeResult: 'Hoort in:',

        // Waste Types
        gft: 'GFT (Groente-, Fruit- en Tuinafval)',
        pmd: 'PMD (Plastic, Metaal & Drankkartons)',
        rest: 'Restafval',
        papier: 'Papier & Karton',
        glas: 'Glas',
        kca: 'Klein Chemisch Afval',
        textiel: 'Textiel',
        'e-waste': 'Elektrisch Afval',
        grofvuil: 'Grofvuil',

        // Waste type definitions
        gft_def: 'Voor al je organisch afval zoals groente- en fruitschillen, etensresten en klein tuinafval.',
        pmd_def: 'Voor plastic verpakkingen (flessen, bakjes), metalen verpakkingen (blikjes) en drankkartons (melk, sap).',
        rest_def: 'Voor al het afval dat niet in andere categorieën kan worden gescheiden, zoals luiers of chipszakken.',
        papier_def: 'Voor schoon en droog papier en karton, zoals kranten, dozen en enveloppen.',
        glas_def: 'Voor lege glazen flessen en potten. Deksels mogen vaak bij PMD. Controleer lokale regels.',
        kca_def: 'Voor gevaarlijk afval zoals batterijen, verf en spaarlampen. Moet worden ingeleverd bij een speciaal inzamelpunt.',
        textiel_def: 'Voor draagbare kleding, schoenen, handdoeken en huishoudtextiel. Moet schoon en droog zijn, aangeleverd in een gesloten zak bij een textielcontainer.',
        'e-waste_def': 'Voor alle apparaten met een stekker of batterij. Lever kleine apparaten in bij winkels of breng ze naar een milieustraat.',
        grofvuil_def: 'Voor grote spullen die niet in de gewone container passen, zoals meubels. Maak een afspraak voor ophaling met je gemeente of breng het naar een milieustraat.',

        // Game items
        apple_core: 'Klokhuis',
        plastic_bottle: 'Plastic Fles',
        pizza_box: 'Vette Pizzadoos',
        newspaper: 'Krant',
        wine_bottle: 'Wijnfles',
        battery: 'Batterij',
        banana_peel: 'Bananenschil',
        milk_carton: 'Melkpak',
        chips_bag: 'Chipszak',
        cardboard_box: 'Kartonnen Doos',
        jar_of_jam: 'Jampot',
        paint_can: 'Verfblik',
        coffee_grounds: 'Koffiedik',
        yoghurt_cup: 'Yoghurtbeker',
        light_bulb: 'Gloeilamp',
        magazine: 'Tijdschrift',
        old_tshirt: 'Oud T-shirt',
        kapotte_telefoon: 'Kapotte Telefoon',
    },
    zh: {
        // App
        appTitle: '垃圾分类精灵',
        chatTab: '聊天精灵',
        gameTab: '分类游戏',
        infoTab: '信息与搜索',
        footer: '垃圾分类精灵 © 2024 - 学习正确分类垃圾！',

        // Chat Agent
        chatIntro: "你好！我是垃圾分类精灵。你可以问我任何关于荷兰垃圾分类的问题，例如：'牛奶盒应该扔在哪里？' 或 '阿姆斯特丹对塑料有什么规定？'",
        chatPlaceholder: '向精灵提问...',
        sources: '来源',

        // Game
        gameTitle: '垃圾分类游戏',
        gameIntro: '将物品拖到正确的垃圾箱！',
        score: '分数',
        finalScore: '最终得分',
        playAgain: '再玩一次',
        enterNickname: '输入你的昵称...',
        saveScore: '保存分数',
        highScores: '高分榜',
        gameCorrectBinMessage: '正确！这应该扔进 {binName} 箱。',

        // Info & Glossary
        infoTitle: '有用信息',
        infoIntro: '在这些官方来源找到更多关于垃圾分类的信息。',
        gemeenteContact: '你所在的市政府 (Gemeente)',
        gemeenteDesc: '不同城市的规定可能不同。请务必查看你当地市政府的网站以获取最准确的信息。',
        milieuCentraal: '中央环境',
        milieuCentraalDesc: '一个提供关于可持续性和能源实用信息的独立组织。',
        afvalscheidingswijzer: '垃圾分类指南',
        afvalscheidingswijzerDesc: '荷兰官方的垃圾分类指南。',
        glossaryTitle: '垃圾类型词汇表',
        
        // Waste Search
        wasteSearchTitle: '什么东西扔哪里？',
        wasteSearchPlaceholder: '搜索垃圾物品...',
        wasteTypeResult: '扔进：',

        // Waste Types
        gft: 'VGF (蔬菜、花园和水果垃圾)',
        pmd: 'PMD (塑料、金属和饮料纸盒)',
        rest: '残余垃圾',
        papier: '纸张和纸板',
        glas: '玻璃',
        kca: '小型化学废物',
        textiel: '纺织品',
        'e-waste': '电子垃圾',
        grofvuil: '大件垃圾',

        // Waste type definitions
        gft_def: '适用于所有有机废物，如水果和蔬菜皮、食物残渣和小型花园废物。',
        pmd_def: '适用于塑料包装（瓶子、容器）、金属包装（罐头）和饮料纸盒（牛奶、果汁）。',
        rest_def: '适用于所有不能分类到其他类别的垃圾，如尿布或薯片袋。',
        papier_def: '适用于清洁干燥的纸张和纸板，如报纸、盒子和信封。',
        glas_def: '适用于空的玻璃瓶和罐子。盖子通常可以放入PMD。请检查当地规定。',
        kca_def: '适用于有害废物，如电池、油漆和节能灯。必须交回特殊收集点。',
        textiel_def: '适用于可穿戴的衣物、鞋子、毛巾和家用纺织品。应保持清洁干燥，并放入封闭的袋子中，投放到纺织品回收箱。',
        'e-waste_def': '适用于所有带插头或电池的设备。将小型设备退回商店或带到回收中心 (milieustraat)。',
        grofvuil_def: '适用于无法放入普通垃圾箱的大件物品，如家具。请与你所在的市政府安排收集，或将其带到回收中心。',

        // Game items
        apple_core: '苹果核',
        plastic_bottle: '塑料瓶',
        pizza_box: '油腻的披萨盒',
        newspaper: '报纸',
        wine_bottle: '酒瓶',
        battery: '电池',
        banana_peel: '香蕉皮',
        milk_carton: '牛奶盒',
        chips_bag: '薯片袋',
        cardboard_box: '纸板箱',
        jar_of_jam: '果酱罐',
        paint_can: '油漆罐',
        coffee_grounds: '咖啡渣',
        yoghurt_cup: '酸奶杯',
        light_bulb: '白炽灯泡',
        magazine: '杂志',
        old_tshirt: '旧T恤',
        broken_phone: '坏掉的手机',
    },
};

export const WASTE_BINS: Record<WasteType, { nameKey: keyof typeof TRANSLATIONS['en']; color: string; }> = {
    gft: { nameKey: 'gft', color: 'bg-green-500' },
    pmd: { nameKey: 'pmd', color: 'bg-orange-400' },
    rest: { nameKey: 'rest', color: 'bg-gray-500' },
    papier: { nameKey: 'papier', color: 'bg-blue-500' },
    glas: { nameKey: 'glas', color: 'bg-yellow-400' },
    kca: { nameKey: 'kca', color: 'bg-red-600' },
    textiel: { nameKey: 'textiel', color: 'bg-purple-500' },
    'e-waste': { nameKey: 'e-waste', color: 'bg-slate-700' },
    grofvuil: { nameKey: 'grofvuil', color: 'bg-amber-800' },
};

export const WASTE_ITEMS: GameItem[] = [
    { nameKey: 'apple_core', image: 'https://i.imgur.com/vL3zQY8.png', type: 'gft' },
    { nameKey: 'plastic_bottle', image: 'https://i.imgur.com/d3aA8Y6.png', type: 'pmd' },
    { nameKey: 'pizza_box', image: 'https://i.imgur.com/uEVvT9H.png', type: 'rest' },
    { nameKey: 'newspaper', image: 'https://i.imgur.com/3Y1ZgQ1.png', type: 'papier' },
    { nameKey: 'wine_bottle', image: 'https://i.imgur.com/4zY4J9p.png', type: 'glas' },
    { nameKey: 'battery', image: 'https://i.imgur.com/9O1yY8T.png', type: 'kca' },
    { nameKey: 'banana_peel', image: 'https://i.imgur.com/J3s0U0S.png', type: 'gft' },
    { nameKey: 'milk_carton', image: 'https://i.imgur.com/Dq8g5g9.png', type: 'pmd' },
    { nameKey: 'chips_bag', image: 'https://i.imgur.com/i8z6o9o.png', type: 'rest' },
    { nameKey: 'cardboard_box', image: 'https://i.imgur.com/mU1gR1j.png', type: 'papier' },
    { nameKey: 'jar_of_jam', image: 'https://i.imgur.com/o3V8aY0.png', type: 'glas' },
    { nameKey: 'paint_can', image: 'https://i.imgur.com/Y1gQ9jT.png', type: 'kca' },
    { nameKey: 'coffee_grounds', image: 'https://i.imgur.com/7b3b8g6.png', type: 'gft' },
    { nameKey: 'yoghurt_cup', image: 'https://i.imgur.com/2Y4bS2s.png', type: 'pmd' },
    { nameKey: 'light_bulb', image: 'https://i.imgur.com/e3g3u4X.png', type: 'rest' },
    { nameKey: 'magazine', image: 'https://i.imgur.com/0u0bV1X.png', type: 'papier' },
    { nameKey: 'old_tshirt', image: 'https://i.imgur.com/Q3H2R9s.png', type: 'textiel' },
    { nameKey: 'broken_phone', image: 'https://i.imgur.com/6U8Y2kY.png', type: 'e-waste' },
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
    { termKey: 'gft', definitionKey: 'gft_def' },
    { termKey: 'pmd', definitionKey: 'pmd_def' },
    { termKey: 'rest', definitionKey: 'rest_def' },
    { termKey: 'papier', definitionKey: 'papier_def' },
    { termKey: 'glas', definitionKey: 'glas_def' },
    { termKey: 'kca', definitionKey: 'kca_def' },
    { termKey: 'textiel', definitionKey: 'textiel_def' },
    { termKey: 'e-waste', definitionKey: 'e-waste_def' },
    { termKey: 'grofvuil', definitionKey: 'grofvuil_def' },
];

// Massively expanded list based on afvalscheidingswijzer.nl
const wasteList: SearchableWasteItem[] = [

];

export const SEARCHABLE_WASTE_LIST: SearchableWasteItem[] = wasteList.sort((a, b) => a.en.localeCompare(b.en));