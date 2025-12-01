
import { ItineraryItem, Expense, ShoppingItem, Restaurant, SightseeingSpot } from '../types';

// We keep the types but empty the data, as data now comes from Firestore.
// You can use these to seed the database once if needed, but for now we start empty.

export const INITIAL_ITINERARY: ItineraryItem[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_SHOPPING: ShoppingItem[] = [];
export const INITIAL_RESTAURANTS: Restaurant[] = [];
export const INITIAL_SIGHTSEEING: SightseeingSpot[] = [];
