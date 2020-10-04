import { PipeTransform, BadRequestException } from "@nestjs/common";
import { TaskStatus } from '../task-status.enum';

// we can create a non-default constructor with parameters for configuration and setup for the custom pipe
export class TaskStatusValidationPipe implements PipeTransform {

    readonly AllowedStatuses: TaskStatus[] = [
        TaskStatus.DONE,
        TaskStatus.IN_PROGRESS,
        TaskStatus.OPEN
    ];

    transform(value: any) {
        const upperValue = value.toUpperCase();
        if (!this.isStatusValid(upperValue)) {
            throw new BadRequestException(`Invalid task status input.`)
        }
        return upperValue;
    }

    private isStatusValid(value: any): boolean {
        const idx = this.AllowedStatuses.indexOf(value);
        return idx !== -1;
    }

}