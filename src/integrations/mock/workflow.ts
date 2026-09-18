// ============================================================
// Mock Workflow Provider
// ============================================================
import { WorkflowProvider, WorkflowTriggerResult, WorkflowStatus } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const executions = new Map<string, WorkflowStatus>();

export class MockWorkflowProvider implements WorkflowProvider {
  async trigger(workflowId: string, payload: Record<string, unknown>): Promise<WorkflowTriggerResult> {
    const executionId = `exec-${uuidv4().slice(0, 8)}`;
    executions.set(executionId, {
      executionId,
      status: 'COMPLETED',
      result: { workflowId, processedAt: new Date().toISOString(), ...payload },
    });
    return { executionId, status: 'COMPLETED' };
  }

  async getStatus(executionId: string): Promise<WorkflowStatus> {
    return executions.get(executionId) || { executionId, status: 'NOT_FOUND' };
  }
}
