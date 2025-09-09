import express from 'express';
import { PaymentController } from '../controllers/PaymentController';

export const createPaymentRoutes = (paymentController: PaymentController) => {
  const router = express.Router();

  router.post('/payments', (req, res) => paymentController.processPayment(req, res));
  router.get('/payments/:id', (req, res) => paymentController.getPayment(req, res)); 
  router.get('/invoices/:invoiceId/payments', (req, res) => paymentController.getPaymentsByInvoice(req, res)); 
  router.get('/clients/:clientId/payments', (req, res) => paymentController.getPaymentsByClient(req, res)); 
  router.get('/payments/status/:status', (req, res) => paymentController.getPaymentsByStatus(req, res)); 
  router.patch('/payments/:id/status', (req, res) => paymentController.updatePaymentStatus(req, res)); 
  router.post('/payments/:id/refund', (req, res) => paymentController.processRefund(req, res)); 
  router.get('/payments/stats/revenue', (req, res) => paymentController.getRevenueStats(req, res)); 
  router.get('/payments/stats/daily-revenue', (req, res) => paymentController.getDailyRevenue(req, res));

  return router;
};
