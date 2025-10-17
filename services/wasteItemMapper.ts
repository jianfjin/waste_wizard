import { SearchableWasteItem, GameItem, WasteType } from '../types';

/**
 * Map of keywords to emojis for waste items
 */
const emojiMap: Record<string, string> = {
    // Food & Organic
    'apple': '🍎',
    'banana': '🍌',
    'orange': '🍊',
    'lemon': '🍋',
    'strawberry': '🍓',
    'grape': '🍇',
    'watermelon': '🍉',
    'melon': '🍈',
    'cherry': '🍒',
    'peach': '🍑',
    'pineapple': '🍍',
    'kiwi': '🥝',
    'avocado': '🥑',
    'tomato': '🍅',
    'eggplant': '🍆',
    'cucumber': '🥒',
    'carrot': '🥕',
    'corn': '🌽',
    'pepper': '🌶️',
    'broccoli': '🥦',
    'garlic': '🧄',
    'onion': '🧅',
    'mushroom': '🍄',
    'potato': '🥔',
    'bread': '🍞',
    'cheese': '🧀',
    'meat': '🥩',
    'bacon': '🥓',
    'chicken': '🍗',
    'egg': '🥚',
    'fish': '🐟',
    'shrimp': '🦐',
    'pizza': '🍕',
    'burger': '🍔',
    'sandwich': '🥪',
    'taco': '🌮',
    'burrito': '🌯',
    'cake': '🍰',
    'cookie': '🍪',
    'chocolate': '🍫',
    'candy': '🍬',
    'ice cream': '🍦',
    'coffee': '☕',
    'tea': '🍵',
    'milk': '🥛',
    'juice': '🧃',
    'wine': '🍷',
    'beer': '🍺',
    'champagne': '🍾',
    'bottle': '🍾',
    'can': '🥫',
    'jar': '🫙',
    
    // Paper & Cardboard
    'paper': '📄',
    'newspaper': '📰',
    'magazine': '📖',
    'book': '📚',
    'notebook': '📓',
    'envelope': '✉️',
    'card': '🎴',
    'cardboard': '📦',
    'box': '📦',
    
    // Glass
    'glass': '🫙',
    'mirror': '🪞',
    'window': '🪟',
    
    // Plastic
    'plastic': '🧴',
    'plastic bag': '🛍️',
    'cup': '🥤',
    'straw': '🧃',
    'wrap': '📦',
    
    // Metal
    'metal': '🔩',
    'aluminum': '🥫',
    'tin': '🥫',
    'foil': '🥄',
    'battery': '🔋',
    
    // Textiles
    'clothes': '👕',
    'shirt': '👕',
    't-shirt': '👕',
    'pants': '👖',
    'dress': '👗',
    'coat': '🧥',
    'jacket': '🧥',
    'shoes': '👟',
    'sneakers': '👟',
    'boots': '🥾',
    'socks': '🧦',
    'hat': '🎩',
    'cap': '🧢',
    'gloves': '🧤',
    'scarf': '🧣',
    'tie': '👔',
    'bag': '👜',
    'backpack': '🎒',
    'towel': '🧺',
    'blanket': '🛏️',
    'curtain': '🪟',
    'pillow': '🛏️',
    
    // Electronics
    'phone': '📱',
    'mobile': '📱',
    'computer': '💻',
    'laptop': '💻',
    'tablet': '📱',
    'keyboard': '⌨️',
    'mouse': '🖱️',
    'camera': '📷',
    'television': '📺',
    'tv': '📺',
    'radio': '📻',
    'speaker': '🔊',
    'headphone': '🎧',
    'charger': '🔌',
    'cable': '🔌',
    'lamp': '💡',
    'bulb': '💡',
    'light': '💡',
    
    // Furniture & Large Items
    'chair': '🪑',
    'table': '🪑',
    'bed': '🛏️',
    'sofa': '🛋️',
    'couch': '🛋️',
    'desk': '🪑',
    'shelf': '📚',
    'cabinet': '🗄️',
    'drawer': '🗄️',
    'mattress': '🛏️',
    'door': '🚪',
    'carpet': '🧹',
    'rug': '🧹',
    
    // Household Items
    'toilet': '🚽',
    'shower': '🚿',
    'bath': '🛁',
    'sink': '🚰',
    'faucet': '🚰',
    'brush': '🪥',
    'toothbrush': '🪥',
    'soap': '🧼',
    'shampoo': '🧴',
    'detergent': '🧴',
    'cleaning': '🧹',
    'broom': '🧹',
    'mop': '🧹',
    'vacuum': '🧹',
    'bucket': '🪣',
    'trash': '🗑️',
    'bin': '🗑️',
    
    // Garden
    'plant': '🌱',
    'flower': '🌸',
    'tree': '🌳',
    'leaf': '🍃',
    'grass': '🌿',
    'wood': '🪵',
    'branch': '🌿',
    'soil': '🪴',
    'pot': '🪴',
    
    // Chemicals & Hazardous
    'paint': '🎨',
    'oil': '🛢️',
    'chemical': '🧪',
    'medicine': '💊',
    'pill': '💊',
    'syringe': '💉',
    'thermometer': '🌡️',
    
    // Vehicles
    'car': '🚗',
    'auto': '🚗',
    'bike': '🚲',
    'bicycle': '🚲',
    'motorcycle': '🏍️',
    'scooter': '🛴',
    'tire': '🚗',
    'wheel': '🚗',
    
    // Tools
    'tool': '🔧',
    'hammer': '🔨',
    'wrench': '🔧',
    'screwdriver': '🪛',
    'saw': '🪚',
    'drill': '🔩',
    'nail': '🔩',
    'screw': '🔩',
    
    // Other
    'toy': '🧸',
    'ball': '⚽',
    'pen': '🖊️',
    'pencil': '✏️',
    'crayon': '🖍️',
    'eraser': '🧽',
    'scissors': '✂️',
    'tape': '📦',
    'glue': '🧴',
    'key': '🔑',
    'lock': '🔒',
    'watch': '⌚',
    'clock': '⏰',
    'glasses': '👓',
    'sunglasses': '🕶️',
    'umbrella': '☂️',
    'cane': '🦯',
    'cigarette': '🚬',
    'candle': '🕯️',
    'match': '🔥',
    'fire': '🔥',
};

/**
 * Find an appropriate emoji for a waste item based on its name
 */
function findEmojiForItem(itemName: string): string {
    const lowerName = itemName.toLowerCase();
    
    // First, try exact word matches
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
        if (lowerName.includes(keyword)) {
            return emoji;
        }
    }
    
    // Default emoji based on first letter or generic
    return '📦';
}

/**
 * Convert item name to image filename
 * Uses Dutch name to match images in images_selected folder
 */
function getImagePath(dutchName: string): string {
    // Convert Dutch name to filename format: lowercase, spaces to underscores, add _0.webp
    const filename = dutchName.toLowerCase().replace(/\s+/g, '_') + '_0.webp';
    return `/images_selected/${filename}`;
}

/**
 * Check if an image exists (we'll assume it exists based on filename pattern)
 * In a real app, you might want to verify the file exists
 */
function hasImage(dutchName: string): boolean {
    // List of known image filenames (could be generated from directory listing)
    // For now, we'll try to load all images and use emoji as fallback if it fails
    return true; // Optimistically assume image exists
}

/**
 * Convert SearchableWasteItem to GameItem with image or emoji
 */
export function convertToGameItem(wasteItem: SearchableWasteItem, language: 'en' | 'nl' | 'zh' = 'en'): GameItem {
    const emoji = findEmojiForItem(wasteItem[language]);
    const imagePath = getImagePath(wasteItem.nl); // Use Dutch name for image lookup
    
    return {
        nameKey: wasteItem[language],
        image: imagePath, // Store image path, with emoji as data attribute for fallback
        imageEmoji: emoji, // Keep emoji as backup
        type: wasteItem.type,
    };
}

/**
 * Randomly select N items from SearchableWasteItem list and convert to GameItems
 * @param excludedNames - Optional array of Dutch names to exclude from selection
 */
export function selectRandomWasteItems(
    wasteList: SearchableWasteItem[], 
    count: number = 20,
    language: 'en' | 'nl' | 'zh' = 'en',
    excludedNames: string[] = []
): GameItem[] {
    // Filter out excluded items
    const availableItems = excludedNames.length > 0 
        ? wasteList.filter(item => !excludedNames.includes(item.nl))
        : wasteList;
    
    // If we don't have enough items after filtering, use all available
    const itemsToUse = availableItems.length >= count ? availableItems : wasteList;
    
    // Shuffle the array
    const shuffled = [...itemsToUse].sort(() => Math.random() - 0.5);
    
    // Take first N items
    const selected = shuffled.slice(0, count);
    
    // Convert to game items
    return selected.map(item => convertToGameItem(item, language));
}
