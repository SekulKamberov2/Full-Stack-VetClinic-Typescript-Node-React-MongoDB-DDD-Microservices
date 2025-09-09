"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordController = void 0;
class MedicalRecordController {
    constructor(createMedicalRecordUseCase, getMedicalRecordByIdUseCase, getRecordsByPatientUseCase, getRecordsByClientUseCase, getRecordsByVeterinarianUseCase, getAllMedicalRecordsUseCase, updateMedicalRecordUseCase, deleteMedicalRecordUseCase) {
        this.createMedicalRecordUseCase = createMedicalRecordUseCase;
        this.getMedicalRecordByIdUseCase = getMedicalRecordByIdUseCase;
        this.getRecordsByPatientUseCase = getRecordsByPatientUseCase;
        this.getRecordsByClientUseCase = getRecordsByClientUseCase;
        this.getRecordsByVeterinarianUseCase = getRecordsByVeterinarianUseCase;
        this.getAllMedicalRecordsUseCase = getAllMedicalRecordsUseCase;
        this.updateMedicalRecordUseCase = updateMedicalRecordUseCase;
        this.deleteMedicalRecordUseCase = deleteMedicalRecordUseCase;
    }
    async createMedicalRecord(req, res) {
        try {
            const { patientId, clientId, veterinarianId, appointmentId, notes, diagnoses, treatments, prescriptions } = req.body;
            console.log('Received data:', {
                patientId,
                clientId,
                veterinarianId,
                appointmentId,
                notes,
                diagnosesCount: diagnoses?.length || 0,
                treatmentsCount: treatments?.length || 0,
                prescriptionsCount: prescriptions?.length || 0
            });
            const record = await this.createMedicalRecordUseCase.execute({
                patientId,
                clientId,
                veterinarianId,
                appointmentId,
                notes,
                diagnoses,
                treatments,
                prescriptions
            });
            res.status(201).json({
                message: "Medical record created successfully",
                recordId: record.id,
                record: {
                    id: record.id,
                    patientId: record.patientId,
                    clientId: record.clientId,
                    veterinarianId: record.veterinarianId,
                    appointmentId: record.appointmentId,
                    notes: record.notes,
                    diagnoses: record.diagnoses.map(d => ({
                        id: d.id,
                        description: d.description,
                        date: d.date,
                        notes: d.notes
                    })),
                    treatments: record.treatments.map(t => ({
                        id: t.id,
                        name: t.name,
                        description: t.description,
                        date: t.date,
                        cost: t.cost
                    })),
                    prescriptions: record.prescriptions.map(p => ({
                        id: p.id,
                        medicationName: p.medicationName,
                        dosage: p.dosage,
                        instructions: p.instructions,
                        status: p.status
                    })),
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getById(req, res) {
        try {
            const { recordId } = req.params;
            const requestingUserId = req.user?.id;
            const requestingUserRole = req.user?.role;
            const record = await this.getMedicalRecordByIdUseCase.execute({
                recordId,
                requestingUserId,
                requestingUserRole
            });
            res.status(200).json({
                id: record.id,
                patientId: record.patientId,
                clientId: record.clientId,
                veterinarianId: record.veterinarianId,
                appointmentId: record.appointmentId,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                notes: record.notes,
                diagnoses: record.diagnoses,
                treatments: record.treatments,
                prescriptions: record.prescriptions
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getByPatientId(req, res) {
        try {
            const { patientId } = req.params;
            const { page, limit } = req.query;
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 50;
            if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
                res.status(400).json({
                    error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
                });
                return;
            }
            const result = await this.getRecordsByPatientUseCase.execute(patientId, pageNumber, limitNumber);
            res.status(200).json(result);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getByClientId(req, res) {
        try {
            const { clientId } = req.params;
            const { page, limit } = req.query;
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 50;
            if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
                res.status(400).json({
                    error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
                });
                return;
            }
            const result = await this.getRecordsByClientUseCase.execute(clientId, pageNumber, limitNumber);
            res.status(200).json(result);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getByVeterinarianId(req, res) {
        try {
            const { veterinarianId } = req.params;
            const { page, limit } = req.query;
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 50;
            if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
                res.status(400).json({
                    error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
                });
                return;
            }
            const result = await this.getRecordsByVeterinarianUseCase.execute(veterinarianId, pageNumber, limitNumber);
            res.status(200).json(result);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getAllRecords(req, res) {
        try {
            const { page, limit, patientId, clientId, veterinarianId, dateFrom, dateTo } = req.query;
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 50;
            if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
                res.status(400).json({
                    error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100"
                });
                return;
            }
            const filters = {};
            if (patientId)
                filters.patientId = patientId;
            if (clientId)
                filters.clientId = clientId;
            if (veterinarianId)
                filters.veterinarianId = veterinarianId;
            if (dateFrom) {
                const dateFromObj = new Date(dateFrom);
                if (isNaN(dateFromObj.getTime())) {
                    res.status(400).json({ error: "Invalid dateFrom format. Use ISO date format" });
                    return;
                }
                filters.dateFrom = dateFromObj;
            }
            if (dateTo) {
                const dateToObj = new Date(dateTo);
                if (isNaN(dateToObj.getTime())) {
                    res.status(400).json({ error: "Invalid dateTo format. Use ISO date format" });
                    return;
                }
                filters.dateTo = dateToObj;
            }
            const options = { page: pageNumber, limit: limitNumber };
            if (Object.keys(filters).length > 0) {
                options.filters = filters;
            }
            const result = await this.getAllMedicalRecordsUseCase.execute(options);
            res.status(200).json(result);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async updateMedicalRecord(req, res) {
        try {
            const { recordId } = req.params;
            const { notes, diagnoses, treatments, prescriptions } = req.body;
            if (notes === undefined && diagnoses === undefined &&
                treatments === undefined && prescriptions === undefined) {
                res.status(400).json({ error: "No fields provided for update" });
                return;
            }
            await this.updateMedicalRecordUseCase.execute(recordId, {
                notes,
                diagnoses,
                treatments,
                prescriptions
            });
            res.status(200).json({
                message: "Medical record updated successfully",
                recordId
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async deleteMedicalRecord(req, res) {
        try {
            const { recordId } = req.params;
            await this.deleteMedicalRecordUseCase.execute(recordId);
            res.status(200).json({
                message: "Medical record deleted successfully",
                recordId
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    handleError(res, error) {
        console.error('MedicalRecordController error:', error);
        if (error.message.includes("not found")) {
            res.status(404).json({ error: error.message });
        }
        else if (error.message.includes("already exists") ||
            error.message.includes("invalid") ||
            error.message.includes("required") ||
            error.message.includes("Missing")) {
            res.status(400).json({ error: error.message });
        }
        else if (error.message.includes("Unauthorized")) {
            res.status(403).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.MedicalRecordController = MedicalRecordController;
//# sourceMappingURL=MedicalRecordController.js.map