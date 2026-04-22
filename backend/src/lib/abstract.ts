export interface PhoneValidationResult {
  valid: boolean;
  carrier: string | null;
  type: string | null;
  location: string | null;
  format: {
    international: string | null;
  };
}

export async function validatePhone(
  phone: string,
  apiKey: string
): Promise<PhoneValidationResult | null> {
  try {
    const res = await fetch(
      `https://phoneintelligence.abstractapi.com/v1/?api_key=${apiKey}&phone=${phone}`
    );
    if (!res.ok) return null;
    const data = await res.json() as any;

    return {
      valid: data.phone_validation?.is_valid ?? false,
      carrier: data.phone_carrier?.name ?? null,
      type: data.phone_carrier?.line_type ?? null,
      location: data.phone_location?.city ?? data.phone_location?.country_name ?? null,
      format: {
        international: data.phone_format?.international ?? null,
      },
    };
  } catch {
    return null;
  }
}