import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter';
import { DateCreate } from '../../../base/adapters/get-current-date';
import { TestingRepository } from '../infrastructure/testing.repository';

@Injectable()
export class TestingService {
  constructor(private readonly testingRepository: TestingRepository) {}

  async deleteAllData() {
    try {
      //this.testingRepository.dropDb();
      await this.testingRepository.deleteAll();
      return;
    } catch {
      console.log('main method has failed, try additional method');
      await this.testingRepository.deleteAll();
    }
  }
}
