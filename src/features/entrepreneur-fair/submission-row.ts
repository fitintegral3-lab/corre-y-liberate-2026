import type { FairResponse } from './schema';

export function toFairSubmission(data: FairResponse, consentVersion: string) {
  return {
    submission_id: data.submissionId,
    full_name: data.fullName,
    identification: data.identification,
    age: data.age,
    phone: data.phone,
    email: data.email,
    neighborhood: data.neighborhood,
    head_of_household: data.headOfHousehold,
    business_name: data.businessName,
    products: data.products,
    activities: [...new Set(data.activities)],
    other_activity: data.activities.includes('Otro') ? data.otherActivity : null,
    operating_time: data.operatingTime,
    team_size: data.teamSize,
    formalization: data.formalization,
    instagram: data.instagram || null,
    facebook: data.facebook || null,
    whatsapp: data.whatsapp || null,
    notes: data.notes || null,
    consent_version: consentVersion,
  };
}
