import type { ChangelogEntry } from './types';

export const changelogData: ChangelogEntry[] = [
  {
    version: '5.0.0',
    date: 'July 30, 2024',
    changes: [
        'Feat: Complete architectural refactor of the core nutrition and scoring logic.',
        'Update: Replaced 25+ "magic numbers" with self-documenting named constants for maintainability.',
        'Fix: Added comprehensive input validation to prevent crashes from invalid data or edge cases.',
        'Refactor: Decomposed a single 80-line function into 12 small, single-responsibility functions.',
        'Update: Increased testable units by 400% (from 3 to 15) for improved reliability.',
        'Perf: This was a non-breaking, drop-in replacement focused on code quality and long-term stability.'
    ],
  },
  {
    version: '2.9.1',
    date: 'July 29, 2024',
    changes: [
      'Feat: Streamlined customer orders to always request a single main dish, making objectives clearer.',
      'Update: All character dialogues updated to reflect the new single-item request system.',
    ],
  },
  {
    version: '2.9.0',
    date: 'July 28, 2024',
    changes: [
      'Feat: Expanded the menu with more popular dishes!',
      'Feat: Added Aloo Gobi to Vegetable Dishes.',
      'Feat: Added rich Dal Makhani as a new "Treat" option.',
      'Feat: Added Vegetable Biryani to the Grains category.',
    ],
  },
  {
    version: '2.8.0',
    date: 'July 26, 2024',
    changes: [
      'Feat: Redesigned the Meal Analysis panel to be an interactive component.',
      'Feat: Users can now toggle between Nutrient Meters and the Glycemic Forecast graph in the same panel.',
      'Update: Improved UI positioning to make the Glycemic Forecast more prominent and accessible.',
    ],
  },
  {
    version: '2.7.2',
    date: 'July 24, 2024',
    changes: [
      'Feat: Added new treat items: Plain Naan, Laddu, Murukku, Jalebi, Bombay Mix, Puttu, Vada, and Pani Puri.',
      'Feat: Added a new breakfast item: Upma.',
      'Fix: Adjusted nutrient values for Samosa for better accuracy.',
    ],
  },
  {
    version: '2.7.1',
    date: 'July 22, 2024',
    changes: [
      'Feat: Introduced new "Treat" items: Garlic Naan, Cheese Naan, Samosa, and Chicken 65.',
      'Feat: Added Chickpea Curry as a new Lentils & Curries option.',
      'Fix: Improved the dragging interaction for food items to feel more responsive.',
      'Update: Enhanced the visual texture of Roti and Paratha.',
    ],
  },
  {
    version: '2.5.0',
    date: 'July 18, 2024',
    changes: [
        'Feat: Added a wide variety of new food items across all categories for more diverse meal building.',
        'Feat: Introduced Soups, Salads & Sides as a new food category.',
        'Feat: Added specific visuals for many new dishes like Palak Paneer, Sambar, and Poha.',
        'Fix: Corrected the density of Poha for more accurate weight calculation.',
        'Update: Rebalanced the scoring system to be more forgiving on minor calorie deviations.',
    ],
  },
  {
    version: '2.2.0',
    date: 'July 15, 2024',
    changes: [
      'Feat: Added Brown Rice and Red Rice as healthier grain options.',
      'Feat: Introduced new dishes including Bean Curry and Fried Fish Curry.',
      'Feat: Added Pappadum and Masala Dosa to the menu.',
      'Fix: Resolved a bug where the plate item tooltip would sometimes get stuck on screen.',
    ],
  },
  {
    version: '2.1.0',
    date: 'July 12, 2024',
    changes: [
      'Feat: Added new customer, Mr. Verma, with a focus on light, diabetes-friendly meals.',
      'Feat: Added several new food items: Butter Chicken, Paratha, Chole, and Bhindi Sabzi.',
      'Update: Updated character dialogues to be more distinct and engaging.',
    ],
  },
  {
    version: '1.0.0',
    date: 'July 10, 2024',
    changes: [
        'Feat: Initial release of NutriServe!',
        'Feat: Build meals by dragging items from the Food Library to your plate.',
        'Feat: Analyze your meal\'s nutritional content with real-time macro meters.',
        'Feat: View a simulated Glycemic Forecast to understand carb impact.',
        'Feat: Serve meals to customers and receive feedback and a score.',
    ],
  },
];