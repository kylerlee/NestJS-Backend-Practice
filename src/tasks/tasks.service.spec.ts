import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { Test } from '@nestjs/testing';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockUser = { id: 1, username: 'Test user' };
const mockTask = { title: 'Test task', description: 'Test desc' };

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn(),
});

describe('TasksService', () => {
    let tasksService
    let taskRepository

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useFactory: mockTaskRepository }
            ],
        }).compile();

        tasksService = module.get<TasksService>(TasksService);
        taskRepository = module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('gets all tasks from the repository', async () => {
            taskRepository.getTasks.mockResolvedValue('someValue');

            expect(taskRepository.getTasks).not.toHaveBeenCalled();

            const filters: GetTasksFilterDto = {
                status: TaskStatus.IN_PROGRESS,
                search: 'Some search query'
            };

            const result = await tasksService.getTasks(filters, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalled();

            expect(result).toEqual('someValue');
        });
    });

    describe('getTaskById', () => {
        it('calls taskRepository.findOne() and return the task found', async () => {
            taskRepository.findOne.mockResolvedValue(mockTask);

            const result = await tasksService.getTaskById(1, mockUser);
            expect(result).toEqual(mockTask);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: mockUser.id,
                },
            });
        });

        it('throw an error as task is not found', async () => {
            taskRepository.findOne.mockResolvedValue(null);
            await expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    })

    describe('createTask', () => {
        it('calls taskRepository.createTask and return the newly created task', async () => {
            const mockTaskDto: CreateTaskDto = {
                title: mockTask.title,
                description: mockTask.description,
            };
            taskRepository.createTask.mockResolvedValue(mockTask);

            const result = await tasksService.createTask(mockTaskDto, mockUser);
            expect(result).toEqual(mockTask);

            expect(taskRepository.createTask).toHaveBeenCalledWith(mockTaskDto, mockUser);
        });
    });

    describe('deleteTask', () => {
        it('calls taskRepository.delete() to delete a task', async () => {
            taskRepository.delete.mockResolvedValue({ affected: 1 });
            expect(taskRepository.delete).not.toHaveBeenCalled();
            await tasksService.deleteTask(1, mockUser);
            expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
        });

        it('throw an error as task could not be found', async () => {
            taskRepository.delete.mockResolvedValue({ affected: 0 });
            await expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTaskStatus', () => {
        it('updates a task status', async () => {
            tasksService.getTaskById = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
                save: jest.fn().mockResolvedValue(true),
            });

            expect(tasksService.getTaskById).not.toHaveBeenCalled();
            const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
            expect(tasksService.getTaskById).toHaveBeenCalled();
            expect(result.status).toEqual(TaskStatus.DONE);
            expect(result.save).toHaveBeenCalled();
        })
    })
});