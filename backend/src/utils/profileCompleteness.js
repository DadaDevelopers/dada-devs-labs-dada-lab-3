//profile completeness helper
export function beneficiaryProfileCompleteness(user) {
  const p = user.beneficiaryProfile || {};

  const required = [
    p.displayName,
    p.shortStory,
    user.phoneNumber,
    user.country,
    p.consentContact?.agreed
  ];

  const completed = required.filter(Boolean).length;

  return {
    completed,
    total: required.length,
    percent: Math.round((completed / required.length) * 100),
    isComplete: completed === required.length
  };
}
