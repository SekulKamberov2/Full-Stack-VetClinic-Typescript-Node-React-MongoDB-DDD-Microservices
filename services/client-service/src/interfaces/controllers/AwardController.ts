import { Request, Response } from 'express';
import { GrantAwardUseCase } from '../../application/use-cases/awards/GrantAwardUseCase';
import { GetPetAwardsUseCase } from '../../application/use-cases/awards/GetPetAwardsUseCase';
import { GetAwardUseCase } from '../../application/use-cases/awards/GetAwardUseCase';
import { UpdateAwardUseCase } from '../../application/use-cases/awards/UpdateAwardUseCase';
import { RevokeAwardUseCase } from '../../application/use-cases/awards/RevokeAwardUseCase';
import { GetClientAwardsUseCase } from '../../application/use-cases/awards/GetClientAwardsUseCase';
import { GetAllAwardsUseCase } from '../../application/use-cases/awards/GetAllAwardsUseCase';
import { GetAwardStatsUseCase } from '../../application/use-cases/awards/GetAwardStatsUseCase';

export class AwardController {
  constructor(
    private grantAwardUseCase: GrantAwardUseCase,
    private getPetAwardsUseCase: GetPetAwardsUseCase,
    private getAwardUseCase: GetAwardUseCase,
    private updateAwardUseCase: UpdateAwardUseCase,
    private revokeAwardUseCase: RevokeAwardUseCase,
    private getClientAwardsUseCase: GetClientAwardsUseCase,
    private getAllAwardsUseCase: GetAllAwardsUseCase,
    private getAwardStatsUseCase: GetAwardStatsUseCase
  ) {}

  async grantAward(req: Request, res: Response): Promise<void> {
    try {
      const { petId } = req.params;
      const awardData = { ...req.body, petId };
      const award = await this.grantAwardUseCase.execute(awardData);
      res.status(201).json({
        success: true,
        data: award,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPetAwards(req: Request, res: Response): Promise<void> {
    try {
      const awards = await this.getPetAwardsUseCase.execute(req.params.petId);
      res.json({
        success: true,
        data: awards,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAward(req: Request, res: Response): Promise<void> {
    try {
      const award = await this.getAwardUseCase.execute(req.params.id);
      if (!award) {
        res.status(404).json({
          success: false,
          message: 'Award not found',
        });
        return;
      }
      res.json({
        success: true,
        data: award,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateAward(req: Request, res: Response): Promise<void> {
    try {
      const award = await this.updateAwardUseCase.execute(req.params.id, req.body);
      res.json({
        success: true,
        data: award,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async revokeAward(req: Request, res: Response): Promise<void> {
    try {
      const award = await this.revokeAwardUseCase.execute(req.params.id);
      res.json({
        success: true,
        data: award,
        message: 'Award revoked successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getClientAwards(req: Request, res: Response): Promise<void> {
    try {
      const awards = await this.getClientAwardsUseCase.execute(req.params.clientId);
      res.json({
        success: true,
        data: awards,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllAwards(_req: Request, res: Response): Promise<void> {
    try {
      const awards = await this.getAllAwardsUseCase.execute();
      res.json({
        success: true,
        data: awards,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAwardStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getAwardStatsUseCase.execute();
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
}
