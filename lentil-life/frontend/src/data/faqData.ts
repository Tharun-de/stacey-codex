import { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "How do I place an order?",
    answer: "You can place an order directly through our website by visiting the Menu page, selecting your items, and filling out the order form. You'll receive an order number that you'll need to reference when making your Venmo payment.",
    category: "ordering"
  },
  {
    id: 2,
    question: "How does payment work?",
    answer: "We currently accept payments via Venmo only. After placing your order, you'll receive an order number. Please send your payment to our Venmo handle (@YourVenmoHere) and include your order number in the payment note. Once we verify your payment, we'll send you an order confirmation.",
    category: "payment"
  },
  {
    id: 3,
    question: "When will my order be ready?",
    answer: "Your order will be prepared for the pickup time you selected during checkout. We'll send you a confirmation email once your payment has been verified, which will include your exact pickup details.",
    category: "ordering"
  },
  {
    id: 4,
    question: "Do you cater to dietary restrictions?",
    answer: "Yes! Our menu is designed with various dietary needs in mind. You can use the filters on our Menu page to view items that are vegan, vegetarian, gluten-free, or dairy-free. We also list all ingredients for each item for transparency.",
    category: "food"
  },
  {
    id: 5,
    question: "What makes your packaging sustainable?",
    answer: "We use 100% compostable packaging made from plant-based materials. Our wraps are served in paper wraps that break down within 90 days in commercial composting facilities, and our bowls are made from reclaimed bamboo fiber.",
    category: "sustainability"
  },
  {
    id: 6,
    question: "Where do you source your ingredients?",
    answer: "We partner with local farms within a 50-mile radius to source fresh produce. Our grains and legumes come from organic suppliers, and we prioritize fair-trade certified products whenever possible.",
    category: "sustainability"
  }
];