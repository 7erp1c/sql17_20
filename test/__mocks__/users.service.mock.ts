import { UsersService } from '../../src/features/users/application/users.service';
import { DateCreate } from '../../src/base/adapters/get-current-date';
import { BcryptAdapter } from '../../src/base/adapters/bcrypt.adapter';
import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';

export class UserServiceMock extends UsersService {
  constructor(
    usersRepository: UsersRepository,
    bcryptAdapter: BcryptAdapter,
    dateCreate: DateCreate,
  ) {
    super(usersRepository, bcryptAdapter, dateCreate);
  }
  sendEmail() {
    // Здесь можно добавить логику мокирования, если нужно
    return Promise.resolve(true);
  }
}
