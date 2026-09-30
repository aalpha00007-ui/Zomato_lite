// Demo data: 3 cities, 30 made-up restaurants, menus and reviews.
// Every name here is invented for the demo.

export const cities = ["Ludhiana", "Jammu", "Chandigarh"];

// [category, name, description, price, veg, bestseller]
const M = {
  burrito: [
    ["Burritos", "Paneer Tikka Burrito", "Smoky paneer tikka, jeera rice, onion salad and mint mayo in a warm tortilla.", 249, true, true],
    ["Burritos", "Butter Chicken Burrito", "Makhani chicken, buttered rice and pickled onions, rolled tight.", 289, false, true],
    ["Burritos", "Rajma Chawal Burrito", "Home-style rajma and rice with a crunchy slaw.", 219, true, false],
    ["Burritos", "Amritsari Fish Burrito", "Crisp ajwain-battered fish with tangy chutney.", 309, false, false],
    ["Bowls", "Chole Burrito Bowl", "Pindi chole, rice, salsa and dahi, no tortilla.", 229, true, false],
    ["Bowls", "Keema Burrito Bowl", "Spiced mutton keema over rice with lime and onions.", 279, false, false],
    ["Sides", "Masala Nachos", "Corn chips with chaat masala, cheese and salsa.", 149, true, false],
    ["Drinks", "Sweet Lassi", "Thick Punjabi lassi with malai on top.", 99, true, false],
  ],
  north: [
    ["Starters", "Paneer Tikka", "Chargrilled cottage cheese marinated in hung curd and spices.", 279, true, true],
    ["Starters", "Tandoori Chicken (Half)", "Classic clay-oven chicken with mint chutney.", 329, false, true],
    ["Main Course", "Dal Makhani", "Black lentils slow-cooked overnight with butter and cream.", 249, true, true],
    ["Main Course", "Butter Chicken", "Tandoori chicken in a silky tomato-butter gravy.", 359, false, false],
    ["Main Course", "Kadhai Paneer", "Paneer tossed with capsicum and freshly ground kadhai masala.", 289, true, false],
    ["Breads", "Butter Naan", "Soft tandoor naan brushed with butter.", 59, true, false],
    ["Breads", "Lachha Paratha", "Flaky layered whole-wheat paratha.", 69, true, false],
    ["Desserts", "Gulab Jamun (2 pcs)", "Warm khoya dumplings in cardamom syrup.", 89, true, false],
  ],
  biryani: [
    ["Biryani", "Chicken Dum Biryani", "Long-grain basmati and chicken sealed and slow-cooked in a handi.", 329, false, true],
    ["Biryani", "Mutton Biryani", "Tender mutton, saffron rice, fried onions.", 429, false, false],
    ["Biryani", "Veg Dum Biryani", "Seasonal vegetables layered with fragrant rice.", 259, true, false],
    ["Biryani", "Paneer Biryani", "Paneer tikka cubes in spiced dum rice.", 289, true, false],
    ["Kebabs", "Chicken Seekh Kebab", "Minced chicken skewers off the charcoal grill.", 299, false, true],
    ["Sides", "Mirchi ka Salan", "Tangy chilli-peanut curry, made for biryani.", 79, true, false],
    ["Sides", "Boondi Raita", "Chilled curd with crisp boondi.", 59, true, false],
    ["Desserts", "Double ka Meetha", "Bread pudding soaked in saffron milk.", 119, true, false],
  ],
  pizza: [
    ["Pizzas", "Margherita", "Tomato sauce, mozzarella and basil on a hand-stretched base.", 199, true, true],
    ["Pizzas", "Farmhouse", "Onion, capsicum, tomato and mushroom.", 299, true, false],
    ["Pizzas", "Paneer Makhani Pizza", "Makhani sauce, paneer tikka and onions.", 329, true, true],
    ["Pizzas", "Chicken Tikka Pizza", "Tandoori chicken, red paprika and jalapenos.", 369, false, false],
    ["Pizzas", "Pepperoni", "Loaded chicken pepperoni with extra cheese.", 399, false, false],
    ["Sides", "Garlic Bread", "Toasted with garlic butter and herbs.", 129, true, false],
    ["Sides", "Cheesy Dip", "Warm cheese dip for your crusts.", 39, true, false],
    ["Drinks", "Cold Coffee", "Blended with ice cream.", 119, true, false],
  ],
  burger: [
    ["Burgers", "Aloo Tikki Burger", "Crisp potato patty, onions and tangy sauce.", 99, true, true],
    ["Burgers", "Crispy Paneer Burger", "Fried paneer slab with peri-peri mayo.", 169, true, false],
    ["Burgers", "Grilled Chicken Burger", "Flame-grilled chicken, lettuce and smoky sauce.", 199, false, true],
    ["Burgers", "Double Chicken Burger", "Two crispy patties, double cheese.", 259, false, false],
    ["Sides", "Peri Peri Fries", "Skin-on fries with peri-peri shake.", 119, true, false],
    ["Sides", "Onion Rings", "Golden battered onion rings.", 109, true, false],
    ["Shakes", "Oreo Shake", "Thick shake blended with cookies.", 149, true, false],
    ["Shakes", "Chocolate Thick Shake", "Dark chocolate, extra thick.", 159, true, false],
  ],
  chinese: [
    ["Starters", "Honey Chilli Potato", "Crispy potato fingers in sweet-spicy glaze.", 199, true, true],
    ["Starters", "Chilli Chicken Dry", "Wok-tossed chicken with peppers and green chilli.", 259, false, true],
    ["Starters", "Veg Spring Roll", "Crunchy rolls stuffed with stir-fried veggies.", 179, true, false],
    ["Momos", "Chicken Momos (8 pcs)", "Steamed dumplings with fiery red chutney.", 169, false, true],
    ["Momos", "Veg Momos (8 pcs)", "Cabbage-carrot filling, steamed.", 139, true, false],
    ["Noodles & Rice", "Veg Hakka Noodles", "Street-style noodles tossed on high flame.", 189, true, false],
    ["Noodles & Rice", "Chicken Fried Rice", "Egg-fried rice with chicken and spring onion.", 229, false, false],
    ["Soups", "Hot & Sour Soup", "Peppery, tangy and loaded with veggies.", 139, true, false],
  ],
  south: [
    ["Dosa", "Masala Dosa", "Crisp rice crepe with spiced potato, sambar and chutneys.", 149, true, true],
    ["Dosa", "Mysore Masala Dosa", "Spread with fiery red chutney.", 169, true, false],
    ["Dosa", "Paneer Dosa", "Stuffed with spiced paneer bhurji.", 189, true, false],
    ["Idli & Vada", "Idli Sambar (2 pcs)", "Soft steamed idlis with sambar.", 99, true, true],
    ["Idli & Vada", "Medu Vada (2 pcs)", "Crisp lentil doughnuts.", 109, true, false],
    ["Uttapam", "Onion Uttapam", "Thick rice pancake topped with onions.", 159, true, false],
    ["Rice", "Curd Rice", "Cool curd rice tempered with mustard and curry leaves.", 129, true, false],
    ["Drinks", "Filter Coffee", "Strong decoction with frothy milk.", 69, true, true],
  ],
  rolls: [
    ["Rolls", "Paneer Kathi Roll", "Paneer tikka, onions and green chutney in a flaky paratha.", 149, true, true],
    ["Rolls", "Chicken Tikka Roll", "Juicy tikka with laccha onions.", 179, false, true],
    ["Rolls", "Egg Roll", "Double egg paratha, Kolkata style.", 119, false, false],
    ["Rolls", "Mutton Seekh Roll", "Charred seekh kebab wrapped with mint mayo.", 219, false, false],
    ["Combos", "Double Roll Combo", "Any two chicken rolls with a drink.", 299, false, false],
    ["Sides", "Masala Fries", "Fries with chaat masala.", 99, true, false],
    ["Drinks", "Masala Chaas", "Spiced buttermilk.", 59, true, false],
  ],
  dessert: [
    ["Pastries", "Chocolate Truffle Pastry", "Layers of dark chocolate ganache.", 139, true, true],
    ["Pastries", "Red Velvet Pastry", "With cream cheese frosting.", 149, true, false],
    ["Hot Desserts", "Sizzling Brownie", "Brownie on a hot plate with ice cream and fudge.", 199, true, true],
    ["Ice Creams", "Kulfi Falooda", "Malai kulfi, falooda, rose syrup.", 169, true, false],
    ["Mithai", "Rasmalai (2 pcs)", "Soft chenna in saffron milk.", 129, true, false],
    ["Mithai", "Kaju Katli (250 g)", "Classic cashew fudge.", 299, true, false],
    ["Shakes", "Mango Shake", "Made with Alphonso pulp.", 139, true, false],
  ],
  cafe: [
    ["Coffee", "Cappuccino", "Double shot with velvety foam.", 159, true, true],
    ["Coffee", "Cold Brew", "Steeped 18 hours, served over ice.", 189, true, false],
    ["Coffee", "Hot Chocolate", "Rich and thick.", 179, true, false],
    ["Food", "Grilled Veg Sandwich", "Pesto, veggies and cheese, grilled.", 169, true, false],
    ["Food", "Chicken Club Sandwich", "Triple-decker with chicken, egg and lettuce.", 229, false, true],
    ["Food", "Alfredo Pasta", "Penne in a creamy white sauce.", 259, true, false],
    ["Bakery", "Blueberry Muffin", "Baked fresh every morning.", 129, true, false],
    ["Bakery", "Butter Croissant", "Flaky and golden.", 119, true, false],
  ],
  thali: [
    ["Thalis", "Punjabi Thali", "Dal, paneer, seasonal sabzi, rice, 2 rotis, raita and sweet.", 279, true, true],
    ["Thalis", "Rajasthani Thali", "Dal baati, gatte ki sabzi, kadhi, churma.", 299, true, true],
    ["Thalis", "Mini Thali", "Dal, sabzi, rice, 2 rotis.", 179, true, false],
    ["Mains", "Chole Bhature", "Two fluffy bhature with pindi chole.", 179, true, true],
    ["Mains", "Kadhi Chawal", "Pakoda kadhi with steamed rice.", 169, true, false],
    ["Mains", "Rajma Chawal", "Jammu-style rajma with rice.", 169, true, false],
    ["Sweets", "Jalebi (250 g)", "Hot and crisp.", 119, true, false],
    ["Drinks", "Sweet Lassi", "Thick and chilled.", 89, true, false],
  ],
  kashmiri: [
    ["Wazwan", "Rogan Josh", "Mutton in a deep red Kashmiri chilli gravy.", 399, false, true],
    ["Wazwan", "Gushtaba", "Pounded mutton balls in yoghurt gravy.", 449, false, false],
    ["Wazwan", "Yakhni", "Mutton in a delicate fennel-yoghurt curry.", 379, false, false],
    ["Veg", "Kashmiri Dum Aloo", "Baby potatoes in a fiery, fragrant gravy.", 249, true, true],
    ["Veg", "Nadru Yakhni", "Lotus stem in yoghurt gravy.", 269, true, false],
    ["Veg", "Bhaderwah Rajma", "Small red rajma, slow-cooked.", 199, true, false],
    ["Breads", "Kashmiri Roti", "Soft sesame-topped bread.", 49, true, false],
    ["Drinks", "Kahwa", "Green tea with saffron, cardamom and almonds.", 79, true, true],
  ],
};

const TINT = {
  burrito: "#FFEBD9", north: "#FDE2D6", biryani: "#FFF1CC", pizza: "#FFE0DC", burger: "#FFEFC7",
  chinese: "#FDE3E3", south: "#E9F5DE", rolls: "#FBE7D3", dessert: "#FCE4F0", cafe: "#EFE6DC",
  thali: "#FFF0D6", kashmiri: "#F9DEDB",
};

// [name, cuisine, area, costForTwo, deliveryMinutes, pureVeg, emoji, menu, offer]
const R = {
  Ludhiana: [
    ["Ludhiana Burrito", "Indian, Mexican", "Sector 32", 400, 30, false, "🌯", "burrito", "20% OFF up to ₹50"],
    ["Punjab Grill House", "North Indian, Mughlai", "Model Town", 700, 35, false, "🍛", "north", "₹100 OFF above ₹499"],
    ["Haveli Rasoi", "North Indian, Thali", "Ferozepur Road", 500, 40, true, "🍲", "thali", null],
    ["Dum Pukht Degchi", "Biryani, Mughlai", "Sarabha Nagar", 600, 35, false, "🍚", "biryani", "Flat ₹75 OFF"],
    ["Slice Theory", "Pizza, Italian", "Pakhowal Road", 500, 30, false, "🍕", "pizza", "Buy 1 Get 1 on pizzas"],
    ["Bun Intended", "Burger, Fast Food", "BRS Nagar", 350, 25, false, "🍔", "burger", null],
    ["Wok This Way", "Chinese, Momos", "Dugri", 450, 30, false, "🥡", "chinese", "30% OFF up to ₹75"],
    ["Rolling Tandoor", "Rolls, Street Food", "Ghumar Mandi", 300, 20, false, "🌮", "rolls", null],
    ["Mithaas Corner", "Desserts, Mithai", "Clock Tower", 300, 25, true, "🍰", "dessert", "Free delivery"],
    ["Bean Street Cafe", "Cafe, Coffee", "Sarabha Nagar", 600, 30, false, "☕", "cafe", null],
  ],
  Jammu: [
    ["Wazwan Heritage", "Kashmiri, Mughlai", "Gandhi Nagar", 900, 45, false, "🥘", "kashmiri", "₹150 OFF above ₹799"],
    ["Tawi Rasoi", "North Indian, Thali", "Residency Road", 450, 35, true, "🍲", "thali", null],
    ["Raghunath Rolls & Chaat", "Rolls, Street Food", "Raghunath Bazaar", 250, 20, false, "🌮", "rolls", "Free delivery"],
    ["Duggar Dhaba", "North Indian", "Trikuta Nagar", 550, 35, false, "🍛", "north", "20% OFF up to ₹60"],
    ["Dosa Mandapam", "South Indian", "Gandhi Nagar", 300, 25, true, "🥞", "south", null],
    ["Crust & Co.", "Pizza, Italian", "Channi Himmat", 550, 30, false, "🍕", "pizza", "Flat ₹50 OFF"],
    ["Momo Point", "Chinese, Momos", "Bahu Plaza", 350, 25, false, "🥟", "chinese", null],
    ["Biryani Darbar", "Biryani", "Janipur", 550, 40, false, "🍚", "biryani", "₹100 OFF above ₹499"],
    ["The Sugar Loaf", "Desserts, Bakery", "Gandhi Nagar", 350, 30, true, "🧁", "dessert", null],
    ["Brew Theory", "Cafe, Coffee", "Bakshi Nagar", 650, 30, false, "☕", "cafe", "10% OFF on all orders"],
  ],
  Chandigarh: [
    ["Plaza Kitchen", "North Indian, Mughlai", "Sector 17", 900, 35, false, "🍛", "north", null],
    ["Tri-City Burgers", "Burger, Fast Food", "Sector 35", 400, 25, false, "🍔", "burger", "Flat ₹40 OFF"],
    ["Madras Tiffin Room", "South Indian", "Sector 22", 350, 25, true, "🥞", "south", "Free delivery"],
    ["Napoli Oven", "Pizza, Italian", "Industrial Area", 700, 35, false, "🍕", "pizza", "20% OFF up to ₹100"],
    ["Dragon Bowl", "Chinese, Asian", "Sector 8", 600, 30, false, "🥡", "chinese", null],
    ["Nawabi Handi", "Biryani, Mughlai", "Sector 35", 700, 40, false, "🍚", "biryani", "₹125 OFF above ₹599"],
    ["Ghar ki Rasoi", "North Indian, Thali", "Sector 21", 400, 30, true, "🍲", "thali", null],
    ["Roll Call", "Rolls, Street Food", "Sector 11", 300, 20, false, "🌮", "rolls", "Free delivery"],
    ["Frost & Fudge", "Desserts, Ice Cream", "Sector 9", 400, 25, true, "🍨", "dessert", null],
    ["Lakeview Brew Co.", "Cafe, Coffee", "Sector 7", 700, 30, false, "☕", "cafe", null],
  ],
};

export const restaurants = cities.flatMap((city) =>
  R[city].map(([name, cuisine, area, cost, mins, veg, emoji, menu, offer]) => ({
    city, name, cuisine, area, cost, mins, veg, emoji, offer, tint: TINT[menu], menu: M[menu],
  }))
);

// The original three reviews from the guide stay with Ludhiana Burrito.
export const guideReviews = [
  ["Priya", 5, "Paneer burrito is unreal", 8],
  ["Aman", 4, "Good, but slow service", 6],
  ["Simran", 4, "Solid. Would repeat.", 2],
];

const POOL = [
  [5, "Loved every bite. Will order again."],
  [4, "Tasty food, packaging could be better."],
  [4, "Good portion size for the price."],
  [4, "Great taste, delivery took a little longer than promised."],
  [5, "Best in the area, hands down."],
  [4, "Fresh and hot on arrival."],
  [3, "Food was a bit cold when it arrived."],
  [5, "Consistently great."],
  [4, "Solid choice for a weeknight dinner."],
  [3, "Okay taste, a bit oily."],
];
const AUTHORS = ["Arjun", "Neha", "Rohit", "Ishita", "Karan", "Mehak", "Vikram", "Tanya", "Sahil", "Ritika"];

// Reviews for restaurant number n (1-based). The last restaurant gets none, to show the "new" state.
export function reviewsFor(n) {
  if (n === 1) return guideReviews;
  if (n === restaurants.length) return [];
  const count = 2 + (n % 4);
  return Array.from({ length: count }, (_, k) => {
    const [rating, comment] = POOL[(n * 3 + k * 7) % POOL.length];
    return [AUTHORS[(n + k) % AUTHORS.length], rating, comment, 1 + k * 3 + (n % 3)];
  });
}
