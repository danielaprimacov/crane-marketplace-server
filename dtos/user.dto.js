function toAuthUserDto(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    privacy: {
      termsAcceptedAt: user.privacy?.termsAcceptedAt || null,
      privacyPolicyAcceptedAt: user.privacy?.privacyPolicyAcceptedAt || null,
      privacyPolicyVersion: user.privacy?.privacyPolicyVersion || null,
      marketingConsent: Boolean(user.privacy?.marketingConsent),
      marketingConsentAt: user.privacy?.marketingConsentAt || null,
    },
    createdAt: user.createdAt,
    updatedAd: user.updatedAt,
  };
}

function toPublicUserDto(user) {
  if (!user) return null;

  return {
    id: user._id?.toString(),
    name: user.name,
  };
}

function toAdminUserDto(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAd: user.updatedAt,
  };
}

module.exports = { toAuthUserDto, toPublicUserDto, toAdminUserDto };
