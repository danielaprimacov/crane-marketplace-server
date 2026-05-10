const messageService = require("../services/message.service");

const {
  toMessageDto,
  toMessageConfirmationDto,
} = require("../dtos/message.dto");

async function getAdminMessages(req, res, next) {
  try {
    const messages = await messageService.getAllMessages();

    res.status(200).json(messages.map(toMessageDto));
  } catch (error) {
    next(error);
  }
}

async function createMessage(req, res, next) {
  try {
    const result = await messageService.createMessage(req.body);

    if (result.honeypotTriggered) {
      return res.status(200).json({ message: "Message accepted" });
    }

    res.status(201).json({
      message: "Message sent successfully.",
      data: toMessageConfirmationDto(result.message),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdminMessage(req, res, next) {
  try {
    await messageService.deleteMessage(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { getAdminMessages, createMessage, deleteAdminMessage };
