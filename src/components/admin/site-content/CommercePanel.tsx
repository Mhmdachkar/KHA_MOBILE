import { Input } from "@/components/ui/input";
import { Field, SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function CommercePanel({
  deliveryFee,
  setDeliveryFee,
  freeShippingThreshold,
  setFreeShippingThreshold,
  whatsappNumber,
  setWhatsappNumber,
  instagramUrl,
  setInstagramUrl,
  facebookUrl,
  setFacebookUrl,
  saving,
  saveCommerce,
}: SiteContentPanelProps) {

  return (
    <div className="space-y-5 min-w-0">
      <p className="text-sm text-muted-foreground">
        Checkout shipping and WhatsApp contact. Values must match what customers see at checkout.
      </p>
      <SectionCard title="Storefront commerce">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Field label="Delivery fee (USD)">
            <Input
              type="number"
              min={0}
              step={0.01}
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
            />
          </Field>
          <Field label="Free shipping threshold (USD)">
            <Input
              type="number"
              min={0}
              step={1}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
            />
          </Field>
          <Field label="WhatsApp number" hint="Digits only with country code.">
            <Input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="96181861811"
            />
          </Field>
          <Field label="Instagram URL">
            <Input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/yourshop"
            />
          </Field>
          <Field label="Facebook URL">
            <Input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/yourshop"
            />
          </Field>
        </div>
      </SectionCard>
      <SaveBar
        label="Save Commerce Settings"
        disabled={saving}
        onClick={() => void (saveCommerce?.() ?? Promise.resolve())}
      />
    </div>
  );
}
