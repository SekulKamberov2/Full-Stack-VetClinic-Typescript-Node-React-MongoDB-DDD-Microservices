import express from 'express';
import { InvoiceController } from '../controllers/InvoiceController';

export const createInvoiceRoutes = (invoiceController: InvoiceController) => {
  const router = express.Router();

  router.post('/invoices', (req, res) => invoiceController.createInvoice(req, res));
  router.get('/invoices', (req, res) => invoiceController.getAllInvoices(req, res));
  router.get('/invoices/:id', (req, res) => invoiceController.getInvoice(req, res));
  router.get('/clients/:clientId/invoices', (req, res) => invoiceController.getClientInvoices(req, res));

  return router;
};