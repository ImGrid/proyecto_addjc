import { PartialType } from '@nestjs/mapped-types';
import { CreateTestFisicoDto } from './create-test-fisico.dto';

export class UpdateTestFisicoDto extends PartialType(CreateTestFisicoDto) {}
