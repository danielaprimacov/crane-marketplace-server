const inquiryService = require("../services/inquiry.service");

const {
  toInquiryConfirmationDto,
  toAdminInquiryDto,
} = require("../dtos/inquiry.dto");

async function createInquiry(req, res, next) {
  try {
    const newInquiry = await inquiryService.createInquiry(req.body);

    res.status(201).json(toInquiryConfirmationDto(newInquiry));
  } catch (error) {
    next(error);
  }
}

async function getAdminInquiries(req, res, next) {
  try {
    const inquiries = await inquiryService.getAllInquiriesForAdmin();

    res.status(200).json(inquiries.map(toAdminInquiryDto));
  } catch (error) {
    next(error);
  }
}

async function getAdminInquiryById(req, res, next) {
  try {
    const { inquiryId } = req.params;

    const inquiry = await inquiryService.getInquiryByIdForAdmin(inquiryId);

    res.status(200).json(toAdminInquiryDto(inquiry));
  } catch (error) {
    next(error);
  }
}

async function updateAdminInquiry(req, res, next) {
  try {
    const { inquiryId } = req.params;

    const updatedInquiry = await inquiryService.updateInquiry(
      inquiryId,
      req.body
    );

    res.status(200).json(toAdminInquiryDto(updatedInquiry));
  } catch (error) {
    next(error);
  }
}

async function deleteAdminInquiry(req, res, next) {
  try {
    const { inquiryId } = req.params;

    await inquiryService.deleteInquiry(inquiryId);

    res.status(200).json({
      message: `Inquiry with id ${inquiryId} was deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createInquiry,
  getAdminInquiries,
  getAdminInquiryById,
  updateAdminInquiry,
  deleteAdminInquiry,
};
