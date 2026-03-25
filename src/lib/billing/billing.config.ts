export type PlanId = 'lite' | 'dedicated' | 'fam';

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: string;
  limit: number | null;
  color: string;
  priceId: string | null;
  interval: string | null;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  lite:      { id: 'lite',      name: 'Foodie Lite',      price: 'Free',    limit: 10,   color: '#888',    priceId: null,             interval: null },
  dedicated: { id: 'dedicated', name: 'Dedicated Foodie', price: '₹99/mo',  limit: 30,   color: '#00D4FF', priceId: 'price_mock_1',   interval: 'month' },
  fam:       { id: 'fam',       name: 'Foodie Fam',       price: '₹249/mo', limit: null, color: '#FF6B00', priceId: 'price_mock_2',   interval: 'month' },
};
