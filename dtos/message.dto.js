function toMessageDto(message) {
  return {
    id: message._id.toString(),

    formType: message.formType,

    email: message.email,
    phone: message.phone,

    salutation: message.salutation,
    firstName: message.firstName,
    lastName: message.lastName,
    country: message.country,
    message: message.message,

    name: message.name,
    company: message.company,
    projectDetails: message.projectDetails,

    topics: message.topics,
    agreeComm: message.agreeComm,
    agreeNewsletter: message.agreeNewsletter,
    recaptchaVerified: message.recaptchaVerified,
    consentTimestamp: message.consentTimestamp,

    isRead: message.isRead,

    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function toMessageConfirmationDto(message) {
  return {
    id: message._id.toString(),
    formType: message.formType,
    createdAt: message.createdAt,
  };
}

module.exports = {
  toMessageDto,
  toMessageConfirmationDto,
};
