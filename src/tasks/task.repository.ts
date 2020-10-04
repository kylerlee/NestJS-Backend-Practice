import { Repository, EntityRepository, DeleteResult } from "typeorm";
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from "../auth/user.entity";
import { GetUser } from "../auth/get-user.decorator";

@EntityRepository(Task)
export class TaskRepository extends Repository<Task>{
    private logger = new Logger('TaskRepository');

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;

        const task = new Task();
        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        task.user = user;

        try {
            await task.save();
        } catch (error) {
            this.logger.error(`User "${user.username}" failed to create a new task. Data: ${JSON.stringify(createTaskDto)}`, error.stack);
            throw new InternalServerErrorException();
        }
        // to hide the user information when return the response
        delete task.user;
        return task;
    }

    async getTasks(getTasksFilterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = getTasksFilterDto;
        const query = this.createQueryBuilder('task');

        query.where('task.userId = :userId', { userId: user.id });

        if (status) {
            query.andWhere('task.status = :status', { status: status.toUpperCase() });
        }

        if (search) {
            query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${search}%` });
        }

        try {
            const tasks = await query.getMany();
            return tasks;
        }
        catch (error) {
            this.logger.error(`Failed to get tasks for user "${user.username}". Filter: ${JSON.stringify(getTasksFilterDto)}`, error.stack);
            throw new InternalServerErrorException();
        }
    }

}