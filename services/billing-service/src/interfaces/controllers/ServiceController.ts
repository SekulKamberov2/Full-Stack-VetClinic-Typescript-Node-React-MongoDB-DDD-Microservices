import { Request, Response } from 'express';
import { CreateServiceUseCase } from '../../application/use-cases/CreateServiceUseCase';
import { GetServiceUseCase } from '../../application/use-cases/GetServiceUseCase';
import { GetAllServicesUseCase } from '../../application/use-cases/GetAllServicesUseCase';
import { GetServicesByCategoryUseCase } from '../../application/use-cases/GetServicesByCategoryUseCase';
 
import { UpdateServiceUseCase } from '../../application/use-cases/UpdateServiceUseCase';
import { DeleteServiceUseCase } from '../../application/use-cases/DeleteServiceUseCase';
import { GetServiceStatsUseCase } from '../../application/use-cases/GetServiceStatsUseCase';
import { FindServiceByNameUseCase } from '../../application/use-cases/FindServiceByNameUseCase';
import { FindServicesByPriceRangeUseCase } from '../../application/use-cases/FindServicesByPriceRangeUseCase';
import { FindAllActiveServicesUseCase } from '../../application/use-cases/FindAllActiveServicesUseCase';
import { ReactivateServiceUseCase } from '../../application/use-cases/ReactivateServiceUseCase';
import { ServiceCategory } from '../../domain/repositories/ServiceRepository';
import { Service } from '../../domain/entities/Service';

export class ServiceController {
  constructor(
    private createServiceUseCase: CreateServiceUseCase,
    private getServiceUseCase: GetServiceUseCase,
    private getAllServicesUseCase: GetAllServicesUseCase,
    private getServicesByCategoryUseCase: GetServicesByCategoryUseCase,
  
    private updateServiceUseCase: UpdateServiceUseCase,
    private deleteServiceUseCase: DeleteServiceUseCase,
    private getServiceStatsUseCase: GetServiceStatsUseCase,
    private findServiceByNameUseCase: FindServiceByNameUseCase,
    private findServicesByPriceRangeUseCase: FindServicesByPriceRangeUseCase,
    private findAllActiveServicesUseCase: FindAllActiveServicesUseCase,
    private reactivateServiceUseCase: ReactivateServiceUseCase
  ) {}

    private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
  
  async createService(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.createServiceUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getService(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.getServiceUseCase.execute(req.params.id);
      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }
      res.json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllServices(_req: Request, res: Response): Promise<void> {
    try {
      const services = await this.getAllServicesUseCase.execute();
      res.json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getServicesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = req.params.category as ServiceCategory;
      const services = await this.getServicesByCategoryUseCase.execute(category);
      res.json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchServices(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({ 
          success: false,
          error: 'Search query is required' 
        });
        return;
      }

      if (q.length < 2) {
        res.status(400).json({ 
          success: false,
          error: 'Search query must be at least 2 characters long' 
        });
        return;
      }
  
      const services = await (this.createServiceUseCase as any).serviceRepository.searchServices(q);
      
      res.json({
        success: true,
        data: services.map((service: Service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          duration: service.duration,
          price: service.price,
          isActive: service.isActive 
        })),
        meta: {
          total: services.length,
          query: q
        }
      });
    } catch (error) {
      const errorMessage = this.handleError(error);
      res.status(500).json({ 
        success: false,
        error: errorMessage 
      });
    }
  }

  async updateService(req: Request, res: Response): Promise<void> {
    try {
      const service = await this.updateServiceUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Service updated successfully',
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteServiceUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Service deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getServiceStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getServiceStatsUseCase.execute();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findServiceByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.query; 
      if (!name || typeof name !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Service name is required',
        });
        return;
      }
      
      const service = await this.findServiceByNameUseCase.execute(name);
      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }
      
      res.json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findServicesByPriceRange(req: Request, res: Response): Promise<void> {
    try {
      const { min, max } = req.query;
      const minPrice = min ? Number(min) : 0;
      const maxPrice = max ? Number(max) : Number.MAX_SAFE_INTEGER;
      
      if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < minPrice) {
        res.status(400).json({
          success: false,
          message: 'Invalid price range',
        });
        return;
      }
      
      const services = await this.findServicesByPriceRangeUseCase.execute(minPrice, maxPrice);
      res.json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findAllActiveServices(_req: Request, res: Response): Promise<void> {
    try {
      const services = await this.findAllActiveServicesUseCase.execute();
      res.json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async reactivateService(req: Request, res: Response): Promise<void> {
    try {
      await this.reactivateServiceUseCase.execute(req.params.id);
      res.json({
        success: true,
        message: 'Service reactivated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}