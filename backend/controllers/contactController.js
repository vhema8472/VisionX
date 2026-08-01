const ContactMessage = require('../models/ContactMessage');

// @desc    Submit contact message
// @route   POST /api/contact
exports.submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    const newMessage = await ContactMessage.create({
      userId: req.user ? req.user.userId : '',
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      status: 'new'
    });

    return res.status(201).json({
      success: true,
      message: 'Message received! We will respond shortly.',
      contactMessage: newMessage
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/admin/contact
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch contact messages' });
  }
};

// @desc    Update message status (Admin)
// @route   PUT /api/admin/contact/:id
exports.updateMessageStatus = async (req, res) => {
  try {
    const msgId = req.params.id;
    const { status } = req.body;

    const updated = await ContactMessage.findByIdAndUpdate(msgId, { status }, { new: true });
    return res.status(200).json({ success: true, message: 'Status updated', contactMessage: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update message status' });
  }
};
