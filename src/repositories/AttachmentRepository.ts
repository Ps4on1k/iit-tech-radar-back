import { Repository } from 'typeorm';
import { AppDataSource } from '../database';
import { TechRadarAttachmentEntity } from '../models/TechRadarAttachmentEntity';

export interface IAttachmentRepository {
  findById(id: string): Promise<TechRadarAttachmentEntity | undefined>;
  findByTechRadarId(techRadarId: string): Promise<TechRadarAttachmentEntity[]>;
  create(data: Partial<TechRadarAttachmentEntity>): Promise<TechRadarAttachmentEntity>;
  delete(id: string): Promise<boolean>;
  deleteByTechRadarId(techRadarId: string): Promise<void>;
}

export class AttachmentRepository implements IAttachmentRepository {
  private repository: Repository<TechRadarAttachmentEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TechRadarAttachmentEntity);
  }

  async findById(id: string): Promise<TechRadarAttachmentEntity | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    return result ?? undefined;
  }

  async findByTechRadarId(techRadarId: string): Promise<TechRadarAttachmentEntity[]> {
    return this.repository.find({
      where: { techRadarId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: Partial<TechRadarAttachmentEntity>): Promise<TechRadarAttachmentEntity> {
    const attachment = this.repository.create(data);
    return this.repository.save(attachment);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }

  async deleteByTechRadarId(techRadarId: string): Promise<void> {
    await this.repository.delete({ techRadarId });
  }
}
