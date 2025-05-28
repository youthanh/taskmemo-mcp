import { promises as fs } from 'fs';
import { join } from 'path';
import { Storage, StorageData } from './storage.js';
import { Project } from '../models/project.js';
import { Task } from '../models/task.js';
import { Subtask } from '../models/subtask.js';

/**
 * File-based storage implementation using JSON with project-specific directories
 */
export class FileStorage implements Storage {
  private workingDirectory: string;
  private storageDir: string;
  private dataFile: string;
  private data: StorageData;

  constructor(workingDirectory: string) {
    this.workingDirectory = workingDirectory;
    this.storageDir = join(workingDirectory, '.agentic-tools-mcp', 'tasks');
    this.dataFile = join(this.storageDir, 'tasks.json');
    this.data = {
      projects: [],
      tasks: [],
      subtasks: []
    };
  }

  /**
   * Initialize storage by validating working directory and loading data from file
   */
  async initialize(): Promise<void> {
    try {
      // Validate that working directory exists
      await fs.access(this.workingDirectory);
    } catch (error) {
      throw new Error(`Working directory does not exist or is not accessible: ${this.workingDirectory}`);
    }

    try {
      // Ensure .agentic-tools-mcp/tasks directory exists
      await fs.mkdir(this.storageDir, { recursive: true });

      // Try to load existing data
      const fileContent = await fs.readFile(this.dataFile, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      await this.save();
    }
  }

  /**
   * Save data to file
   */
  private async save(): Promise<void> {
    await fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return [...this.data.projects];
  }

  async getProject(id: string): Promise<Project | null> {
    return this.data.projects.find(p => p.id === id) || null;
  }

  async createProject(project: Project): Promise<Project> {
    this.data.projects.push(project);
    await this.save();
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const index = this.data.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.projects[index] = { ...this.data.projects[index], ...updates };
    await this.save();
    return this.data.projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.data.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.data.projects.splice(index, 1);
    // Also delete all related tasks and subtasks
    await this.deleteTasksByProject(id);
    await this.deleteSubtasksByProject(id);
    await this.save();
    return true;
  }

  // Task operations
  async getTasks(projectId?: string): Promise<Task[]> {
    if (projectId) {
      return this.data.tasks.filter(t => t.projectId === projectId);
    }
    return [...this.data.tasks];
  }

  async getTask(id: string): Promise<Task | null> {
    return this.data.tasks.find(t => t.id === id) || null;
  }

  async createTask(task: Task): Promise<Task> {
    this.data.tasks.push(task);
    await this.save();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.data.tasks[index] = { ...this.data.tasks[index], ...updates };
    await this.save();
    return this.data.tasks[index];
  }

  async deleteTask(id: string): Promise<boolean> {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.data.tasks.splice(index, 1);
    // Also delete all related subtasks
    await this.deleteSubtasksByTask(id);
    await this.save();
    return true;
  }

  async deleteTasksByProject(projectId: string): Promise<number> {
    const tasksToDelete = this.data.tasks.filter(t => t.projectId === projectId);
    this.data.tasks = this.data.tasks.filter(t => t.projectId !== projectId);

    // Delete subtasks for each deleted task
    for (const task of tasksToDelete) {
      await this.deleteSubtasksByTask(task.id);
    }

    return tasksToDelete.length;
  }

  // Subtask operations
  async getSubtasks(taskId?: string, projectId?: string): Promise<Subtask[]> {
    let subtasks = [...this.data.subtasks];

    if (taskId) {
      subtasks = subtasks.filter(s => s.taskId === taskId);
    }

    if (projectId) {
      subtasks = subtasks.filter(s => s.projectId === projectId);
    }

    return subtasks;
  }

  async getSubtask(id: string): Promise<Subtask | null> {
    return this.data.subtasks.find(s => s.id === id) || null;
  }

  async createSubtask(subtask: Subtask): Promise<Subtask> {
    this.data.subtasks.push(subtask);
    await this.save();
    return subtask;
  }

  async updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask | null> {
    const index = this.data.subtasks.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.subtasks[index] = { ...this.data.subtasks[index], ...updates };
    await this.save();
    return this.data.subtasks[index];
  }

  async deleteSubtask(id: string): Promise<boolean> {
    const index = this.data.subtasks.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.data.subtasks.splice(index, 1);
    await this.save();
    return true;
  }

  async deleteSubtasksByTask(taskId: string): Promise<number> {
    const subtasksToDelete = this.data.subtasks.filter(s => s.taskId === taskId);
    this.data.subtasks = this.data.subtasks.filter(s => s.taskId !== taskId);
    return subtasksToDelete.length;
  }

  async deleteSubtasksByProject(projectId: string): Promise<number> {
    const subtasksToDelete = this.data.subtasks.filter(s => s.projectId === projectId);
    this.data.subtasks = this.data.subtasks.filter(s => s.projectId !== projectId);
    return subtasksToDelete.length;
  }
}
