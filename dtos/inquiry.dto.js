function toCraneSummaryDto(crane) {
  if (!crane) return null;

  return {
    id: crane._id?.toString(),
    title: crane.title,
    producer: crane.producer,
    seriesCode: crane.seriesCode,
    capacityClassNumber: crane.capacityClassNumber,
    variantRevision: crane.variantRevision,
    status: crane.status,
    location: crane.location,
  };
}

function toInquiryConfirmationDto(inquiry) {
  return {
    id: inquiry._id.toString(),
    status: inquiry.status,
    isRead: inquiry.isRead,
    crane: inquiry.crane?.toString?.() || inquiry.crane,
    createdAt: inquiry.createdAt,
  };
}

function toAdminInquiryDto(inquiry) {
  return {
    id: inquiry._id.toString(),

    customerName: inquiry.customerName,
    email: inquiry.email,
    message: inquiry.message,

    crane: toCraneSummaryDto(inquiry.crane),

    period: inquiry.period,
    address: inquiry.address,

    needsTransport: inquiry.needsTransport,
    needsInstallation: inquiry.needsInstallation,

    status: inquiry.status,
    isRead: inquiry.isRead,

    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
  };
}

module.exports = {
  toInquiryConfirmationDto,
  toAdminInquiryDto,
};
