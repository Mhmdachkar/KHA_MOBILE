/**
 * Single source of truth for recharge / Alfa card SKUs (retail prices).
 * Used by Recharges page and Checkout dropdowns.
 */

import recharge1_67 from "@/assets/recharges/1.67$.png";
import recharge3_79 from "@/assets/recharges/3.79$.png";
import recharge4_50 from "@/assets/recharges/4.50$.png";
import recharge7_58 from "@/assets/recharges/7.58$.png";
import recharge10 from "@/assets/recharges/10$.png";
import recharge15_15 from "@/assets/recharges/15.15$.png";
import recharge22_73 from "@/assets/recharges/22.73$.png";
import recharge77_28 from "@/assets/recharges/77.28$.png";
import rechargeStart4_50 from "@/assets/recharges/start4.50$.png";
import rechargeSmart7_50 from "@/assets/recharges/smart7.50$.png";
import rechargeSuper13_50 from "@/assets/recharges/super13.50$.png";
import recharge30days from "@/assets/recharges/days/30days.png";
import recharge60days from "@/assets/recharges/days/60days.png";
import recharge90days from "@/assets/recharges/days/90days.png";
import recharge180days from "@/assets/recharges/days/180days.png";
import recharge360days from "@/assets/recharges/days/360days.png";
import alfa3_03 from "@/assets/recharges/alfa/3.03$.png";
import alfa4_50 from "@/assets/recharges/alfa/4.50$.png";
import alfa7_58 from "@/assets/recharges/alfa/7.58$.png";
import alfa10_00 from "@/assets/recharges/alfa/10.00$.png";
import alfa15_15 from "@/assets/recharges/alfa/15.15$.png";
import alfa22_73 from "@/assets/recharges/alfa/22.73$.png";
import alfa77_28 from "@/assets/recharges/alfa/77.28$.png";
import alfa1GB from "@/assets/recharges/alfa/1GB.png";
import alfa7GB from "@/assets/recharges/alfa/7GB.png";
import alfa22GB from "@/assets/recharges/alfa/22GB.png";
import alfa44GB from "@/assets/recharges/alfa/44GB.png";
import alfa77GB from "@/assets/recharges/alfa/77GB.png";

export interface RechargeCardItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

/** Canonical catalog — retail selling prices (aligned with Recharges page). */
export const RECHARGE_CATALOG: RechargeCardItem[] = [
  { id: 1, name: "Touch $1.67 Card", price: 1.67, image: recharge1_67, category: "Touch Cards" },
  { id: 2, name: "Touch $3.79 Card", price: 3.79, image: recharge3_79, category: "Touch Cards" },
  { id: 3, name: "Touch $4.50 Card", price: 7, image: recharge4_50, category: "Touch Cards" },
  { id: 4, name: "Touch Start $4.50 Card", price: 7, image: rechargeStart4_50, category: "Touch Cards" },
  { id: 5, name: "Touch $7.58 Card", price: 10, image: recharge7_58, category: "Touch Cards" },
  { id: 6, name: "Touch Smart $7.50 Card", price: 10, image: rechargeSmart7_50, category: "Touch Cards" },
  { id: 7, name: "Touch $10 Card", price: 15, image: recharge10, category: "Touch Cards" },
  { id: 8, name: "Touch Super $13.50 Card", price: 20, image: rechargeSuper13_50, category: "Touch Cards" },
  { id: 9, name: "Touch $15.15 Card", price: 20, image: recharge15_15, category: "Touch Cards" },
  { id: 10, name: "Touch $22.73 Card", price: 30, image: recharge22_73, category: "Touch Cards" },
  { id: 11, name: "Touch $77.28 Card", price: 100, image: recharge77_28, category: "Touch Cards" },
  { id: 12, name: "30 Days Card", price: 3.34, image: recharge30days, category: "Days Cards" },
  { id: 13, name: "60 Days Card", price: 6.66, image: recharge60days, category: "Days Cards" },
  { id: 14, name: "90 Days Card", price: 10, image: recharge90days, category: "Days Cards" },
  { id: 15, name: "180 Days Card", price: 20, image: recharge180days, category: "Days Cards" },
  { id: 16, name: "360 Days Card", price: 40, image: recharge360days, category: "Days Cards" },
  { id: 17, name: "Alfa $3.03 Card", price: 5, image: alfa3_03, category: "Alfa Cards" },
  { id: 18, name: "Alfa $4.50 Card", price: 7, image: alfa4_50, category: "Alfa Cards" },
  { id: 19, name: "Alfa $7.58 Card", price: 10, image: alfa7_58, category: "Alfa Cards" },
  { id: 20, name: "Alfa $10 Card", price: 15, image: alfa10_00, category: "Alfa Cards" },
  { id: 21, name: "Alfa $15.15 Card", price: 20, image: alfa15_15, category: "Alfa Cards" },
  { id: 22, name: "Alfa $22.73 Card", price: 30, image: alfa22_73, category: "Alfa Cards" },
  { id: 23, name: "Alfa $77.28 Card", price: 100, image: alfa77_28, category: "Alfa Cards" },
  { id: 24, name: "Alfa Gift 1GB", price: 6, image: alfa1GB, category: "Alfa Gift" },
  { id: 25, name: "Alfa Gift 7GB", price: 13, image: alfa7GB, category: "Alfa Gift" },
  { id: 26, name: "Alfa Gift 22GB", price: 20, image: alfa22GB, category: "Alfa Gift" },
  { id: 27, name: "Alfa Gift 44GB", price: 27, image: alfa44GB, category: "Alfa Gift" },
  { id: 28, name: "Alfa Gift 77GB", price: 40, image: alfa77GB, category: "Alfa Gift" },
];

export const TOUCH_RECHARGE_CARDS = RECHARGE_CATALOG.filter((c) => c.category === "Touch Cards");
export const DAYS_RECHARGE_CARDS = RECHARGE_CATALOG.filter((c) => c.category === "Days Cards");
export const ALFA_RECHARGE_CARDS = RECHARGE_CATALOG.filter((c) => c.category === "Alfa Cards");
export const ALFA_GIFT_CARDS = RECHARGE_CATALOG.filter((c) => c.category === "Alfa Gift");

export function getRechargeCardById(id: number): RechargeCardItem | undefined {
  return RECHARGE_CATALOG.find((c) => c.id === id);
}
